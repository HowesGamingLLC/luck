// Sound Effects Utility for McLuck Casino Games
// In a production app, these would trigger actual audio files

export enum SoundType {
  SPIN_START = 'spin_start',
  SPIN_STOP = 'spin_stop',
  REEL_STOP = 'reel_stop',
  SMALL_WIN = 'small_win',
  BIG_WIN = 'big_win',
  JACKPOT = 'jackpot',
  BONUS = 'bonus',
  BUTTON_CLICK = 'button_click',
  COIN_DROP = 'coin_drop',
  WHEEL_SPIN = 'wheel_spin',
  CELEBRATION = 'celebration',
  BACKGROUND_MUSIC = 'background_music',
}

export interface SoundConfig {
  volume: number;
  enabled: boolean;
  backgroundMusic: boolean;
}

class SoundManager {
  private config: SoundConfig = {
    volume: 0.7,
    enabled: true,
    backgroundMusic: false,
  };

  private soundQueue: SoundType[] = [];
  private isPlaying = false;

  // Update sound configuration
  updateConfig(newConfig: Partial<SoundConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Play sound effect (simulated - in real app would play actual audio)
  play(soundType: SoundType, options?: { volume?: number; delay?: number }) {
    if (!this.config.enabled) return;

    const volume = options?.volume ?? this.config.volume;
    const delay = options?.delay ?? 0;

    setTimeout(() => {
      this.playSound(soundType, volume);
    }, delay);
  }

  // Play multiple sounds in sequence
  playSequence(sounds: Array<{ type: SoundType; delay?: number; volume?: number }>) {
    sounds.forEach((sound, index) => {
      const totalDelay = sounds.slice(0, index).reduce((sum, s) => sum + (s.delay || 0), 0);
      this.play(sound.type, { volume: sound.volume, delay: totalDelay });
    });
  }

  // Slot machine specific sound sequences
  playSlotSpin(reelCount: number = 3) {
    this.play(SoundType.SPIN_START);
    
    // Play reel stop sounds with increasing delays
    for (let i = 0; i < reelCount; i++) {
      this.play(SoundType.REEL_STOP, { delay: 2000 + (i * 200) });
    }
  }

  playWinSequence(amount: number) {
    if (amount >= 1000) {
      // Jackpot win
      this.playSequence([
        { type: SoundType.JACKPOT, delay: 0 },
        { type: SoundType.CELEBRATION, delay: 500 },
        { type: SoundType.COIN_DROP, delay: 1000 },
        { type: SoundType.COIN_DROP, delay: 1200 },
        { type: SoundType.COIN_DROP, delay: 1400 },
      ]);
    } else if (amount >= 100) {
      // Big win
      this.playSequence([
        { type: SoundType.BIG_WIN, delay: 0 },
        { type: SoundType.COIN_DROP, delay: 500 },
        { type: SoundType.COIN_DROP, delay: 700 },
      ]);
    } else {
      // Small win
      this.playSequence([
        { type: SoundType.SMALL_WIN, delay: 0 },
        { type: SoundType.COIN_DROP, delay: 300 },
      ]);
    }
  }

  // Simulate playing the actual sound
  private playSound(soundType: SoundType, volume: number) {
    // In a real application, this would:
    // 1. Load the audio file for the sound type
    // 2. Set the volume
    // 3. Play the audio
    // 4. Handle any audio context requirements

    const soundDescriptions = {
      [SoundType.SPIN_START]: '🎵 Slot reels starting to spin...',
      [SoundType.SPIN_STOP]: '🎵 Reels coming to a stop',
      [SoundType.REEL_STOP]: '🎵 *click* Reel stopped',
      [SoundType.SMALL_WIN]: '🎵 Ding! Small win sound',
      [SoundType.BIG_WIN]: '🎵 🎊 Big win fanfare!',
      [SoundType.JACKPOT]: '🎵 🎰 JACKPOT ALARM! 🚨',
      [SoundType.BONUS]: '🎵 ✨ Bonus round activated',
      [SoundType.BUTTON_CLICK]: '🎵 *click*',
      [SoundType.COIN_DROP]: '🎵 💰 *clink clink*',
      [SoundType.WHEEL_SPIN]: '🎵 Wheel spinning sound',
      [SoundType.CELEBRATION]: '🎵 🎉 Victory celebration!',
      [SoundType.BACKGROUND_MUSIC]: '🎵 🎼 Casino background music',
    };

    console.log(`${soundDescriptions[soundType]} (Volume: ${Math.round(volume * 100)}%)`);

    // Add visual feedback for sound effects
    this.addSoundVisualFeedback(soundType);
  }

  // Add visual feedback when sounds play (useful for debugging and accessibility)
  private addSoundVisualFeedback(soundType: SoundType) {
    const soundElement = document.createElement('div');
    soundElement.className = 'fixed top-4 right-4 bg-purple text-white px-3 py-1 rounded text-xs z-50 pointer-events-none';
    soundElement.textContent = `🔊 ${soundType.replace('_', ' ')}`;
    soundElement.style.animation = 'coin-drop 2s ease-out forwards';
    
    document.body.appendChild(soundElement);
    
    setTimeout(() => {
      document.body.removeChild(soundElement);
    }, 2000);
  }

  // Toggle sound on/off
  toggle() {
    this.config.enabled = !this.config.enabled;
    return this.config.enabled;
  }

  // Set volume (0-1)
  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Hook for React components
export const useSoundEffects = () => {
  const playSound = (soundType: SoundType, options?: { volume?: number; delay?: number }) => {
    soundManager.play(soundType, options);
  };

  const playSlotSpin = (reelCount?: number) => {
    soundManager.playSlotSpin(reelCount);
  };

  const playWinSequence = (amount: number) => {
    soundManager.playWinSequence(amount);
  };

  const toggleSound = () => {
    return soundManager.toggle();
  };

  const setVolume = (volume: number) => {
    soundManager.setVolume(volume);
  };

  const getConfig = () => {
    return soundManager.getConfig();
  };

  return {
    playSound,
    playSlotSpin,
    playWinSequence,
    toggleSound,
    setVolume,
    getConfig,
    SoundType,
  };
};

// Utility functions for common sound patterns
export const playButtonClick = () => soundManager.play(SoundType.BUTTON_CLICK);
export const playSpinWheelSound = () => soundManager.play(SoundType.WHEEL_SPIN);
export const playJackpotSound = () => soundManager.play(SoundType.JACKPOT);

// Initialize background music (if enabled)
export const initializeAudio = () => {
  // In a real app, this would set up the audio context and preload sounds
  console.log('🎵 Audio system initialized for McLuck Casino');
};
