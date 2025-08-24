import { EventEmitter } from "events";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category:
    | "general"
    | "slots"
    | "poker"
    | "bingo"
    | "sports"
    | "social"
    | "progression";
  type: "one_time" | "tiered" | "repeatable";
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  icon: string;
  isSecret?: boolean;
  tiers?: AchievementTier[];
}

export interface AchievementRequirement {
  type: "stat" | "action" | "condition" | "time" | "streak";
  metric: string;
  operator:
    | "equals"
    | "greater_than"
    | "less_than"
    | "greater_equal"
    | "less_equal";
  value: number | string;
  gameType?: string;
  timeframe?: "session" | "daily" | "weekly" | "monthly" | "all_time";
}

export interface AchievementReward {
  type: "currency" | "xp" | "title" | "badge" | "bonus_multiplier" | "unlock";
  amount?: number;
  currency?: "GC" | "SC";
  duration?: number; // For temporary rewards
  unlockId?: string; // For unlocking features
}

export interface AchievementTier {
  tier: number;
  name: string;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
}

export interface PlayerAchievement {
  achievementId: string;
  playerId: string;
  unlockedAt: Date;
  tier?: number;
  progress?: number; // For tiered achievements
  isCompleted: boolean;
}

export interface PlayerStats {
  playerId: string;
  level: number;
  xp: number;
  totalWinnings: { gc: number; sc: number };
  totalWagered: { gc: number; sc: number };
  gamesPlayed: { [gameType: string]: number };
  winRates: { [gameType: string]: number };
  biggestWin: { amount: number; currency: "GC" | "SC"; game: string };
  currentStreak: number;
  longestStreak: number;
  referrals: number;
  playTime: number; // minutes
  lastActive: Date;
  joinDate: Date;

  // Game-specific stats
  slots: {
    totalSpins: number;
    jackpotsWon: number;
    bonusTriggered: number;
    biggestMultiplier: number;
  };

  poker: {
    handsPlayed: number;
    tournamentsWon: number;
    bestFinish: number;
    royalFlushes: number;
  };

  bingo: {
    gamesPlayed: number;
    patternsCompleted: { [pattern: string]: number };
    fastestWin: number; // calls to win
  };

  sports: {
    betsPlaced: number;
    parlaysWon: number;
    biggestParlay: number; // legs
    accuracy: number; // percentage
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: Achievement["rarity"];
  icon: string;
  color: string;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  rarity: Achievement["rarity"];
  color: string;
}

export interface ProgressionLevel {
  level: number;
  xpRequired: number;
  rewards: AchievementReward[];
  title?: string;
  perks: string[];
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  value: number;
  rank: number;
  change: number; // Position change from previous period
}

export class AchievementEngine extends EventEmitter {
  private achievements: Map<string, Achievement> = new Map();
  private playerAchievements: Map<string, Map<string, PlayerAchievement>> =
    new Map();
  private playerStats: Map<string, PlayerStats> = new Map();
  private badges: Map<string, Badge> = new Map();
  private titles: Map<string, Title> = new Map();
  private progressionLevels: ProgressionLevel[] = [];
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();

