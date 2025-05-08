import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

import { UserAchievementEntity } from './user-achievement.schema';

export enum ObjectiveType {
  LESSONS_COMPLETED = 'lessons_completed',
  CHAPTERS_COMPLETED = 'chapters_completed',
  COURSES_COMPLETED = 'courses_completed',
  SPECIFIC_COURSE_COMPLETED = 'specific_course_completed',
}

export const AchievementEntity = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type', {
    enum: [
      ObjectiveType.LESSONS_COMPLETED,
      ObjectiveType.CHAPTERS_COMPLETED,
      ObjectiveType.COURSES_COMPLETED,
      ObjectiveType.SPECIFIC_COURSE_COMPLETED,
    ],
  }).notNull(),
  courseId: integer('course_id'),
  target: integer('target').notNull(),
});

export type Achievement = typeof AchievementEntity.$inferSelect;
export type NewAchievement = typeof AchievementEntity.$inferInsert;

export const achievementsRelations = relations(
  AchievementEntity,
  ({ many }) => ({
    userAchievements: many(UserAchievementEntity),
  }),
);
