import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

import { LessonProgressEntity } from './lesson-progress.schema';
import { UserAchievementEntity } from './user-achievement.schema';

export const UserEntity = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export type User = typeof UserEntity.$inferSelect;
export type NewUser = typeof UserEntity.$inferInsert;

export const usersRelations = relations(UserEntity, ({ many }) => ({
  progress: many(LessonProgressEntity),
  achievements: many(UserAchievementEntity),
}));
