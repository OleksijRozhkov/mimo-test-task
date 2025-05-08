import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { ChapterEntity } from './chapter.schema';
import { LessonProgressEntity } from './lesson-progress.schema';

export const LessonEntity = sqliteTable(
  'lessons',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    order: integer('order').notNull(),
    chapterId: integer('chapter_id')
      .notNull()
      .references(() => ChapterEntity.id, { onDelete: 'cascade' }),
  },
  (t) => [uniqueIndex('lesson_chapter_order_idx').on(t.chapterId, t.order)],
);

export type Lesson = typeof LessonEntity.$inferSelect;
export type NewLesson = typeof LessonEntity.$inferInsert;

export const lessonsRelations = relations(LessonEntity, ({ one, many }) => ({
  chapter: one(ChapterEntity, {
    fields: [LessonEntity.chapterId],
    references: [ChapterEntity.id],
  }),
  progress: many(LessonProgressEntity),
}));
