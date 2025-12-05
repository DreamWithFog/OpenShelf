import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptic Feedback Utility
 * Choreographed haptic patterns for gamification feedback
 * These are designed to feel like game rewards, not system UI clicks
 */

// ============================================
// BASIC IMPACTS (Single hits)
// ============================================

export const playLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const playMedium = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const playHeavy = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

export const playRigid = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
};

export const playSoft = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
};

// ============================================
// NOTIFICATION TYPES
// ============================================

export const playSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const playWarning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

export const playError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

export const playSelection = () => {
  Haptics.selectionAsync();
};

// ============================================
// CHOREOGRAPHED SEQUENCES
// ============================================

/**
 * Level Up - Drum roll finish
 * Pattern: Heavy-Heavy-Heavy-SUCCESS
 * Feels like a triumphant fanfare
 */
export const playLevelUp = () => {
  // 0ms: First heavy hit
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
  // 100ms: Second heavy hit
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 100);
  
  // 200ms: Third heavy hit
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 200);
  
  // 300ms: The finale - success notification
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 300);
};

/**
 * Epic Level Up - Slot Machine Jackpot
 * Pattern: Rapid ticks (2s) -> Pause -> Heavy-Heavy-SUCCESS
 * Duration: ~3 seconds
 * Returns a Promise that resolves when complete
 */
export const playEpicLevelUp = (): Promise<void> => {
  return new Promise((resolve) => {
    let tickCount = 0;
    const maxTicks = 20; // 20 ticks over 2 seconds (100ms each)
    
    // Phase 1: The Buildup (XP bar counting up)
    const buildupInterval = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      tickCount++;
      
      if (tickCount >= maxTicks) {
        clearInterval(buildupInterval);
        
        // Phase 2: The Drop (after 2.5s total)
        setTimeout(() => {
          // 2.5s: First heavy impact
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          
          // 2.6s: Second heavy impact
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 100);
          
          // 2.8s: Success notification finale
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Resolve the promise after the sequence completes
            setTimeout(() => {
              resolve();
            }, 200);
          }, 200);
          
        }, 500); // 500ms pause after buildup before the drop
      }
    }, 100); // Tick every 100ms
  });
};

/**
 * Locked - Double knock "Access Denied"
 * Pattern: Rigid-Rigid
 * Feels like knocking on a locked door
 */
export const playLocked = () => {
  // 0ms: First rigid knock
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  
  // 100ms: Second rigid knock
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }, 100);
};

/**
 * Theme Unlock - Click-Clunk mechanism
 * Pattern: Medium-Heavy
 * Feels like unlocking a latch
 */
export const playThemeUnlock = () => {
  // 0ms: The click
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  // 150ms: The clunk
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 150);
};

/**
 * XP Gain - Quick light tap
 * Designed to be rapid-fired without overlap issues
 */
export const playXPGain = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Achievement Unlocked - Long buzz with success
 * Pattern: Vibration + Success notification
 * Feels like a major accomplishment
 */
export const playAchievement = () => {
  // Long vibration buzz (400ms)
  Vibration.vibrate(400);
  
  // Success notification on top
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 200);
};

/**
 * Book Finished - Triumphant cascade
 * Pattern: Heavy-Heavy-Medium-SUCCESS
 * Feels like closing a book with satisfaction
 */
export const playBookFinished = () => {
  // 0ms: First thump
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
  // 120ms: Second thump
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 120);
  
  // 240ms: Lighter follow-through
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 240);
  
  // 400ms: Success finale
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 400);
};

/**
 * Session Complete - Satisfying confirmation
 * Pattern: Medium-Heavy-Success
 * Feels like checking off a task
 */
export const playSessionComplete = () => {
  // 0ms: Initial tap
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
  // 100ms: Confirmation thump
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 100);
  
  // 250ms: Success
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 250);
};

/**
 * Milestone Reached - Epic vibration
 * Pattern: Long vibration + Heavy cascade + Success
 * For major milestone achievements
 */
export const playMilestone = () => {
  // Long buzz
  Vibration.vibrate(300);
  
  // 150ms: Heavy impact
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 150);
  
  // 300ms: Another heavy
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 300);
  
  // 450ms: Success notification
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 450);
};

/**
 * Streak Bonus - Quick double tap
 * Pattern: Light-Medium
 * For streak achievements
 */
export const playStreak = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 80);
};

/**
 * Button Press - Standard interaction
 * Single medium impact for general buttons
 */
export const playButtonPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Delete/Destructive Action - Warning double tap
 * Pattern: Rigid-Warning
 * Feels like a cautious confirmation
 */
export const playDestructive = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, 100);
};

/**
 * Error/Invalid - Sharp rejection
 * Pattern: Rigid-Rigid-Error
 * Feels like something went wrong
 */
export const playInvalid = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }, 80);
  
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, 180);
};

/**
 * Timer Start - Activation feel
 * Pattern: Light-Medium-Heavy (ascending)
 * Feels like revving up
 */
export const playTimerStart = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 80);
  
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 160);
};

/**
 * Timer Stop - Deactivation feel
 * Pattern: Heavy-Medium-Light (descending)
 * Feels like winding down
 */
export const playTimerStop = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 80);
  
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, 160);
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Basic
  playLight,
  playMedium,
  playHeavy,
  playRigid,
  playSoft,
  
  // Notifications
  playSuccess,
  playWarning,
  playError,
  playSelection,
  
  // Gamification
  playLevelUp,
  playEpicLevelUp,
  playAchievement,
  playMilestone,
  playXPGain,
  playStreak,
  playBookFinished,
  playSessionComplete,
  
  // Theme
  playThemeUnlock,
  playLocked,
  
  // Actions
  playButtonPress,
  playDestructive,
  playInvalid,
  playTimerStart,
  playTimerStop,
};
