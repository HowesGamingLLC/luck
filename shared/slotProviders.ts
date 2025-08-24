export interface SlotProvider {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  apiEndpoint: string;
  websiteUrl: string;
  supportedCurrencies: ("GC" | "SC")[];
  features: ProviderFeatures;
}

export interface ProviderFeatures {
  hasIframe: boolean;
  hasAPI: boolean;
  supportsThumbnails: boolean;
  supportsFreeMoney: boolean;
  supportsSweepstakes: boolean;
  supportsAutoplay: boolean;
  supportsMobileOptimized: boolean;
}

export interface SlotGame {
  id: string;
  providerId: string;
  name: string;
  slug: string;
  thumbnailUrl: string;
  category: string;
  tags: string[];
  minBet: number;
  maxBet: number;
  rtp: number;
  volatility: "low" | "medium" | "high";
  paylines: number;
  reels: number;
  isPopular: boolean;
  isNew: boolean;
  isMobileOptimized: boolean;
  hasFreespins: boolean;
  hasBonus: boolean;
  hasJackpot: boolean;
  releaseDate: string;
  description: string;
  features: string[];
}

export interface GameLaunchParams {
  gameId: string;
  playerId: string;
  currency: "GC" | "SC";
  mode: "real" | "demo";
  language?: string;
  returnUrl?: string;
  sessionId?: string;
}

export interface GameLaunchResponse {
  success: boolean;
  iframeUrl?: string;
  sessionToken?: string;
  error?: string;
  message?: string;
}

export interface ProviderGameListParams {
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: "name" | "popularity" | "rtp" | "releaseDate";
  sortOrder?: "asc" | "desc";
}

export interface ProviderGameListResponse {
  success: boolean;
  games: SlotGame[];
  total: number;
  hasMore: boolean;
  error?: string;
}

export interface ProviderBalance {
  playerId: string;
  goldCoins: number;
  sweepCoins: number;
  lastUpdated: string;
}

export interface ProviderBetResult {
  success: boolean;
  transactionId: string;
  betAmount: number;
  winAmount: number;
  currency: "GC" | "SC";
  gameRound: string;
  timestamp: string;
  error?: string;
}

export abstract class BaseSlotProvider {
  protected provider: SlotProvider;
  protected apiKey: string;
  protected operatorId: string;

  constructor(provider: SlotProvider, apiKey: string, operatorId: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.operatorId = operatorId;
  }

  abstract getGames(
    params?: ProviderGameListParams,
  ): Promise<ProviderGameListResponse>;
  abstract getGameById(gameId: string): Promise<SlotGame | null>;
  abstract launchGame(params: GameLaunchParams): Promise<GameLaunchResponse>;
  abstract getPlayerBalance(playerId: string): Promise<ProviderBalance | null>;
  abstract validateSession(sessionToken: string): Promise<boolean>;

  getProvider(): SlotProvider {
    return this.provider;
  }

  isActive(): boolean {
    return this.provider.isActive;
  }

  supportsCurrency(currency: "GC" | "SC"): boolean {
    return this.provider.supportedCurrencies.includes(currency);
  }
}
