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

export class FreeSlotsGamesProvider extends BaseSlotProvider {

  constructor() {
    const provider: SlotProvider = {
      id: 'freeslotsgames',
      name: 'freeslotsgames',
      displayName: 'Free-Slots.Games',
      isActive: true,
      apiEndpoint: 'https://free-slots.games',
      websiteUrl: 'https://free-slots.games',
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

    super(provider, 'free', 'free-slots-games');
  }

  async getGames(params?: ProviderGameListParams): Promise<ProviderGameListResponse> {
    try {
      // Static list of popular free slots from Free-Slots.Games
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
      console.error('Free-Slots.Games getGames error:', error);
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

      // Generate iframe URL for Free-Slots.Games
      const iframeUrl = `https://free-slots.games/game/${params.gameId}?mode=free&embed=1`;

      return {
        success: true,
        iframeUrl: iframeUrl,
        sessionToken: `free-${params.playerId}-${params.gameId}-${Date.now()}`,
      };
    } catch (error) {
      console.error('Free-Slots.Games launchGame error:', error);
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
    return sessionToken.startsWith('free-');
  }

  private getStaticGameList(): SlotGame[] {
    return [
      {
        id: 'book-of-ra',
        providerId: 'freeslotsgames',
        name: 'Book of Ra',
        slug: 'book-of-ra',
        thumbnailUrl: 'https://free-slots.games/media/slots/book-of-ra.jpg',
        category: 'adventure',
        tags: ['egypt', 'adventure', 'bonus', 'freespins'],
        minBet: 0,
        maxBet: 0,
        rtp: 95.1,
        volatility: 'high',
        paylines: 9,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: false,
        releaseDate: '2020-01-01T00:00:00Z',
        description: 'Embark on an Egyptian adventure in this classic slot game featuring ancient treasures and free spins.',
        features: ['Free Spins', 'Expanding Symbols', 'Gamble Feature', 'Wild Symbols'],
      },
      {
        id: 'starburst',
        providerId: 'freeslotsgames',
        name: 'Starburst',
        slug: 'starburst',
        thumbnailUrl: 'https://free-slots.games/media/slots/starburst.jpg',
        category: 'space',
        tags: ['space', 'gems', 'classic', 'wilds'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.1,
        volatility: 'low',
        paylines: 10,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: false,
        hasBonus: false,
        hasJackpot: false,
        releaseDate: '2019-01-01T00:00:00Z',
        description: 'A cosmic slot adventure with expanding wild stars and vibrant gemstones.',
        features: ['Expanding Wilds', 'Re-spins', 'Both Ways Pay', 'Cosmic Theme'],
      },
      {
        id: 'gonzo-quest',
        providerId: 'freeslotsgames',
        name: "Gonzo's Quest",
        slug: 'gonzo-quest',
        thumbnailUrl: 'https://free-slots.games/media/slots/gonzo-quest.jpg',
        category: 'adventure',
        tags: ['adventure', 'aztec', 'avalanche', 'multiplier'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.0,
        volatility: 'medium',
        paylines: 20,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: false,
        releaseDate: '2019-06-01T00:00:00Z',
        description: 'Join Gonzo on his quest for Eldorado gold with cascading reels and multipliers.',
        features: ['Avalanche Reels', 'Multipliers', 'Free Falls', 'Wild Symbols'],
      },
      {
        id: 'mega-moolah',
        providerId: 'freeslotsgames',
        name: 'Mega Moolah',
        slug: 'mega-moolah',
        thumbnailUrl: 'https://free-slots.games/media/slots/mega-moolah.jpg',
        category: 'animals',
        tags: ['safari', 'jackpot', 'animals', 'progressive'],
        minBet: 0,
        maxBet: 0,
        rtp: 88.1,
        volatility: 'high',
        paylines: 25,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: true,
        releaseDate: '2018-01-01T00:00:00Z',
        description: 'The legendary progressive jackpot slot with African safari theme.',
        features: ['Progressive Jackpot', 'Free Spins', 'Wild Symbols', 'Safari Theme'],
      },
      {
        id: 'dead-or-alive',
        providerId: 'freeslotsgames',
        name: 'Dead or Alive',
        slug: 'dead-or-alive',
        thumbnailUrl: 'https://free-slots.games/media/slots/dead-or-alive.jpg',
        category: 'western',
        tags: ['western', 'cowboys', 'freespins', 'sticky-wilds'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.8,
        volatility: 'high',
        paylines: 9,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: false,
        hasJackpot: false,
        releaseDate: '2019-03-01T00:00:00Z',
        description: 'Wild West adventure with sticky wilds and explosive free spins.',
        features: ['Sticky Wilds', 'Free Spins', 'Western Theme', 'High Volatility'],
      },
      {
        id: 'jack-and-the-beanstalk',
        providerId: 'freeslotsgames',
        name: 'Jack and the Beanstalk',
        slug: 'jack-and-the-beanstalk',
        thumbnailUrl: 'https://free-slots.games/media/slots/jack-beanstalk.jpg',
        category: 'fantasy',
        tags: ['fairy-tale', 'walking-wilds', 'freespins', 'fantasy'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.3,
        volatility: 'medium',
        paylines: 20,
        reels: 5,
        isPopular: false,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: false,
        releaseDate: '2020-05-01T00:00:00Z',
        description: 'Climb the magical beanstalk with Jack in this enchanting fairy tale slot.',
        features: ['Walking Wilds', 'Free Spins', 'Treasure Collection', 'Fairy Tale Theme'],
      },
      {
        id: 'twin-spin',
        providerId: 'freeslotsgames',
        name: 'Twin Spin',
        slug: 'twin-spin',
        thumbnailUrl: 'https://free-slots.games/media/slots/twin-spin.jpg',
        category: 'classic',
        tags: ['retro', 'classic', 'twin-reels', 'modern'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.6,
        volatility: 'medium',
        paylines: 243,
        reels: 5,
        isPopular: false,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: false,
        hasBonus: false,
        hasJackpot: false,
        releaseDate: '2019-09-01T00:00:00Z',
        description: 'Classic retro slot with modern twin reel mechanics and 243 ways to win.',
        features: ['Twin Reels', '243 Ways to Win', 'Retro Theme', 'Linked Reels'],
      },
      {
        id: 'immortal-romance',
        providerId: 'freeslotsgames',
        name: 'Immortal Romance',
        slug: 'immortal-romance',
        thumbnailUrl: 'https://free-slots.games/media/slots/immortal-romance.jpg',
        category: 'horror',
        tags: ['vampire', 'romance', 'freespins', 'chamber-bonus'],
        minBet: 0,
        maxBet: 0,
        rtp: 96.9,
        volatility: 'medium',
        paylines: 243,
        reels: 5,
        isPopular: true,
        isNew: false,
        isMobileOptimized: true,
        hasFreespins: true,
        hasBonus: true,
        hasJackpot: false,
        releaseDate: '2018-07-01T00:00:00Z',
        description: 'A dark romance featuring vampires with multiple free spin chambers.',
        features: ['Chamber of Spins', 'Wild Desire', 'Multiple Free Spins', 'Vampire Theme'],
      },
    ];
  }
}
