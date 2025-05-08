import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { AchievementEntity, Achievement, ObjectiveType } from '../../db/schema';
import { NotFoundError, BadRequestError } from '../../utils/errors/app-error';
import { courseService } from '../course/course.service';

import {
  CreateAchievementRequestDto,
  UpdateAchievementRequestDto,
  AchievementDto,
  AchievementsResponseDto,
} from './dtos';

export class AdminAchievementService {
  public async createAchievement(
    dto: CreateAchievementRequestDto,
  ): Promise<AchievementDto> {
    const { name, description, type, target, courseId } = dto;

    if (courseId !== undefined) {
      if (type !== ObjectiveType.SPECIFIC_COURSE_COMPLETED) {
        throw new BadRequestError(
          'Course ID can only be set for course completion achievements',
        );
      }

      if (target !== 1) {
        throw new BadRequestError(
          'Target must be 1 for course completion achievements',
        );
      }

      await courseService.verifyCourseExists(courseId);
    }

    const [newAchievement] = await db
      .insert(AchievementEntity)
      .values({
        name,
        description,
        type,
        target,
        courseId: courseId ?? null,
      })
      .returning();

    return {
      id: newAchievement.id,
      name: newAchievement.name,
      description: newAchievement.description,
      type: newAchievement.type,
      target: newAchievement.target,
      courseId: newAchievement.courseId ?? undefined,
    };
  }

  public async updateAchievement(
    id: number,
    dto: UpdateAchievementRequestDto,
  ): Promise<AchievementDto> {
    const { name, description, courseId } = dto;

    const [achievement] = await db
      .select()
      .from(AchievementEntity)
      .where(eq(AchievementEntity.id, id));
    if (!achievement) {
      throw new NotFoundError(`Achievement with ID ${id} not found`);
    }

    const updates: Partial<Achievement> = {};
    if (name !== undefined) {
      updates.name = name;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (courseId !== undefined) {
      if (achievement.type === ObjectiveType.SPECIFIC_COURSE_COMPLETED) {
        await courseService.verifyCourseExists(courseId);
      }
      updates.courseId = courseId;
    }

    const [updatedAchievement] = await db
      .update(AchievementEntity)
      .set(updates)
      .where(eq(AchievementEntity.id, id))
      .returning();

    return {
      id: updatedAchievement.id,
      name: updatedAchievement.name,
      description: updatedAchievement.description,
      type: updatedAchievement.type,
      target: updatedAchievement.target,
      courseId: updatedAchievement.courseId ?? undefined,
    };
  }

  public async deleteAchievement(id: number): Promise<void> {
    const [deleted] = await db
      .delete(AchievementEntity)
      .where(eq(AchievementEntity.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundError(`Achievement with ID ${id} not found`);
    }
  }

  public async getAchievementById(id: number): Promise<AchievementDto> {
    const [achievement] = await db
      .select()
      .from(AchievementEntity)
      .where(eq(AchievementEntity.id, id));

    if (!achievement) {
      throw new NotFoundError(`Achievement with ID ${id} not found`);
    }

    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      target: achievement.target,
      courseId: achievement.courseId ?? undefined,
    };
  }

  public async getAllAchievements(): Promise<AchievementsResponseDto> {
    const achievementsList = await db.select().from(AchievementEntity);

    return {
      achievements: achievementsList.map((achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        type: achievement.type,
        target: achievement.target,
        courseId: achievement.courseId ?? undefined,
      })),
    };
  }
}

export const adminAchievementService = new AdminAchievementService();
