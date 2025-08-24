import { RequestHandler } from "express";
import { FreeSlotsGamesProvider } from "./slotProviders/freeSlotsGames";
import { IdevGamesProvider } from "./slotProviders/idevGames";

// Initialize free providers for public API
const freeProviders = new Map();
freeProviders.set("freeslotsgames", new FreeSlotsGamesProvider());
freeProviders.set("idevgames", new IdevGamesProvider());

// Rate limiting storage (in production, use Redis)
const apiUsage = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// Rate limiting middleware
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const usage = apiUsage.get(clientId);

  if (!usage || now > usage.resetTime) {
    // Reset or create new usage record
    apiUsage.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (usage.count >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  usage.count++;
  return true;
}

// Get client identifier
function getClientId(req: any): string {
  return req.ip || req.connection.remoteAddress || "unknown";
}

// Public API: Get free slot providers
export const getPublicProviders: RequestHandler = async (req, res) => {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId)) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      limit: RATE_LIMIT,
      window: "1 hour",
    });
  }

  try {
    const providerList = Array.from(freeProviders.values()).map((provider) => ({
      ...provider.getProvider(),
      isActive: provider.isActive(),
    }));

    res.json({
      success: true,
      providers: providerList,
      meta: {
        total: providerList.length,
        type: "free_games_only",
        license: "Free for non-commercial use",
        attribution: "Powered by CoinKrazy.com",
      },
    });
  } catch (error) {
    console.error("Public API get providers error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Public API: Get free slot games
export const getPublicGames: RequestHandler = async (req, res) => {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId)) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      limit: RATE_LIMIT,
      window: "1 hour",
    });
  }

  try {
    const { providerId, category, limit = 20, offset = 0, search } = req.query;

    const params = {
      category: category as string,
      limit: Math.min(parseInt(limit as string) || 20, 50), // Max 50 per request
      offset: parseInt(offset as string) || 0,
      search: search as string,
      sortBy: "name" as const,
      sortOrder: "asc" as const,
    };

    if (providerId && typeof providerId === "string") {
      // Get games from specific free provider
      const provider = freeProviders.get(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: "Free provider not found",
        });
      }

      const result = await provider.getGames(params);
      res.json({
        ...result,
        meta: {
          provider: providerId,
          type: "free_games_only",
          license: "Free for non-commercial use",
          attribution: "Powered by CoinKrazy.com",
        },
      });
    } else {
      // Get games from all free providers
      const allGames: any[] = [];
      let totalGames = 0;

      for (const [id, provider] of freeProviders) {
        try {
          const result = await provider.getGames(params);
          if (result.success) {
            allGames.push(...result.games);
            totalGames += result.total;
          }
        } catch (error) {
          console.error(`Error getting games from ${id}:`, error);
        }
      }

      // Apply pagination to combined results
      const paginatedGames = allGames.slice(
        params.offset,
        params.offset + params.limit,
      );

      res.json({
        success: true,
        games: paginatedGames,
        total: totalGames,
        hasMore: params.offset + params.limit < allGames.length,
        meta: {
          providers: Array.from(freeProviders.keys()),
          type: "free_games_only",
          license: "Free for non-commercial use",
          attribution: "Powered by CoinKrazy.com",
        },
      });
    }
  } catch (error) {
    console.error("Public API get games error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Public API: Get game details
export const getPublicGameDetails: RequestHandler = async (req, res) => {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId)) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      limit: RATE_LIMIT,
      window: "1 hour",
    });
  }

  try {
    const { providerId, gameId } = req.params;

    const provider = freeProviders.get(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Free provider not found",
      });
    }

    const game = await provider.getGameById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Game not found",
      });
    }

    res.json({
      success: true,
      game,
      meta: {
        provider: providerId,
        type: "free_game",
        license: "Free for non-commercial use",
        attribution: "Powered by CoinKrazy.com",
      },
    });
  } catch (error) {
    console.error("Public API get game details error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Public API: Get embed URL for game
export const getPublicGameEmbed: RequestHandler = async (req, res) => {
  const clientId = getClientId(req);

  if (!checkRateLimit(clientId)) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      limit: RATE_LIMIT,
      window: "1 hour",
    });
  }

  try {
    const { providerId, gameId } = req.params;
    const { width = 800, height = 600 } = req.query;

    const provider = freeProviders.get(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: "Free provider not found",
      });
    }

    const game = await provider.getGameById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: "Game not found",
      });
    }

    // Generate embed URL
    const launchResult = await provider.launchGame({
      gameId,
      playerId: "public-api-user",
      currency: "GC",
      mode: "real",
      language: "en",
    });

    if (!launchResult.success || !launchResult.iframeUrl) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate embed URL",
      });
    }

    const embedCode = `<!-- CoinKrazy.com Free Slot Game Embed -->
<div style="position: relative; width: ${width}px; height: ${height}px; max-width: 100%;">
    <iframe 
        src="${launchResult.iframeUrl}" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        scrolling="no"
        allowfullscreen
        style="border: 1px solid #ddd; border-radius: 8px;">
        Your browser does not support iframes.
    </iframe>
    <div style="font-size: 12px; text-align: right; margin-top: 4px;">
        <a href="https://cointrazy.com" target="_blank" style="color: #666; text-decoration: none;">
            Powered by CoinKrazy.com
        </a>
    </div>
</div>
<!-- End Embed Code -->`;

    res.json({
      success: true,
      embedCode,
      iframeUrl: launchResult.iframeUrl,
      dimensions: {
        width: parseInt(width as string),
        height: parseInt(height as string),
      },
      game: {
        id: game.id,
        name: game.name,
        provider: providerId,
      },
      meta: {
        type: "free_game_embed",
        license: "Free for non-commercial use",
        attribution: "Required - Powered by CoinKrazy.com",
      },
    });
  } catch (error) {
    console.error("Public API get embed error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Public API: Get API documentation
export const getPublicApiDocs: RequestHandler = async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  res.json({
    title: "CoinKrazy.com Free Slots Public API",
    version: "1.0.0",
    description:
      "Public API for accessing free slot games via iframe integration",
    license: "Free for non-commercial use",
    attribution: "Required - Powered by CoinKrazy.com",
    rateLimit: {
      limit: RATE_LIMIT,
      window: "1 hour",
    },
    endpoints: {
      providers: {
        url: `${baseUrl}/api/public/providers`,
        method: "GET",
        description: "Get list of available free slot providers",
      },
      games: {
        url: `${baseUrl}/api/public/games`,
        method: "GET",
        description: "Get list of free slot games",
        params: {
          providerId:
            "Optional - Filter by provider (freeslotsgames, idevgames)",
          category: "Optional - Filter by game category",
          search: "Optional - Search games by name",
          limit: "Optional - Max 50 (default: 20)",
          offset: "Optional - Pagination offset (default: 0)",
        },
      },
      gameDetails: {
        url: `${baseUrl}/api/public/games/:providerId/:gameId`,
        method: "GET",
        description: "Get detailed information about a specific game",
      },
      embed: {
        url: `${baseUrl}/api/public/embed/:providerId/:gameId`,
        method: "GET",
        description: "Get iframe embed code for a game",
        params: {
          width: "Optional - Embed width in pixels (default: 800)",
          height: "Optional - Embed height in pixels (default: 600)",
        },
      },
    },
    examples: {
      getAllGames: `${baseUrl}/api/public/games`,
      searchGames: `${baseUrl}/api/public/games?search=book&limit=5`,
      getGameDetails: `${baseUrl}/api/public/games/freeslotsgames/book-of-ra`,
      getEmbed: `${baseUrl}/api/public/embed/freeslotsgames/book-of-ra?width=800&height=600`,
    },
  });
};

// Get rate limit status
export const getRateLimitStatus: RequestHandler = async (req, res) => {
  const clientId = getClientId(req);
  const usage = apiUsage.get(clientId);
  const now = Date.now();

  if (!usage || now > usage.resetTime) {
    res.json({
      limit: RATE_LIMIT,
      remaining: RATE_LIMIT,
      resetTime: now + RATE_WINDOW,
      window: "1 hour",
    });
  } else {
    res.json({
      limit: RATE_LIMIT,
      remaining: Math.max(0, RATE_LIMIT - usage.count),
      resetTime: usage.resetTime,
      window: "1 hour",
    });
  }
};
