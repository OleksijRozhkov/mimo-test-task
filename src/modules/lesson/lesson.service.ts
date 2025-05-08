import { eq, and, gte, lt, gt, lte, sql, ne } from 'drizzle-orm';

import { db } from '../../db';
import { LessonEntity, type Lesson } from '../../db/schema';
import { NotFoundError, BadRequestError } from '../../utils/errors/app-error';
import { chapterService } from '../chapter/chapter.service';

import { CreateLessonRequestDto, UpdateLessonRequestDto } from './dtos';

export class LessonService {
  public async createLesson(dto: CreateLessonRequestDto): Promise<Lesson> {
    const { name, order, chapterId } = dto;

    await chapterService.verifyChapterExists(chapterId);

    // Ensure previous lesson exists if order > 1
    if (order > 1) {
      await this.verifyLessonExistsByChapterAndOrder(chapterId, order - 1);
    }

    return await db.transaction(async (transaction) => {
      // Increment order for all lessons in this chapter with order >= new lesson's order
      await transaction
        .update(LessonEntity)
        .set({ order: sql`${LessonEntity.order} + 1` })
        .where(
          and(
            eq(LessonEntity.chapterId, chapterId),
            gte(LessonEntity.order, order),
          ),
        );

      const [lesson] = await transaction
        .insert(LessonEntity)
        .values({
          name,
          order,
          chapterId,
        })
        .returning();

      return lesson;
    });
  }

  public async updateLesson(
    lessonId: number,
    dto: UpdateLessonRequestDto,
  ): Promise<Lesson> {
    const { name, order: newOrder } = dto;
    const lesson = await this.getLessonById(lessonId);
    const oldOrder = lesson.order;
    const chapterId = lesson.chapterId;

    return await db.transaction(async (transaction): Promise<Lesson> => {
      const promises: Promise<any>[] = [];
      const updates: Partial<Lesson> = {};

      if (name !== undefined) {
        updates.name = name;
      }

      // Handle order change
      if (newOrder !== undefined && newOrder !== oldOrder) {
        if (newOrder < oldOrder) {
          // Moving up: increment order for lessons between newOrder and oldOrder - 1
          promises.push(
            transaction
              .update(LessonEntity)
              .set({ order: sql`${LessonEntity.order} + 1` })
              .where(
                and(
                  eq(LessonEntity.chapterId, chapterId),
                  gte(LessonEntity.order, newOrder),
                  lt(LessonEntity.order, oldOrder),
                  sql`${LessonEntity.id} != ${lessonId}`,
                ),
              ),
          );
        } else if (newOrder > oldOrder) {
          await this.verifyLessonExistsByChapterAndOrder(chapterId, newOrder);

          // Moving down: decrement order for lessons between oldOrder + 1 and newOrder
          promises.push(
            transaction
              .update(LessonEntity)
              .set({ order: sql`${LessonEntity.order} - 1` })
              .where(
                and(
                  eq(LessonEntity.chapterId, chapterId),
                  gt(LessonEntity.order, oldOrder),
                  lte(LessonEntity.order, newOrder),
                  ne(LessonEntity.id, lessonId),
                ),
              ),
          );
        }
        updates.order = newOrder;
      }

      promises.push(
        transaction
          .update(LessonEntity)
          .set(updates)
          .where(eq(LessonEntity.id, lessonId))
          .returning(),
      );

      const results = await Promise.all(promises);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return results[results.length - 1][0] as Lesson;
    });
  }

  public async deleteLesson(lessonId: number): Promise<Lesson> {
    const lesson = await this.getLessonById(lessonId);
    const lessonOrder = lesson.order;
    const chapterId = lesson.chapterId;

    await db.transaction(async (transaction) => {
      const removePromise = transaction
        .delete(LessonEntity)
        .where(eq(LessonEntity.id, lessonId));

      // Decrement order for all lessons in the same chapter with order > deleted lesson's order
      const updatePromise = transaction
        .update(LessonEntity)
        .set({ order: sql`${LessonEntity.order} - 1` })
        .where(
          and(
            eq(LessonEntity.chapterId, chapterId),
            gt(LessonEntity.order, lessonOrder),
          ),
        );

      await Promise.all([removePromise, updatePromise]);
    });

    return lesson;
  }

  public async getLessonById(lessonId: number): Promise<Lesson> {
    const [lesson] = await db
      .select()
      .from(LessonEntity)
      .where(eq(LessonEntity.id, lessonId));

    if (!lesson) {
      throw new NotFoundError(`Lesson with ID ${lessonId} not found`);
    }

    return lesson;
  }

  public async getAllLessons(chapterId: number): Promise<Lesson[]> {
    const lessons = await db
      .select()
      .from(LessonEntity)
      .where(eq(LessonEntity.chapterId, chapterId))
      .orderBy(LessonEntity.order);

    if (lessons.length === 0) {
      await chapterService.verifyChapterExists(chapterId);
    }

    return lessons;
  }

  public async verifyLessonExists(lessonId: number): Promise<void> {
    const [lesson] = await db
      .select()
      .from(LessonEntity)
      .where(eq(LessonEntity.id, lessonId));
    if (!lesson) {
      throw new NotFoundError(`Lesson with ID ${lessonId} not found`);
    }
  }

  private async verifyLessonExistsByChapterAndOrder(
    chapterId: number,
    order: number,
  ): Promise<void> {
    const [lesson] = await db
      .select()
      .from(LessonEntity)
      .where(
        and(
          eq(LessonEntity.chapterId, chapterId),
          eq(LessonEntity.order, order),
        ),
      );
    if (!lesson) {
      throw new BadRequestError(
        `Cannot create or move lesson because lesson (order ${order}) does not exist`,
      );
    }
  }
}

export const lessonService = new LessonService();
