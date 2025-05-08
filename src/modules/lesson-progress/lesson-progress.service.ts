import { eq, and, sql, isNull } from 'drizzle-orm';
import { SQLiteTransaction } from 'drizzle-orm/sqlite-core';

import { db } from '../../db';
import {
  LessonProgressEntity,
  ChapterEntity,
  LessonEntity,
} from '../../db/schema';
import { userAchievementService } from '../achievement/user-achievement.service';
import { chapterService } from '../chapter/chapter.service';
import { lessonService } from '../lesson/lesson.service';
import { userService } from '../user/user.service';

import { RecordProgressRequestDto, RecordProgressResponseDto } from './dtos';

export class LessonProgressService {
  public async recordProgress(
    dto: RecordProgressRequestDto,
  ): Promise<RecordProgressResponseDto> {
    const { lessonId, startedAt, completedAt, userId } = dto;

    return await db.transaction(async (transaction) => {
      await userService.verifyUserExists(userId);
      const lesson = await lessonService.getLessonById(lessonId);

      // Check if this lesson was already completed by the user
      const [existingProgress] = await transaction
        .select()
        .from(LessonProgressEntity)
        .where(
          and(
            eq(LessonProgressEntity.userId, userId),
            eq(LessonProgressEntity.lessonId, lessonId),
            eq(LessonProgressEntity.completed, true),
          ),
        );
      const isFirstCompletion = !existingProgress;

      // Create progress record
      const [progress] = await transaction
        .insert(LessonProgressEntity)
        .values({
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(completedAt).toISOString(),
        })
        .returning();

      // Only check chapter completion if this is the first time the user completes this lesson
      if (isFirstCompletion) {
        const { completedChapterId, completedCourseId } =
          await this.checkUserChapterAndCourseCompletion(
            transaction,
            userId,
            lesson.chapterId,
          );

        await userAchievementService.checkAndUpdateUserAchievements(
          transaction,
          userId,
          lessonId,
          completedChapterId,
          completedCourseId,
        );
      }

      return {
        message: 'Lesson progress recorded successfully',
        progress: {
          id: progress.id,
          lessonId,
          userId,
          startedAt: new Date(startedAt),
          completedAt: progress.completedAt
            ? new Date(progress.completedAt)
            : new Date(),
        },
      };
    });
  }

  public async countLessonsCompleted(userId: number): Promise<number> {
    const [result] = await db
      .select({
        count: sql<number>`count(distinct ${LessonProgressEntity.lessonId})`,
      })
      .from(LessonProgressEntity)
      .where(
        and(
          eq(LessonProgressEntity.userId, userId),
          eq(LessonProgressEntity.completed, true),
        ),
      );
    return result.count;
  }

  private async checkUserChapterAndCourseCompletion(
    transaction: SQLiteTransaction<any, any, any, any>,
    userId: number,
    chapterId: number,
  ): Promise<{ completedChapterId?: number; completedCourseId?: number }> {
    const chapter = await chapterService.getChapterById(chapterId);
    const courseId = chapter.courseId;

    // Find all chapters in the course that the user has NOT completed
    const uncompletedChapters = await transaction
      .select({ id: ChapterEntity.id })
      .from(ChapterEntity)
      .innerJoin(LessonEntity, eq(ChapterEntity.id, LessonEntity.chapterId))
      .leftJoin(
        LessonProgressEntity,
        and(
          eq(LessonEntity.id, LessonProgressEntity.lessonId),
          eq(LessonProgressEntity.userId, userId),
        ),
      )
      .where(
        and(
          eq(ChapterEntity.courseId, courseId),
          isNull(LessonProgressEntity.id),
        ),
      );

    return {
      completedChapterId: uncompletedChapters.some(({ id }) => id === chapterId)
        ? chapterId
        : undefined,
      completedCourseId:
        uncompletedChapters.length === 0 ? courseId : undefined,
    };
  }
}

export const lessonProgressService = new LessonProgressService();
