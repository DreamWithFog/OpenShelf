import { SQLiteDatabase } from 'expo-sqlite';

export interface UnlockedMilestone {
  milestone_id: string;
  unlocked_at: string;
  notified: number;
  xp_awarded: number;
}

export const getUnlockedMilestones = async (db: SQLiteDatabase): Promise<Set<string>> => {
  const results = await db.getAllAsync<UnlockedMilestone>(
    'SELECT milestone_id FROM user_milestones'
  );
  return new Set(results.map(r => r.milestone_id));
};

export const unlockMilestone = async (
  db: SQLiteDatabase,
  milestoneId: string,
  xpAwarded: number
): Promise<void> => {
  await db.runAsync(
    `INSERT OR IGNORE INTO user_milestones (milestone_id, unlocked_at, xp_awarded, notified)
     VALUES (?, ?, ?, 0)`,
    [milestoneId, new Date().toISOString(), xpAwarded]
  );
};

export const markMilestoneNotified = async (
  db: SQLiteDatabase,
  milestoneId: string
): Promise<void> => {
  await db.runAsync(
    'UPDATE user_milestones SET notified = 1 WHERE milestone_id = ?',
    [milestoneId]
  );
};

export const getUnnotifiedMilestones = async (db: SQLiteDatabase): Promise<UnlockedMilestone[]> => {
  return await db.getAllAsync<UnlockedMilestone>(
    'SELECT * FROM user_milestones WHERE notified = 0'
  );
};

export const getAllUnlockedMilestones = async (db: SQLiteDatabase): Promise<UnlockedMilestone[]> => {
  return await db.getAllAsync<UnlockedMilestone>(
    'SELECT * FROM user_milestones ORDER BY unlocked_at DESC'
  );
};
