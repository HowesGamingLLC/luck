import { SlotTheme } from "./SlotMachine";

// Classic Fruits Theme
export const CLASSIC_FRUITS: SlotTheme = {
  name: "Classic Fruits",
  background: "from-red-500 to-yellow-500",
  jackpotMultiplier: 500,
  symbols: [
    { id: "cherry", symbol: "🍒", value: 5, rarity: 25, color: "text-red-500" },
    { id: "lemon", symbol: "🍋", value: 8, rarity: 22, color: "text-yellow-500" },
    { id: "orange", symbol: "🍊", value: 12, rarity: 20, color: "text-orange-500" },
    { id: "plum", symbol: "🍇", value: 15, rarity: 18, color: "text-purple-500" },
    { id: "watermelon", symbol: "🍉", value: 20, rarity: 15, color: "text-green-500" },
    { id: "bell", symbol: "🔔", value: 30, rarity: 12, color: "text-gold" },
    { id: "star", symbol: "⭐", value: 50, rarity: 8, color: "text-yellow-400" },
    { id: "seven", symbol: "7️⃣", value: 100, rarity: 5, color: "text-red-600" },
    { id: "jackpot", symbol: "🎰", value: 250, rarity: 2, color: "text-gold" },
  ],
};

// Diamond Deluxe Theme
export const DIAMOND_DELUXE: SlotTheme = {
  name: "Diamond Deluxe",
  background: "from-blue-600 to-purple-700",
  jackpotMultiplier: 1000,
  symbols: [
    { id: "emerald", symbol: "💚", value: 10, rarity: 20, color: "text-green-400" },
    { id: "ruby", symbol: "♦️", value: 15, rarity: 18, color: "text-red-400" },
    { id: "sapphire", symbol: "🔷", value: 20, rarity: 16, color: "text-blue-400" },
    { id: "gold", symbol: "🟡", value: 25, rarity: 14, color: "text-yellow-400" },
    { id: "diamond", symbol: "💎", value: 40, rarity: 12, color: "text-white" },
    { id: "crown", symbol: "👑", value: 60, rarity: 10, color: "text-gold" },
    { id: "crystal", symbol: "🔮", value: 100, rarity: 6, color: "text-purple-400" },
    { id: "mega-diamond", symbol: "💠", value: 200, rarity: 3, color: "text-blue-300" },
    { id: "jackpot", symbol: "👸", value: 500, rarity: 1, color: "text-pink-400" },
  ],
};

// Treasure Hunt Theme
export const TREASURE_HUNT: SlotTheme = {
  name: "Treasure Hunt",
  background: "from-yellow-600 to-orange-700",
  jackpotMultiplier: 750,
  symbols: [
    { id: "coin", symbol: "🪙", value: 8, rarity: 22, color: "text-yellow-500" },
    { id: "map", symbol: "🗺️", value: 12, rarity: 20, color: "text-amber-600" },
    { id: "compass", symbol: "🧭", value: 18, rarity: 18, color: "text-red-500" },
    { id: "key", symbol: "🗝️", value: 25, rarity: 16, color: "text-gold" },
    { id: "scroll", symbol: "📜", value: 35, rarity: 14, color: "text-yellow-600" },
    { id: "gem", symbol: "💰", value: 50, rarity: 10, color: "text-green-400" },
    { id: "chest", symbol: "📦", value: 75, rarity: 8, color: "text-amber-700" },
    { id: "pirate", symbol: "🏴‍☠️", value: 150, rarity: 4, color: "text-black" },
    { id: "jackpot", symbol: "💰", value: 400, rarity: 2, color: "text-gold" },
  ],
};

// Lucky Sevens Theme
export const LUCKY_SEVENS: SlotTheme = {
  name: "Lucky Sevens",
  background: "from-red-600 to-black",
  jackpotMultiplier: 777,
  symbols: [
    { id: "bar", symbol: "📊", value: 6, rarity: 25, color: "text-gray-400" },
    { id: "triple-bar", symbol: "📈", value: 10, rarity: 20, color: "text-gray-300" },
    { id: "cherry", symbol: "🍒", value: 15, rarity: 18, color: "text-red-500" },
    { id: "lemon", symbol: "🍋", value: 20, rarity: 16, color: "text-yellow-500" },
    { id: "bell", symbol: "🔔", value: 30, rarity: 14, color: "text-gold" },
    { id: "lucky-seven", symbol: "7️⃣", value: 77, rarity: 10, color: "text-red-600" },
    { id: "double-seven", symbol: "77", value: 177, rarity: 6, color: "text-red-500" },
    { id: "triple-seven", symbol: "777", value: 777, rarity: 3, color: "text-red-400" },
    { id: "jackpot", symbol: "🎰", value: 1500, rarity: 1, color: "text-gold" },
  ],
};

