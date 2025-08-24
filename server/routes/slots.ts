import { RequestHandler } from "express";
import { BGamingProvider } from "./slotProviders/bgaming";
import { PragmaticPlayProvider } from "./slotProviders/pragmaticPlay";
import { FreeSlotsGamesProvider } from "./slotProviders/freeSlotsGames";
import { IdevGamesProvider } from "./slotProviders/idevGames";
import { BaseSlotProvider, GameLaunchParams, ProviderGameListParams } from "../../shared/slotProviders";
import { testSlotProviders, validateSweepstakesCompliance } from "../utils/testSlotProviders";

// Initialize providers
const providers = new Map<string, BaseSlotProvider>();

// Environment variables for API keys (should be set via environment)
const BGAMING_API_KEY = process.env.BGAMING_API_KEY || 'demo-key';
const BGAMING_OPERATOR_ID = process.env.BGAMING_OPERATOR_ID || 'demo-operator';
const PRAGMATIC_API_KEY = process.env.PRAGMATIC_API_KEY || 'demo-key';
const PRAGMATIC_OPERATOR_ID = process.env.PRAGMATIC_OPERATOR_ID || 'demo-operator';
const PRAGMATIC_SECURE_LOGIN = process.env.PRAGMATIC_SECURE_LOGIN || 'demo-login';

// Initialize providers
providers.set('bgaming', new BGamingProvider(BGAMING_API_KEY, BGAMING_OPERATOR_ID));
providers.set('pragmaticplay', new PragmaticPlayProvider(PRAGMATIC_API_KEY, PRAGMATIC_OPERATOR_ID, PRAGMATIC_SECURE_LOGIN));

// Active sessions storage (in production, use Redis or database)
const activeSessions = new Map<string, any>();

// Get all available slot providers
export const getProviders: RequestHandler = async (req, res) => {
  try {
    const providerList = Array.from(providers.values()).map(provider => ({
      ...provider.getProvider(),
      isActive: provider.isActive(),
    }));

    res.json({
      success: true,
      providers: providerList,
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get providers',
    });
  }
};

// Get games from all providers or specific provider
export const getGames: RequestHandler = async (req, res) => {
  try {
    const { providerId, category, limit = 50, offset = 0, search, sortBy, sortOrder } = req.query;

    const params: ProviderGameListParams = {
      category: category as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      search: search as string,
      sortBy: sortBy as 'name' | 'popularity' | 'rtp' | 'releaseDate',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    if (providerId && typeof providerId === 'string') {
      // Get games from specific provider
      const provider = providers.get(providerId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          error: 'Provider not found',
        });
      }

      const result = await provider.getGames(params);
      res.json(result);
    } else {
      // Get games from all active providers
      const allGames: any[] = [];
      let totalGames = 0;

      for (const [id, provider] of providers) {
        if (provider.isActive()) {
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
      }

      // Sort combined results
      if (params.sortBy) {
        allGames.sort((a, b) => {
          let aVal = a[params.sortBy!];
          let bVal = b[params.sortBy!];
          
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply pagination to combined results
      const paginatedGames = allGames.slice(params.offset, params.offset + params.limit);

      res.json({
        success: true,
        games: paginatedGames,
        total: totalGames,
        hasMore: params.offset + params.limit < allGames.length,
      });
    }
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get games',
    });
  }
};

// Get specific game by ID and provider
export const getGameById: RequestHandler = async (req, res) => {
  try {
    const { providerId, gameId } = req.params;

    const provider = providers.get(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
    }

    const game = await provider.getGameById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
      });
    }

    res.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error('Get game by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game',
    });
  }
};

