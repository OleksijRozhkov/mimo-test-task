import { relations } from 'drizzle-orm';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

import { ChapterEntity } from './chapter.schema';

export const CourseEntity = sqliteTable('courses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

export type Course = typeof CourseEntity.$inferSelect;
export type NewCourse = typeof CourseEntity.$inferInsert;

export const coursesRelations = relations(CourseEntity, ({ many }) => ({
  chapters: many(ChapterEntity),
}));