// Wild West Theme
export const WILD_WEST: SlotTheme = {
  name: "Wild West",
  background: "from-orange-700 to-red-800",
  jackpotMultiplier: 600,
  symbols: [
    { id: "horseshoe", symbol: "🍀", value: 7, rarity: 23, color: "text-green-400" },
    { id: "cactus", symbol: "🌵", value: 12, rarity: 20, color: "text-green-500" },
    { id: "hat", symbol: "🤠", value: 18, rarity: 18, color: "text-amber-600" },
    { id: "boot", symbol: "🥾", value: 25, rarity: 16, color: "text-amber-700" },
    { id: "gun", symbol: "🔫", value: 35, rarity: 14, color: "text-gray-400" },
    { id: "badge", symbol: "⭐", value: 50, rarity: 11, color: "text-yellow-400" },
    { id: "gold", symbol: "🪙", value: 75, rarity: 8, color: "text-gold" },
    { id: "bandit", symbol: "🤠", value: 120, rarity: 5, color: "text-red-600" },
    { id: "jackpot", symbol: "💰", value: 350, rarity: 2, color: "text-gold" },
  ],
};

// Space Adventure Theme
export const SPACE_ADVENTURE: SlotTheme = {
  name: "Space Adventure",
  background: "from-purple-900 to-indigo-900",
  jackpotMultiplier: 888,
  symbols: [
    { id: "planet", symbol: "🪐", value: 9, rarity: 22, color: "text-orange-400" },
    { id: "rocket", symbol: "🚀", value: 14, rarity: 19, color: "text-red-400" },
    { id: "alien", symbol: "👽", value: 22, rarity: 17, color: "text-green-400" },
    { id: "satellite", symbol: "🛰️", value: 30, rarity: 15, color: "text-gray-300" },
    { id: "ufo", symbol: "🛸", value: 45, rarity: 13, color: "text-purple-400" },
    { id: "astronaut", symbol: "👨‍🚀", value: 65, rarity: 10, color: "text-white" },
    { id: "galaxy", symbol: "🌌", value: 100, rarity: 7, color: "text-purple-300" },
    { id: "black-hole", symbol: "🕳️", value: 180, rarity: 4, color: "text-black" },
    { id: "jackpot", symbol: "⭐", value: 450, rarity: 1, color: "text-yellow-300" },
  ],
};

// Magic Kingdom Theme
export const MAGIC_KINGDOM: SlotTheme = {
  name: "Magic Kingdom",
  background: "from-purple-600 to-pink-600",
  jackpotMultiplier: 999,
  symbols: [
    { id: "wand", symbol: "🪄", value: 8, rarity: 23, color: "text-purple-400" },
    { id: "potion", symbol: "🧪", value: 13, rarity: 20, color: "text-green-400" },
    { id: "crystal", symbol: "🔮", value: 20, rarity: 18, color: "text-blue-400" },
    { id: "book", symbol: "📚", value: 28, rarity: 16, color: "text-amber-600" },
    { id: "castle", symbol: "🏰", value: 40, rarity: 14, color: "text-gray-400" },
    { id: "unicorn", symbol: "🦄", value: 60, rarity: 11, color: "text-pink-400" },
    { id: "dragon", symbol: "🐉", value: 90, rarity: 8, color: "text-red-500" },
    { id: "wizard", symbol: "🧙‍♂️", value: 150, rarity: 5, color: "text-purple-600" },
    { id: "jackpot", symbol: "✨", value: 500, rarity: 2, color: "text-yellow-300" },
  ],
};

// Ocean Adventure Theme
export const OCEAN_ADVENTURE: SlotTheme = {
  name: "Ocean Adventure",
  background: "from-blue-500 to-teal-600",
  jackpotMultiplier: 650,
  symbols: [
    { id: "shell", symbol: "🐚", value: 6, rarity: 24, color: "text-pink-300" },
    { id: "fish", symbol: "🐠", value: 11, rarity: 21, color: "text-orange-400" },
    { id: "octopus", symbol: "🐙", value: 17, rarity: 19, color: "text-purple-400" },
    { id: "anchor", symbol: "⚓", value: 24, rarity: 17, color: "text-gray-400" },
    { id: "ship", symbol: "🚢", value: 35, rarity: 15, color: "text-blue-600" },
    { id: "whale", symbol: "🐋", value: 50, rarity: 12, color: "text-blue-400" },
    { id: "treasure", symbol: "💰", value: 80, rarity: 9, color: "text-gold" },
    { id: "kraken", symbol: "🦑", value: 130, rarity: 6, color: "text-red-600" },
    { id: "jackpot", symbol: "🔱", value: 380, rarity: 2, color: "text-teal-300" },
  ],
};

// All available themes
export const SLOT_THEMES = {
  classic: CLASSIC_FRUITS,
  diamond: DIAMOND_DELUXE,
  treasure: TREASURE_HUNT,
  sevens: LUCKY_SEVENS,
  west: WILD_WEST,
  space: SPACE_ADVENTURE,
  magic: MAGIC_KINGDOM,
  ocean: OCEAN_ADVENTURE,
};

// Get theme by key
export const getSlotTheme = (themeKey: keyof typeof SLOT_THEMES): SlotTheme => {
  return SLOT_THEMES[themeKey] || CLASSIC_FRUITS;
};

// Get random theme
export const getRandomSlotTheme = (): SlotTheme => {
  const themes = Object.values(SLOT_THEMES);
  return themes[Math.floor(Math.random() * themes.length)];
};
