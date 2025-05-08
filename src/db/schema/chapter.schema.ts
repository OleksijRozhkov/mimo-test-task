import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { CourseEntity } from './course.schema';
import { LessonEntity } from './lesson.schema';

export const ChapterEntity = sqliteTable(
  'chapters',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    order: integer('order').notNull(),
    courseId: integer('course_id')
      .notNull()
      .references(() => CourseEntity.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('chapter_course_order_idx').on(t.courseId, t.order)],
);

export type Chapter = typeof ChapterEntity.$inferSelect;
export type NewChapter = typeof ChapterEntity.$inferInsert;

export const chaptersRelations = relations(ChapterEntity, ({ one, many }) => ({
  course: one(CourseEntity, {
    fields: [ChapterEntity.courseId],
    references: [CourseEntity.id],
  }),
  lessons: many(LessonEntity),
}));
