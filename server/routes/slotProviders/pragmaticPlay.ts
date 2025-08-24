import { 
  BaseSlotProvider, 
  SlotProvider, 
  SlotGame, 
  GameLaunchParams, 
  GameLaunchResponse, 
  ProviderGameListParams, 
  ProviderGameListResponse,
  ProviderBalance,
  ProviderBetResult
} from '@shared/slotProviders';

export class PragmaticPlayProvider extends BaseSlotProvider {
  private baseUrl: string;
  private secureLogin: string;

  constructor(apiKey: string, operatorId: string, secureLogin: string) {
    const provider: SlotProvider = {
      id: 'pragmaticplay',
      name: 'pragmaticplay',
      displayName: 'Pragmatic Play',
      isActive: true,
      apiEndpoint: 'https://api.pragmaticplay.net/gs2c',
      websiteUrl: 'https://www.pragmaticplay.com',
      supportedCurrencies: ['GC', 'SC'],
      features: {
        hasIframe: true,
        hasAPI: true,
        supportsThumbnails: true,
        supportsFreeMoney: true,
        supportsSweepstakes: true,
        supportsAutoplay: true,
        supportsMobileOptimized: true,
      }
    };

    super(provider, apiKey, operatorId);
    this.baseUrl = provider.apiEndpoint;
    this.secureLogin = secureLogin;
  }