  constructor() {
    super();
    this.initializeAchievements();
    this.initializeBadgesAndTitles();
    this.initializeProgressionLevels();
    this.startPeriodicTasks();
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // General Achievements
      {
        id: "first_win",
        name: "First Victory",
        description: "Win your first game",
        category: "general",
        type: "one_time",
        rarity: "common",
        requirements: [
          {
            type: "stat",
            metric: "total_wins",
            operator: "greater_equal",
            value: 1,
          },
        ],
        rewards: [
          { type: "currency", amount: 100, currency: "GC" },
          { type: "xp", amount: 50 },
        ],
        icon: "trophy",
      },

      {
        id: "big_spender",
        name: "Big Spender",
        description: "Wager $1,000 total",
        category: "general",
        type: "tiered",
        rarity: "rare",
        requirements: [
          {
            type: "stat",
            metric: "total_wagered_gc",
            operator: "greater_equal",
            value: 1000,
          },
        ],
        rewards: [
          { type: "currency", amount: 500, currency: "GC" },
          { type: "badge", unlockId: "big_spender" },
        ],
        icon: "dollar-sign",
        tiers: [
          {
            tier: 1,
            name: "Spender",
            requirements: [
              {
                type: "stat",
                metric: "total_wagered_gc",
                operator: "greater_equal",
                value: 1000,
              },
            ],
            rewards: [{ type: "currency", amount: 500, currency: "GC" }],
          },
          {
            tier: 2,
            name: "Big Spender",
            requirements: [
              {
                type: "stat",
                metric: "total_wagered_gc",
                operator: "greater_equal",
                value: 10000,
              },
            ],
            rewards: [{ type: "currency", amount: 2500, currency: "GC" }],
          },
          {
            tier: 3,
            name: "High Roller",
            requirements: [
              {
                type: "stat",
                metric: "total_wagered_gc",
                operator: "greater_equal",
                value: 100000,
              },
            ],
            rewards: [
              { type: "currency", amount: 25000, currency: "GC" },
              { type: "title", unlockId: "high_roller" },
            ],
          },
        ],
      },

      // Slots Achievements
      {
        id: "slot_master",
        name: "Slot Master",
        description: "Complete 1,000 slot spins",
        category: "slots",
        type: "tiered",
        rarity: "epic",
        requirements: [
          {
            type: "stat",
            metric: "slots_total_spins",
            operator: "greater_equal",
            value: 1000,
          },
        ],
        rewards: [
          { type: "currency", amount: 5000, currency: "GC" },
          { type: "badge", unlockId: "slot_master" },
        ],
        icon: "zap",
        tiers: [
          {
            tier: 1,
            name: "Spin Novice",
            requirements: [
              {
                type: "stat",
                metric: "slots_total_spins",
                operator: "greater_equal",
                value: 100,
              },
            ],
            rewards: [{ type: "currency", amount: 500, currency: "GC" }],
          },
          {
            tier: 2,
            name: "Spin Expert",
            requirements: [
              {
                type: "stat",
                metric: "slots_total_spins",
                operator: "greater_equal",
                value: 1000,
              },
            ],
            rewards: [{ type: "currency", amount: 2500, currency: "GC" }],
          },
          {
            tier: 3,
            name: "Slot Master",
            requirements: [
              {
                type: "stat",
                metric: "slots_total_spins",
                operator: "greater_equal",
                value: 10000,
              },
            ],
            rewards: [
              { type: "currency", amount: 25000, currency: "GC" },
              { type: "title", unlockId: "slot_master" },
            ],
          },
        ],
      },

      {
        id: "jackpot_hunter",
        name: "Jackpot Hunter",
        description: "Win a progressive jackpot",
        category: "slots",
        type: "one_time",
        rarity: "legendary",
        requirements: [
          {
            type: "stat",
            metric: "slots_jackpots_won",
            operator: "greater_equal",
            value: 1,
          },
        ],
        rewards: [
          { type: "currency", amount: 10000, currency: "GC" },
          { type: "badge", unlockId: "jackpot_hunter" },
          { type: "title", unlockId: "jackpot_king" },
        ],
        icon: "crown",
      },

      // Poker Achievements
      {
        id: "poker_shark",
        name: "Poker Shark",
        description: "Win 100 poker hands",
        category: "poker",
        type: "tiered",
        rarity: "rare",
        requirements: [
          {
            type: "stat",
            metric: "poker_hands_won",
            operator: "greater_equal",
            value: 100,
          },
        ],
        rewards: [
          { type: "currency", amount: 2000, currency: "GC" },
          { type: "badge", unlockId: "poker_shark" },
        ],
        icon: "spade",
      },

      {
        id: "royal_flush",
        name: "Royal Treatment",
        description: "Get a Royal Flush",
        category: "poker",
        type: "repeatable",
        rarity: "mythic",
        requirements: [
          {
            type: "action",
            metric: "royal_flush_achieved",
            operator: "equals",
            value: 1,
          },
        ],
        rewards: [
          { type: "currency", amount: 50000, currency: "GC" },
          { type: "currency", amount: 100, currency: "SC" },
          { type: "badge", unlockId: "royal_flush" },
        ],
        icon: "star",
      },

      // Bingo Achievements
      {
        id: "bingo_master",
        name: "Bingo Master",
        description: "Win 50 bingo games",
        category: "bingo",
        type: "tiered",
        rarity: "epic",
        requirements: [
          {
            type: "stat",
            metric: "bingo_games_won",
            operator: "greater_equal",
            value: 50,
          },
        ],
        rewards: [
          { type: "currency", amount: 5000, currency: "GC" },
          { type: "badge", unlockId: "bingo_master" },
        ],
        icon: "target",
      },

      // Sports Betting Achievements
      {
        id: "parlay_master",
        name: "Parlay Master",
        description: "Win a 5-leg parlay",
        category: "sports",
        type: "one_time",
        rarity: "legendary",
        requirements: [
          {
            type: "action",
            metric: "parlay_won",
            operator: "greater_equal",
            value: 5,
          },
        ],
        rewards: [
          { type: "currency", amount: 10000, currency: "SC" },
          { type: "badge", unlockId: "parlay_master" },
        ],
        icon: "trending-up",
      },

      // Social Achievements
      {
        id: "social_butterfly",
        name: "Social Butterfly",
        description: "Refer 10 friends",
        category: "social",
        type: "tiered",
        rarity: "rare",
        requirements: [
          {
            type: "stat",
            metric: "referrals",
            operator: "greater_equal",
            value: 10,
          },
        ],
        rewards: [
          { type: "currency", amount: 5000, currency: "GC" },
          { type: "currency", amount: 50, currency: "SC" },
        ],
        icon: "users",
      },

      // Streak Achievements
      {
        id: "lucky_streak",
        name: "Lucky Streak",
        description: "Win 10 games in a row",
        category: "general",
        type: "tiered",
        rarity: "epic",
        requirements: [
          {
            type: "stat",
            metric: "current_streak",
            operator: "greater_equal",
            value: 10,
          },
        ],
        rewards: [
          { type: "currency", amount: 2000, currency: "GC" },
          { type: "bonus_multiplier", amount: 2, duration: 24 }, // 2x multiplier for 24 hours
        ],
        icon: "zap",
      },

      // Time-based Achievements
      {
        id: "early_bird",
        name: "Early Bird",
        description: "Play before 8 AM",
        category: "general",
        type: "one_time",
        rarity: "common",
        requirements: [
          {
            type: "condition",
            metric: "play_time_hour",
            operator: "less_than",
            value: 8,
          },
        ],
        rewards: [{ type: "currency", amount: 250, currency: "GC" }],
        icon: "sunrise",
      },

      {
        id: "night_owl",
        name: "Night Owl",
        description: "Play after midnight",
        category: "general",
        type: "one_time",
        rarity: "common",
        requirements: [
          {
            type: "condition",
            metric: "play_time_hour",
            operator: "greater_equal",
            value: 0,
          },
        ],
        rewards: [{ type: "currency", amount: 250, currency: "GC" }],
        icon: "moon",
      },
    ];

