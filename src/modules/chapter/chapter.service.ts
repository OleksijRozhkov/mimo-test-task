import { eq, and, gte, lt, gt, lte, sql, ne } from 'drizzle-orm';

import { db } from '../../db';
import { ChapterEntity, type Chapter } from '../../db/schema';
import { NotFoundError, BadRequestError } from '../../utils/errors/app-error';
import { courseService } from '../course/course.service';

import { CreateChapterRequestDto, UpdateChapterRequestDto } from './dtos';

export class ChapterService {
  public async createChapter(dto: CreateChapterRequestDto): Promise<Chapter> {
    const { name, order, courseId } = dto;

    await courseService.verifyCourseExists(courseId);

    if (order > 1) {
      await this.verifyChapterExistsByCourseAndOrder(courseId, order - 1);
    }

    return await db.transaction(async (transaction) => {
      // Increment order for all chapters in this course with order >= new chapter's order
      await transaction
        .update(ChapterEntity)
        .set({ order: sql`${ChapterEntity.order} + 1` })
        .where(
          and(
            eq(ChapterEntity.courseId, courseId),
            gte(ChapterEntity.order, order),
          ),
        );

      const [chapter] = await transaction
        .insert(ChapterEntity)
        .values({
          name,
          order,
          courseId,
        })
        .returning();

      return chapter;
    });
  }

  public async updateChapter(
    chapterId: number,
    dto: UpdateChapterRequestDto,
  ): Promise<Chapter> {
    const { name, order: newOrder } = dto;

    const chapter = await this.getChapterById(chapterId);
    const oldOrder = chapter.order;
    const courseId = chapter.courseId;

    return await db.transaction(async (transaction): Promise<Chapter> => {
      const updates: Partial<Chapter> = {};

      if (name !== undefined) {
        updates.name = name;
      }

      const promises: Promise<any>[] = [];

      // Handle order change
      if (newOrder !== undefined && newOrder !== oldOrder) {
        if (newOrder < oldOrder) {
          // Moving up: increment order for chapters between newOrder and oldOrder - 1
          promises.push(
            transaction
              .update(ChapterEntity)
              .set({ order: sql`${ChapterEntity.order} + 1` })
              .where(
                and(
                  eq(ChapterEntity.courseId, courseId),
                  gte(ChapterEntity.order, newOrder),
                  lt(ChapterEntity.order, oldOrder),
                ),
              ),
          );
        } else {
          await this.verifyChapterExistsByCourseAndOrder(
            courseId,
            newOrder - 1,
          );

          // Moving down: decrement order for chapters between oldOrder + 1 and newOrder
          promises.push(
            transaction
              .update(ChapterEntity)
              .set({ order: sql`${ChapterEntity.order} - 1` })
              .where(
                and(
                  eq(ChapterEntity.courseId, courseId),
                  gt(ChapterEntity.order, oldOrder),
                  lte(ChapterEntity.order, newOrder),
                  ne(ChapterEntity.id, chapterId),
                ),
              ),
          );
        }
        updates.order = newOrder;
      }

      promises.push(
        transaction
          .update(ChapterEntity)
          .set(updates)
          .where(eq(ChapterEntity.id, chapterId))
          .returning(),
      );

      const results = await Promise.all(promises);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return results[results.length - 1][0] as Chapter;
    });
  }

  public async deleteChapter(chapterId: number): Promise<void> {
    const chapter = await this.getChapterById(chapterId);
    const chapterOrder = chapter.order;
    const courseId = chapter.courseId;

    await db.transaction(async (transaction) => {
      const deletePromise = transaction
        .delete(ChapterEntity)
        .where(eq(ChapterEntity.id, chapterId));

      // Decrement order for all chapters in the same course with order > deleted chapter's order
      const updatePromise = transaction
        .update(ChapterEntity)
        .set({ order: sql`${ChapterEntity.order} - 1` })
        .where(
          and(
            eq(ChapterEntity.courseId, courseId),
            gt(ChapterEntity.order, chapterOrder),
          ),
        );

      await Promise.all([deletePromise, updatePromise]);
    });
  }

  public async getChapterById(chapterId: number): Promise<Chapter> {
    const [chapter] = await db
      .select()
      .from(ChapterEntity)
      .where(eq(ChapterEntity.id, chapterId));

    if (!chapter) {
      throw new NotFoundError(`Chapter with ID ${chapterId} not found`);
    }

    return chapter;
  }

  public async getAllChapters(courseId: number): Promise<Chapter[]> {
    const chapters = await db
      .select()
      .from(ChapterEntity)
      .where(eq(ChapterEntity.courseId, courseId))
      .orderBy(ChapterEntity.order);

    if (chapters.length === 0) {
      await courseService.verifyCourseExists(courseId);
    }

    return chapters;
  }

  public async verifyChapterExists(chapterId: number): Promise<void> {
    const [chapter] = await db
      .select()
      .from(ChapterEntity)
      .where(eq(ChapterEntity.id, chapterId));
    if (!chapter) {
      throw new NotFoundError(`Chapter with ID ${chapterId} not found`);
    }
  }

  private async verifyChapterExistsByCourseAndOrder(
    courseId: number,
    order: number,
  ): Promise<void> {
    const [chapter] = await db
      .select()
      .from(ChapterEntity)
      .where(
        and(
          eq(ChapterEntity.courseId, courseId),
          eq(ChapterEntity.order, order),
        ),
      );
    if (!chapter) {
      throw new BadRequestError(
        `Cannot create or move chapter because chapter (order ${order}) does not exist`,
      );
    }
  }
}

export const chapterService = new ChapterService();
