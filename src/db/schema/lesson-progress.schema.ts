import { relations } from 'drizzle-orm';
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { LessonEntity } from './lesson.schema';
import { UserEntity } from './user.schema';

export const LessonProgressEntity = sqliteTable(
  'lesson_progress',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => UserEntity.id, { onDelete: 'cascade' }),
    lessonId: integer('lesson_id')
      .notNull()
      .references(() => LessonEntity.id, { onDelete: 'cascade' }),
    completed: integer('completed', { mode: 'boolean' })
      .notNull()
      .default(false),
    completedAt: text('completed_at'),
  },
  (t) => [
    uniqueIndex('lesson_progress_user_lesson_idx').on(t.userId, t.lessonId),
  ],
);

export type LessonProgress = typeof LessonProgressEntity.$inferSelect;
export type NewLessonProgress = typeof LessonProgressEntity.$inferInsert;

export const lessonProgressRelations = relations(
  LessonProgressEntity,
  ({ one }) => ({
    user: one(UserEntity, {
      fields: [LessonProgressEntity.userId],
      references: [UserEntity.id],
    }),
    lesson: one(LessonEntity, {
      fields: [LessonProgressEntity.lessonId],
      references: [LessonEntity.id],
    }),
  }),
);