  async getGames(params?: ProviderGameListParams): Promise<ProviderGameListResponse> {
    try {
      const requestData = {
        command: 'getGameList',
        hash: this.generateHash('getGameList'),
        ext: {
          provider: this.operatorId,
          category: params?.category || 'slots',
          limit: params?.limit || 50,
          offset: params?.offset || 0,
          search: params?.search,
          sortBy: params?.sortBy || 'name',
          sortOrder: params?.sortOrder || 'asc',
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Pragmatic Play API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error === 0) {
        return {
          success: true,
          games: this.transformPragmaticGames(data.gameList || []),
          total: data.total || data.gameList?.length || 0,
          hasMore: data.hasMore || false,
        };
      } else {
        throw new Error(data.description || 'API error');
      }
    } catch (error) {
      console.error('Pragmatic Play getGames error:', error);
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
    try {
      const requestData = {
        command: 'getGameInfo',
        hash: this.generateHash('getGameInfo'),
        ext: {
          provider: this.operatorId,
          gameId: gameId,
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Pragmatic Play API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error === 0 && data.gameInfo) {
        const transformedGames = this.transformPragmaticGames([data.gameInfo]);
        return transformedGames.length > 0 ? transformedGames[0] : null;
      }

      return null;
    } catch (error) {
      console.error('Pragmatic Play getGameById error:', error);
      return null;
    }
  }

  async launchGame(params: GameLaunchParams): Promise<GameLaunchResponse> {
    try {
      const requestData = {
        command: 'gameStart',
        hash: this.generateHash('gameStart'),
        userId: params.playerId,
        gameId: params.gameId,
        lang: params.language || 'en',
        cur: this.mapCurrency(params.currency),
        mode: params.mode === 'demo' ? 'FUN' : 'REAL',
        lobbyURL: params.returnUrl || '',
        depositURL: params.returnUrl || '',
        supportURL: params.returnUrl || '',
        platform: 'WEB',
        technology: 'H5',
        ext: {
          provider: this.operatorId,
          sessionId: params.sessionId,
          sweepstakesMode: true, // For sweepstakes compliance
          iframe: true,
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Pragmatic Play launch error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error === 0) {
        return {
          success: true,
          iframeUrl: data.gameURL,
          sessionToken: data.sessionId,
        };
      } else {
        return {
          success: false,
          error: data.description || 'Launch failed',
          message: data.description,
        };
      }
    } catch (error) {
      console.error('Pragmatic Play launchGame error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Launch failed',
      };
    }
  }

  async getPlayerBalance(playerId: string): Promise<ProviderBalance | null> {
    try {
      const requestData = {
        command: 'balance',
        hash: this.generateHash('balance'),
        userId: playerId,
        ext: {
          provider: this.operatorId,
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Pragmatic Play API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error === 0) {
        return {
          playerId: playerId,
          goldCoins: data.balance?.FUN || 0,
          sweepCoins: data.balance?.SWEEP || 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Pragmatic Play getPlayerBalance error:', error);
      return null;
    }
  }

  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      const requestData = {
        command: 'sessionInfo',
        hash: this.generateHash('sessionInfo'),
        sessionId: sessionToken,
        ext: {
          provider: this.operatorId,
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.error === 0 && data.sessionInfo?.active === true;
    } catch (error) {
      console.error('Pragmatic Play validateSession error:', error);
      return false;
    }
  }

  private transformPragmaticGames(pragmaticGames: any[]): SlotGame[] {
    return pragmaticGames.map(game => ({
      id: game.gameId || game.id,
      providerId: 'pragmaticplay',
      name: game.gameName || game.name,
      slug: game.gameId || game.id,
      thumbnailUrl: game.thumbnail || game.gameImage || '',
      category: game.category || 'slots',
      tags: game.tags || this.generateTags(game),
      minBet: parseFloat(game.minBet) || 0.01,
      maxBet: parseFloat(game.maxBet) || 100,
      rtp: parseFloat(game.rtp) || 96.0,
      volatility: this.mapVolatility(game.volatility),
      paylines: parseInt(game.paylines) || 25,
      reels: parseInt(game.reels) || 5,
      isPopular: game.isPopular || false,
      isNew: this.isNewGame(game.releaseDate),
      isMobileOptimized: game.mobileOptimized !== false,
      hasFreespins: this.hasFeature(game, 'freespins'),
      hasBonus: this.hasFeature(game, 'bonus'),
      hasJackpot: this.hasFeature(game, 'jackpot'),
      releaseDate: game.releaseDate || new Date().toISOString(),
      description: game.description || '',
      features: game.features || this.extractFeatures(game),
    }));
  }

  private mapVolatility(volatility: string | number): 'low' | 'medium' | 'high' {
    if (typeof volatility === 'number') {
      if (volatility <= 2) return 'low';
      if (volatility <= 4) return 'medium';
      return 'high';
    }
    
    const vol = volatility?.toLowerCase();
    if (vol === 'low' || vol === '1' || vol === '2') return 'low';
    if (vol === 'high' || vol === '5') return 'high';
    return 'medium';
  }

  private mapCurrency(currency: 'GC' | 'SC'): string {
    return currency === 'GC' ? 'FUN' : 'SWEEP';
  }

  private generateTags(game: any): string[] {
    const tags: string[] = [];
    
    if (game.category) tags.push(game.category);
    if (game.volatility) tags.push(`${game.volatility}-volatility`);
    if (game.features?.includes('freespins')) tags.push('freespins');
    if (game.features?.includes('bonus')) tags.push('bonus');
    if (game.features?.includes('jackpot')) tags.push('jackpot');
    if (game.paylines && game.paylines > 50) tags.push('multiline');
    
    return tags;
  }

  private hasFeature(game: any, feature: string): boolean {
    return game.features?.includes(feature) || 
           game.description?.toLowerCase().includes(feature) || 
           game.gameName?.toLowerCase().includes(feature) || false;
  }

  private isNewGame(releaseDate: string): boolean {
    if (!releaseDate) return false;
    const release = new Date(releaseDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return release > threeMonthsAgo;
  }

  private extractFeatures(game: any): string[] {
    const features: string[] = [];
    
    if (game.features) return game.features;
    
    const description = (game.description || '').toLowerCase();
    const gameName = (game.gameName || '').toLowerCase();
    
    if (description.includes('wild') || gameName.includes('wild')) features.push('Wild Symbols');
    if (description.includes('scatter') || gameName.includes('scatter')) features.push('Scatter Pays');
    if (description.includes('freespins') || description.includes('free spins')) features.push('Free Spins');
    if (description.includes('bonus') || gameName.includes('bonus')) features.push('Bonus Round');
    if (description.includes('jackpot') || gameName.includes('jackpot')) features.push('Jackpot');
    if (description.includes('multiplier')) features.push('Multipliers');
    
    return features;
  }

  private generateHash(command: string): string {
    // In production, this should be a proper HMAC SHA-256 hash
    // using your secret key and the command/timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const data = `${command}${timestamp}${this.secureLogin}`;
    
    // This is a simplified hash for demo purposes
    // In production, use: crypto.createHmac('sha256', secretKey).update(data).digest('hex')
    return Buffer.from(data).toString('base64').substring(0, 32);
  }

  // Pragmatic Play specific methods
  async getTournaments() {
    try {
      const requestData = {
        command: 'getTournaments',
        hash: this.generateHash('getTournaments'),
        ext: {
          provider: this.operatorId,
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Pragmatic Play tournaments error: ${response.status}`);
      }

      const data = await response.json();
      return data.error === 0 ? data : { tournaments: [] };
    } catch (error) {
      console.error('Pragmatic Play getTournaments error:', error);
      return { tournaments: [] };
    }
  }

  async getPromotions() {
    try {
      const requestData = {
        command: 'getPromotions',
        hash: this.generateHash('getPromotions'),
        ext: {
          provider: this.operatorId,
        }
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Pragmatic Play promotions error: ${response.status}`);
      }

      const data = await response.json();
      return data.error === 0 ? data : { promotions: [] };
    } catch (error) {
      console.error('Pragmatic Play getPromotions error:', error);
      return { promotions: [] };
    }
  }
}