    achievements.forEach((achievement) => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private initializeBadgesAndTitles(): void {
    // Badges
    const badges: Badge[] = [
      {
        id: "big_spender",
        name: "Big Spender",
        description: "Wagered significant amounts",
        rarity: "rare",
        icon: "dollar-sign",
        color: "gold",
      },
      {
        id: "slot_master",
        name: "Slot Master",
        description: "Expert slot player",
        rarity: "epic",
        icon: "zap",
        color: "purple",
      },
      {
        id: "jackpot_hunter",
        name: "Jackpot Hunter",
        description: "Won a progressive jackpot",
        rarity: "legendary",
        icon: "crown",
        color: "gold",
      },
      {
        id: "poker_shark",
        name: "Poker Shark",
        description: "Skilled poker player",
        rarity: "rare",
        icon: "spade",
        color: "blue",
      },
      {
        id: "royal_flush",
        name: "Royal Flush",
        description: "Achieved a royal flush",
        rarity: "mythic",
        icon: "star",
        color: "rainbow",
      },
      {
        id: "bingo_master",
        name: "Bingo Master",
        description: "Expert bingo player",
        rarity: "epic",
        icon: "target",
        color: "green",
      },
      {
        id: "parlay_master",
        name: "Parlay Master",
        description: "Won a 5+ leg parlay",
        rarity: "legendary",
        icon: "trending-up",
        color: "red",
      },
    ];

    // Titles
    const titles: Title[] = [
      {
        id: "high_roller",
        name: "High Roller",
        description: "Elite player status",
        rarity: "epic",
        color: "gold",
      },
      {
        id: "slot_master",
        name: "Slot Master",
        description: "Master of the reels",
        rarity: "epic",
        color: "purple",
      },
      {
        id: "jackpot_king",
        name: "Jackpot King",
        description: "Ruler of jackpots",
        rarity: "legendary",
        color: "gold",
      },
      {
        id: "poker_legend",
        name: "Poker Legend",
        description: "Legendary poker skills",
        rarity: "mythic",
        color: "platinum",
      },
    ];

    badges.forEach((badge) => this.badges.set(badge.id, badge));
    titles.forEach((title) => this.titles.set(title.id, title));
  }

  private initializeProgressionLevels(): void {
    for (let level = 1; level <= 100; level++) {
      const xpRequired = Math.floor(100 * Math.pow(1.5, level - 1));
      const rewards: AchievementReward[] = [
        { type: "currency", amount: level * 100, currency: "GC" },
      ];

      // Special rewards at milestone levels
      if (level % 10 === 0) {
        rewards.push({ type: "currency", amount: level * 10, currency: "SC" });
      }

      if (level % 25 === 0) {
        rewards.push({ type: "title", unlockId: `level_${level}_master` });
      }

      this.progressionLevels.push({
        level,
        xpRequired,
        rewards,
        title: level % 25 === 0 ? `Level ${level} Master` : undefined,
        perks: this.getLevelPerks(level),
      });
    }
  }

  private getLevelPerks(level: number): string[] {
    const perks: string[] = [];

    if (level >= 5) perks.push("Daily bonus increased by 10%");
    if (level >= 10) perks.push("Access to VIP tournaments");
    if (level >= 15) perks.push("Exclusive slot themes");
    if (level >= 20) perks.push("Higher betting limits");
    if (level >= 25) perks.push("Personal account manager");
    if (level >= 50) perks.push("Custom avatar frames");
    if (level >= 75) perks.push("Beta access to new games");
    if (level >= 100) perks.push("Lifetime VIP status");

    return perks;
  }

  private startPeriodicTasks(): void {
    // Update leaderboards every hour
    setInterval(
      () => {
        this.updateLeaderboards();
      },
      60 * 60 * 1000,
    );

    // Check daily/weekly achievements every hour
    setInterval(
      () => {
        this.checkTimeBasedAchievements();
      },
      60 * 60 * 1000,
    );
  }

  private updateLeaderboards(): void {
    const categories = [
      "total_winnings_gc",
      "total_winnings_sc",
      "slots_total_spins",
      "poker_hands_played",
      "bingo_games_won",
      "current_streak",
      "level",
    ];

    categories.forEach((category) => {
      const entries: LeaderboardEntry[] = [];

      for (const [playerId, stats] of this.playerStats) {
        const value = this.getStatValue(stats, category);
        entries.push({
          playerId,
          playerName: `Player_${playerId.slice(-4)}`, // In production, get actual names
          value,
          rank: 0,
          change: 0,
        });
      }

      // Sort and assign ranks
      entries.sort((a, b) => b.value - a.value);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      this.leaderboards.set(category, entries.slice(0, 100)); // Top 100
    });
  }

  private getStatValue(stats: PlayerStats, category: string): number {
    switch (category) {
      case "total_winnings_gc":
        return stats.totalWinnings.gc;
      case "total_winnings_sc":
        return stats.totalWinnings.sc;
      case "slots_total_spins":
        return stats.slots.totalSpins;
      case "poker_hands_played":
        return stats.poker.handsPlayed;
      case "bingo_games_won":
        return stats.bingo.gamesPlayed;
      case "current_streak":
        return stats.currentStreak;
      case "level":
        return stats.level;
      default:
        return 0;
    }
  }

  private checkTimeBasedAchievements(): void {
    // This would check for daily/weekly/monthly achievements
    // Implementation depends on specific time-based requirements
  }

  // Public API Methods
  public initializePlayer(playerId: string): PlayerStats {
    const stats: PlayerStats = {
      playerId,
      level: 1,
      xp: 0,
      totalWinnings: { gc: 0, sc: 0 },
      totalWagered: { gc: 0, sc: 0 },
      gamesPlayed: {},
      winRates: {},
      biggestWin: { amount: 0, currency: "GC", game: "" },
      currentStreak: 0,
      longestStreak: 0,
      referrals: 0,
      playTime: 0,
      lastActive: new Date(),
      joinDate: new Date(),
      slots: {
        totalSpins: 0,
        jackpotsWon: 0,
        bonusTriggered: 0,
        biggestMultiplier: 0,
      },
      poker: {
        handsPlayed: 0,
        tournamentsWon: 0,
        bestFinish: 0,
        royalFlushes: 0,
      },
      bingo: {
        gamesPlayed: 0,
        patternsCompleted: {},
        fastestWin: 999,
      },
      sports: {
        betsPlaced: 0,
        parlaysWon: 0,
        biggestParlay: 0,
        accuracy: 0,
      },
    };

    this.playerStats.set(playerId, stats);
    this.playerAchievements.set(playerId, new Map());

    return stats;
  }

  public updatePlayerStats(
    playerId: string,
    updates: Partial<PlayerStats>,
  ): void {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    // Merge updates
    Object.assign(stats, updates);
    stats.lastActive = new Date();

    // Check for level progression
    this.checkLevelProgression(playerId);

    // Check achievements
    this.checkPlayerAchievements(playerId);

    this.emit("statsUpdated", { playerId, stats });
  }

  public recordGameAction(
    playerId: string,
    gameType: string,
    action: string,
    data: any,
  ): void {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    // Update relevant stats based on action
    switch (action) {
      case "game_won":
        stats.currentStreak++;
        stats.longestStreak = Math.max(
          stats.longestStreak,
          stats.currentStreak,
        );
        stats.totalWinnings[data.currency] += data.amount;
        break;

      case "game_lost":
        stats.currentStreak = 0;
        break;

      case "wager_placed":
        stats.totalWagered[data.currency] += data.amount;
        stats.gamesPlayed[gameType] = (stats.gamesPlayed[gameType] || 0) + 1;
        break;

      case "slot_spin":
        stats.slots.totalSpins++;
        break;

      case "jackpot_won":
        stats.slots.jackpotsWon++;
        break;

      case "poker_hand_played":
        stats.poker.handsPlayed++;
        break;

      case "royal_flush":
        stats.poker.royalFlushes++;
        this.checkAchievementProgress(playerId, "royal_flush", {
          royal_flush_achieved: 1,
        });
        break;

      case "bingo_game":
        stats.bingo.gamesPlayed++;
        break;

      case "parlay_won":
        stats.sports.parlaysWon++;
        if (data.legs >= 5) {
          this.checkAchievementProgress(playerId, "parlay_master", {
            parlay_won: data.legs,
          });
        }
        break;
    }

    this.checkPlayerAchievements(playerId);
  }

  private checkLevelProgression(playerId: string): void {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    const currentLevel = this.progressionLevels.find(
      (l) => l.level === stats.level,
    );
    if (!currentLevel) return;

    const nextLevel = this.progressionLevels.find(
      (l) => l.level === stats.level + 1,
    );
    if (!nextLevel) return;

    if (stats.xp >= nextLevel.xpRequired) {
      stats.level++;
      stats.xp -= nextLevel.xpRequired;

      // Award level rewards
      this.awardRewards(playerId, nextLevel.rewards);

      this.emit("levelUp", {
        playerId,
        newLevel: stats.level,
        rewards: nextLevel.rewards,
      });

      // Check for more level ups
      this.checkLevelProgression(playerId);
    }
  }

  private checkPlayerAchievements(playerId: string): void {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    for (const [achievementId, achievement] of this.achievements) {
      if (
        achievement.isSecret &&
        !this.hasMetRequirements(stats, achievement.requirements)
      ) {
        continue; // Don't show progress for secret achievements
      }

      this.checkAchievementProgress(playerId, achievementId, stats);
    }
  }

  private checkAchievementProgress(
    playerId: string,
    achievementId: string,
    data: any,
  ): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;

    const playerAchievements = this.playerAchievements.get(playerId);
    if (!playerAchievements) return;

    let playerAchievement = playerAchievements.get(achievementId);

    // Check if already completed (and not repeatable)
    if (playerAchievement?.isCompleted && achievement.type !== "repeatable") {
      return;
    }

    // For tiered achievements, check each tier
    if (achievement.type === "tiered" && achievement.tiers) {
      for (const tier of achievement.tiers) {
        if (this.hasMetRequirements(data, tier.requirements)) {
          if (!playerAchievement || (playerAchievement.tier || 0) < tier.tier) {
            this.unlockAchievement(playerId, achievementId, tier.tier);
          }
        }
      }
    } else {
      // Regular achievement
      if (this.hasMetRequirements(data, achievement.requirements)) {
        this.unlockAchievement(playerId, achievementId);
      }
    }
  }

