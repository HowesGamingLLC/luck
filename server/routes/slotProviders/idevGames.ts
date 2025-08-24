import { 
  BaseSlotProvider, 
  SlotProvider, 
  SlotGame, 
  GameLaunchParams, 
  GameLaunchResponse, 
  ProviderGameListParams, 
  ProviderGameListResponse,
  ProviderBalance,
} from '../../../shared/slotProviders';

export class IdevGamesProvider extends BaseSlotProvider {

  constructor() {
    const provider: SlotProvider = {
      id: 'idevgames',
      name: 'idevgames',
      displayName: 'iDev.Games',
      isActive: true,
      apiEndpoint: 'https://idev.games',
      websiteUrl: 'https://idev.games',
      supportedCurrencies: ['GC'], // Only free play
      features: {
        hasIframe: true,
        hasAPI: false, // Static game list
        supportsThumbnails: true,
        supportsFreeMoney: true,
        supportsSweepstakes: false, // Free games only
        supportsAutoplay: true,
        supportsMobileOptimized: true,
      }
    };

    super(provider, 'free', 'idev-games');
  }

  async getGames(params?: ProviderGameListParams): Promise<ProviderGameListResponse> {
    try {
      // Static list of HTML5 games from iDev.Games
      const staticGames = this.getStaticGameList();
      
      let filteredGames = [...staticGames];

      // Apply filters
      if (params?.search) {
        const query = params.search.toLowerCase();
        filteredGames = filteredGames.filter(game =>
          game.name.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (params?.category && params.category !== 'all') {
        filteredGames = filteredGames.filter(game => game.category === params.category);
      }

      // Apply sorting
      if (params?.sortBy) {
        filteredGames.sort((a, b) => {
          let aVal: any = a[params.sortBy! as keyof SlotGame];
          let bVal: any = b[params.sortBy! as keyof SlotGame];

          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();

          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply pagination
      const offset = params?.offset || 0;
      const limit = params?.limit || 50;
      const paginatedGames = filteredGames.slice(offset, offset + limit);

      return {
        success: true,
        games: paginatedGames,
        total: filteredGames.length,
        hasMore: offset + limit < filteredGames.length,
      };
    } catch (error) {
      console.error('iDev.Games getGames error:', error);
      return {
        success: false,
        games: [],
        total: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getGameById(gameId: string): Promise<SlotGame | null> {
    const games = this.getStaticGameList();
    return games.find(game => game.id === gameId) || null;
  }

  async launchGame(params: GameLaunchParams): Promise<GameLaunchResponse> {
    try {
      const game = await this.getGameById(params.gameId);
      if (!game) {
        return {
          success: false,
          error: 'Game not found',
        };
      }

      // Generate iframe URL for iDev.Games
      const iframeUrl = `https://idev.games/embed/${params.gameId}`;

      return {
        success: true,
        iframeUrl: iframeUrl,
        sessionToken: `idev-${params.playerId}-${params.gameId}-${Date.now()}`,
      };
    } catch (error) {
      console.error('iDev.Games launchGame error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Launch failed',
      };
    }
  }

  async getPlayerBalance(playerId: string): Promise<ProviderBalance | null> {
    // Free games don't track balance - return unlimited free credits
    return {
      playerId: playerId,
      goldCoins: 999999, // Unlimited free credits
      sweepCoins: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  async validateSession(sessionToken: string): Promise<boolean> {
    // Free games sessions are always valid
    return sessionToken.startsWith('idev-');
  }

  private getStaticGameList(): SlotGame[] {
    return [
      {
        id: 'casino-slot-machine',
        providerId: 'idevgames',
        name: 'Casino Slot Machine',
        slug: 'casino-slot-machine',
        thumbnailUrl: 'https://idev.games/img/games/casino-slot-machine.jpg',
        category: 'casino',
        tags: ['classic', 'casino', 'fruit', 'html5'],
        minBet: 0,
        maxBet: 0,
        rtp: 95.0,
        volatility: 'medium',
        paylines: 5,
        reels: 3,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: false,
        hasBonus: false,
        hasJackpot: false,
        releaseDate: '2023-01-01T00:00:00Z',
        description: 'Classic 3-reel casino slot machine with traditional fruit symbols.',
        features: ['Classic Reels', 'Fruit Symbols', 'HTML5', 'Mobile Optimized'],
      },
      {
        id: 'lucky-wheel',
        providerId: 'idevgames',
        name: 'Lucky Wheel',
        slug: 'lucky-wheel',
        thumbnailUrl: 'https://idev.games/img/games/lucky-wheel.jpg',
        category: 'wheel',
        tags: ['wheel', 'fortune', 'lucky', 'spin'],
        minBet: 0,
        maxBet: 0,
        rtp: 94.0,
        volatility: 'low',
        paylines: 1,
        reels: 1,
        isPopular: false,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: false,
        hasBonus: false,
        hasJackpot: true,
        releaseDate: '2023-02-01T00:00:00Z',
        description: 'Spin the wheel of fortune for exciting prizes and jackpots.',
        features: ['Wheel of Fortune', 'Jackpot', 'Simple Gameplay', 'Lucky Spin'],
      },
      {
        id: 'fruit-machine',
        providerId: 'idevgames',
        name: 'Fruit Machine',
        slug: 'fruit-machine',
        thumbnailUrl: 'https://idev.games/img/games/fruit-machine.jpg',
        category: 'fruit',
        tags: ['fruit', 'classic', 'traditional', 'retro'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.0,
        volatility: 'medium',
        paylines: 3,
        reels: 3,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: false,
        hasBonus: true,
        hasJackpot: false,
        releaseDate: '2022-12-01T00:00:00Z',
        description: 'Traditional fruit machine with classic symbols and bonus features.',
        features: ['Traditional Fruits', 'Bonus Features', 'Classic Design', 'Retro Style'],
      },
      {
        id: 'diamond-slots',
        providerId: 'idevgames',
        name: 'Diamond Slots',
        slug: 'diamond-slots',
        thumbnailUrl: 'https://idev.games/img/games/diamond-slots.jpg',
        category: 'gems',
        tags: ['diamonds', 'gems', 'luxury', 'sparkle'],
        minBet: 0,
        maxBet: 0,
        rtp: 95.5,
        volatility: 'high',
        paylines: 25,
        reels: 5,
        isPopular: false,
        isNew: true,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: false,
        releaseDate: '2024-01-01T00:00:00Z',
        description: 'Sparkling diamond slot with luxury gems and exciting bonus rounds.',
        features: ['Diamond Wilds', 'Free Spins', 'Gem Symbols', 'Luxury Theme'],
      },
      {
        id: 'vegas-slots',
        providerId: 'idevgames',
        name: 'Vegas Slots',
        slug: 'vegas-slots',
        thumbnailUrl: 'https://idev.games/img/games/vegas-slots.jpg',
        category: 'vegas',
        tags: ['vegas', 'casino', 'neon', 'entertainment'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.2,
        volatility: 'medium',
        paylines: 20,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: true,
        releaseDate: '2023-06-01T00:00:00Z',
        description: 'Experience the excitement of Las Vegas with neon lights and big wins.',
        features: ['Vegas Theme', 'Neon Lights', 'Jackpot', 'Entertainment'],
      },
    ];
  }
}
