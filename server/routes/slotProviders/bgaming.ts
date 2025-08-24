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
} from '../../../shared/slotProviders';

export class BGamingProvider extends BaseSlotProvider {
  private baseUrl: string;

  constructor(apiKey: string, operatorId: string) {
    const provider: SlotProvider = {
      id: 'bgaming',
      name: 'bgaming',
      displayName: 'BGaming',
      isActive: true,
      apiEndpoint: 'https://bgaming-api.example.com/api/v2',
      websiteUrl: 'https://bgaming.com',
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
  }

  async getGames(params?: ProviderGameListParams): Promise<ProviderGameListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.category) queryParams.append('category', params.category);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
      if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);

      queryParams.append('operator_id', this.operatorId);

      const response = await fetch(`${this.baseUrl}/games?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`BGaming API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        games: this.transformBGamingGames(data.games || []),
        total: data.total || 0,
        hasMore: data.has_more || false,
      };
    } catch (error) {
      console.error('BGaming getGames error:', error);
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
      const response = await fetch(`${this.baseUrl}/games/${gameId}?operator_id=${this.operatorId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`BGaming API error: ${response.status}`);
      }

      const data = await response.json();
      const transformedGames = this.transformBGamingGames([data.game]);
      
      return transformedGames.length > 0 ? transformedGames[0] : null;
    } catch (error) {
      console.error('BGaming getGameById error:', error);
      return null;
    }
  }

  async launchGame(params: GameLaunchParams): Promise<GameLaunchResponse> {
    try {
      const launchData = {
        game_id: params.gameId,
        player_id: params.playerId,
        operator_id: this.operatorId,
        currency: params.currency === 'GC' ? 'FUN' : 'SWEEP', // BGaming currency mapping
        mode: params.mode,
        language: params.language || 'en',
        return_url: params.returnUrl,
        session_id: params.sessionId,
        lobby_url: params.returnUrl,
        platform: 'web',
        iframe_mode: true,
        sweepstakes_mode: true, // For sweepstakes compliance
      };

      const response = await fetch(`${this.baseUrl}/sessions/launch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(launchData),
      });

      if (!response.ok) {
        throw new Error(`BGaming launch error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          iframeUrl: data.game_url,
          sessionToken: data.session_token,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Launch failed',
          message: data.message,
        };
      }
    } catch (error) {
      console.error('BGaming launchGame error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Launch failed',
      };
    }
  }

  async getPlayerBalance(playerId: string): Promise<ProviderBalance | null> {
    try {
      const response = await fetch(`${this.baseUrl}/players/${playerId}/balance?operator_id=${this.operatorId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`BGaming API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        playerId: playerId,
        goldCoins: data.balances?.FUN || 0,
        sweepCoins: data.balances?.SWEEP || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('BGaming getPlayerBalance error:', error);
      return null;
    }
  }

  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
          operator_id: this.operatorId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('BGaming validateSession error:', error);
      return false;
    }
  }

  private transformBGamingGames(bgamingGames: any[]): SlotGame[] {
    return bgamingGames.map(game => ({
      id: game.id,
      providerId: 'bgaming',
      name: game.name,
      slug: game.slug || game.id,
      thumbnailUrl: game.thumbnail || game.icon || '',
      category: game.category || 'slots',
      tags: game.tags || [],
      minBet: game.min_bet || 0.01,
      maxBet: game.max_bet || 100,
      rtp: game.rtp || 96.0,
      volatility: this.mapVolatility(game.volatility),
      paylines: game.paylines || 25,
      reels: game.reels || 5,
      isPopular: game.is_popular || false,
      isNew: game.is_new || false,
      isMobileOptimized: game.mobile_optimized !== false,
      hasFreespins: game.features?.includes('freespins') || false,
      hasBonus: game.features?.includes('bonus') || false,
      hasJackpot: game.features?.includes('jackpot') || false,
      releaseDate: game.release_date || new Date().toISOString(),
      description: game.description || '',
      features: game.features || [],
    }));
  }

  private mapVolatility(volatility: string | number): 'low' | 'medium' | 'high' {
    if (typeof volatility === 'number') {
      if (volatility <= 3) return 'low';
      if (volatility <= 6) return 'medium';
      return 'high';
    }
    
    const vol = volatility?.toLowerCase();
    if (vol === 'low' || vol === 'l') return 'low';
    if (vol === 'high' || vol === 'h') return 'high';
    return 'medium';
  }

  // BGaming specific methods
  async getTournaments() {
    try {
      const response = await fetch(`${this.baseUrl}/tournaments?operator_id=${this.operatorId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`BGaming tournaments error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BGaming getTournaments error:', error);
      return { tournaments: [] };
    }
  }

  async getPromotions() {
    try {
      const response = await fetch(`${this.baseUrl}/promotions?operator_id=${this.operatorId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`BGaming promotions error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BGaming getPromotions error:', error);
      return { promotions: [] };
    }
  }
}