  private hasMetRequirements(
    data: any,
    requirements: AchievementRequirement[],
  ): boolean {
    return requirements.every((req) => {
      const value = this.getRequirementValue(data, req.metric);
      return this.compareValues(value, req.operator, req.value);
    });
  }

  private getRequirementValue(data: any, metric: string): any {
    // Navigate nested objects using dot notation
    return metric.split(".").reduce((obj, key) => obj?.[key], data) || 0;
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case "equals":
        return actual === expected;
      case "greater_than":
        return actual > expected;
      case "less_than":
        return actual < expected;
      case "greater_equal":
        return actual >= expected;
      case "less_equal":
        return actual <= expected;
      default:
        return false;
    }
  }

  private unlockAchievement(
    playerId: string,
    achievementId: string,
    tier?: number,
  ): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) return;

    const playerAchievements = this.playerAchievements.get(playerId);
    if (!playerAchievements) return;

    const playerAchievement: PlayerAchievement = {
      achievementId,
      playerId,
      unlockedAt: new Date(),
      tier,
      isCompleted: true,
    };

    playerAchievements.set(achievementId, playerAchievement);

    // Award rewards
    let rewards = achievement.rewards;
    if (tier && achievement.tiers) {
      const tierData = achievement.tiers.find((t) => t.tier === tier);
      if (tierData) rewards = tierData.rewards;
    }

    this.awardRewards(playerId, rewards);

    this.emit("achievementUnlocked", {
      playerId,
      achievement,
      tier,
      rewards,
    });
  }

  private awardRewards(playerId: string, rewards: AchievementReward[]): void {
    for (const reward of rewards) {
      switch (reward.type) {
        case "currency":
          // In production, this would update the player's balance
          this.emit("currencyAwarded", {
            playerId,
            amount: reward.amount,
            currency: reward.currency,
          });
          break;

        case "xp":
          const stats = this.playerStats.get(playerId);
          if (stats && reward.amount) {
            stats.xp += reward.amount;
          }
          break;

        case "badge":
          this.emit("badgeAwarded", { playerId, badgeId: reward.unlockId });
          break;

        case "title":
          this.emit("titleAwarded", { playerId, titleId: reward.unlockId });
          break;
      }
    }
  }

  // Public API Methods
  public getPlayerAchievements(playerId: string): PlayerAchievement[] {
    const playerAchievements = this.playerAchievements.get(playerId);
    return playerAchievements ? Array.from(playerAchievements.values()) : [];
  }

  public getPlayerStats(playerId: string): PlayerStats | undefined {
    return this.playerStats.get(playerId);
  }

  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getAchievementsByCategory(
    category: Achievement["category"],
  ): Achievement[] {
    return Array.from(this.achievements.values()).filter(
      (a) => a.category === category,
    );
  }

  public getLeaderboard(
    category: string,
    limit: number = 100,
  ): LeaderboardEntry[] {
    return this.leaderboards.get(category)?.slice(0, limit) || [];
  }

  public getBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  public getTitles(): Title[] {
    return Array.from(this.titles.values());
  }

  public getProgressionLevels(): ProgressionLevel[] {
    return this.progressionLevels;
  }

  public addXP(playerId: string, amount: number): void {
    const stats = this.playerStats.get(playerId);
    if (stats) {
      stats.xp += amount;
      this.checkLevelProgression(playerId);
    }
  }
}
