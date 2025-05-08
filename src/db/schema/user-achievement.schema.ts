import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { AchievementEntity } from './achievement.schema';
import { UserEntity } from './user.schema';

export const UserAchievementEntity = sqliteTable(
  'user_achievement',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => UserEntity.id, { onDelete: 'cascade' }),
    achievementId: integer('achievement_id')
      .notNull()
      .references(() => AchievementEntity.id, { onDelete: 'cascade' }),
    completed: integer('completed', { mode: 'boolean' })
      .notNull()
      .default(false),
    progress: integer('progress').notNull().default(0),
    completedAt: text('completed_at'),
  },
  (t) => [
    uniqueIndex('user_achievement_user_id_achievement_id_idx').on(
      t.userId,
      t.achievementId,
    ),
  ],
);

export type UserAchievement = typeof UserAchievementEntity.$inferSelect;
export type NewUserAchievement = typeof UserAchievementEntity.$inferInsert;

export const userAchievementRelations = relations(
  UserAchievementEntity,
  ({ one }) => ({
    user: one(UserEntity, {
      fields: [UserAchievementEntity.userId],
      references: [UserEntity.id],
    }),
    achievement: one(AchievementEntity, {
      fields: [UserAchievementEntity.achievementId],
      references: [AchievementEntity.id],
    }),
  }),
);