// Launch game iframe
export const launchGame: RequestHandler = async (req, res) => {
  try {
    const { gameId, providerId, playerId, currency, mode, language, returnUrl } = req.body;

    // Validate required parameters
    if (!gameId || !providerId || !playerId || !currency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
      });
    }

    const provider = providers.get(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
    }

    if (!provider.isActive()) {
      return res.status(503).json({
        success: false,
        error: 'Provider is currently unavailable',
      });
    }

    if (!provider.supportsCurrency(currency)) {
      return res.status(400).json({
        success: false,
        error: `Provider does not support ${currency} currency`,
      });
    }

    // Generate session ID
    const sessionId = `${playerId}-${gameId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const launchParams: GameLaunchParams = {
      gameId,
      playerId,
      currency,
      mode: mode || 'real',
      language: language || 'en',
      returnUrl: returnUrl || req.headers.referer,
      sessionId,
    };

    const result = await provider.launchGame(launchParams);

    if (result.success) {
      // Store session information
      activeSessions.set(result.sessionToken!, {
        sessionId,
        playerId,
        gameId,
        providerId,
        currency,
        mode: launchParams.mode,
        startTime: Date.now(),
        isActive: true,
      });

      // Set session timeout (30 minutes)
      setTimeout(() => {
        activeSessions.delete(result.sessionToken!);
      }, 30 * 60 * 1000);
    }

    res.json(result);
  } catch (error) {
    console.error('Launch game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to launch game',
    });
  }
};

// Validate game session
export const validateSession: RequestHandler = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Session token required',
      });
    }

    const sessionData = activeSessions.get(sessionToken);
    if (!sessionData) {
      return res.json({
        success: true,
        valid: false,
        reason: 'Session not found',
      });
    }

    // Check if session has expired (30 minutes)
    const sessionAge = Date.now() - sessionData.startTime;
    if (sessionAge > 30 * 60 * 1000) {
      activeSessions.delete(sessionToken);
      return res.json({
        success: true,
        valid: false,
        reason: 'Session expired',
      });
    }

    // Validate with provider
    const provider = providers.get(sessionData.providerId);
    if (!provider) {
      return res.json({
        success: true,
        valid: false,
        reason: 'Provider not found',
      });
    }

    const isValid = await provider.validateSession(sessionToken);

    res.json({
      success: true,
      valid: isValid && sessionData.isActive,
      sessionData: isValid ? sessionData : undefined,
    });
  } catch (error) {
    console.error('Validate session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate session',
    });
  }
};

// End game session
export const endSession: RequestHandler = async (req, res) => {
  try {
    const { sessionToken, playTime, gameId } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Session token required',
      });
    }

    const sessionData = activeSessions.get(sessionToken);
    if (sessionData) {
      sessionData.isActive = false;
      sessionData.endTime = Date.now();
      sessionData.playTime = playTime;
      
      // Log session for analytics
      console.log('Game session ended:', {
        playerId: sessionData.playerId,
        gameId: sessionData.gameId,
        providerId: sessionData.providerId,
        duration: playTime,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
      });

      // Remove from active sessions after a delay to allow for any final API calls
      setTimeout(() => {
        activeSessions.delete(sessionToken);
      }, 5000);
    }

    res.json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session',
    });
  }
};

// Get player balance from provider
export const getPlayerBalance: RequestHandler = async (req, res) => {
  try {
    const { providerId, playerId } = req.params;

    const provider = providers.get(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
    }

    const balance = await provider.getPlayerBalance(playerId);
    if (!balance) {
      return res.status(404).json({
        success: false,
        error: 'Player balance not found',
      });
    }

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error('Get player balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get player balance',
    });
  }
};

// Get active sessions (for admin/debugging)
export const getActiveSessions: RequestHandler = async (req, res) => {
  try {
    const sessions = Array.from(activeSessions.entries()).map(([token, data]) => ({
      sessionToken: token,
      ...data,
      age: Date.now() - data.startTime,
    }));

    res.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions',
    });
  }
};

// Health check for providers
export const checkProviderHealth: RequestHandler = async (req, res) => {
  try {
    const healthChecks = await Promise.all(
      Array.from(providers.entries()).map(async ([id, provider]) => {
        try {
          // Simple test to check if provider is responding
          const testResult = await provider.getGames({ limit: 1 });
          return {
            providerId: id,
            isHealthy: testResult.success,
            isActive: provider.isActive(),
            error: testResult.error,
          };
        } catch (error) {
          return {
            providerId: id,
            isHealthy: false,
            isActive: provider.isActive(),
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    res.json({
      success: true,
      providers: healthChecks,
      overallHealth: healthChecks.every(check => check.isHealthy),
    });
  } catch (error) {
    console.error('Provider health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check provider health',
    });
  }
};

// Test slot provider integration
export const testProviders: RequestHandler = async (req, res) => {
  try {
    const providerTests = await testSlotProviders();
    const complianceTests = validateSweepstakesCompliance();

    const allTests = [...providerTests, ...complianceTests];
    const passedTests = allTests.filter(t => t.success).length;

    res.json({
      success: true,
      summary: {
        total: allTests.length,
        passed: passedTests,
        failed: allTests.length - passedTests,
        overallSuccess: passedTests === allTests.length,
      },
      tests: {
        providers: providerTests,
        compliance: complianceTests,
      },
    });
  } catch (error) {
    console.error('Provider test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run provider tests',
    });
  }
};
