import { eq, and, inArray, sql } from 'drizzle-orm';
import { SQLiteTransaction } from 'drizzle-orm/sqlite-core';

import { db } from '../../db';
import {
  AchievementEntity,
  UserAchievementEntity,
  ObjectiveType,
  Achievement,
  UserAchievement,
} from '../../db/schema';
import { userService } from '../user/user.service';

import { AchievementResponseDto, GetAchievementsResponseDto } from './dtos';

type AchievementWithUserAchievement = {
  achievement: Achievement;
  userAchievement: UserAchievement | null;
};

export class UserAchievementService {
  public async getUserAchievements(
    userId: number,
  ): Promise<GetAchievementsResponseDto> {
    await userService.verifyUserExists(userId);

    const userAchievements = await db
      .select({
        achievement: AchievementEntity,
        userAchievement: UserAchievementEntity,
      })
      .from(UserAchievementEntity)
      .innerJoin(
        AchievementEntity,
        eq(UserAchievementEntity.achievementId, AchievementEntity.id),
      )
      .where(eq(UserAchievementEntity.userId, userId));

    const formattedAchievements: AchievementResponseDto[] =
      userAchievements.map(({ achievement, userAchievement }) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        completed: userAchievement.completed,
        progress: userAchievement.completed
          ? achievement.target
          : userAchievement.progress,
        target: achievement.target,
      }));

    return {
      achievements: formattedAchievements,
    };
  }

  public async checkAndUpdateUserAchievements(
    transaction: SQLiteTransaction<any, any, any, any>,
    userId: number,
    completedLessonId?: number,
    completedChapterId?: number,
    completedCourseId?: number,
  ): Promise<void> {
    if (!completedLessonId) return;

    const achievements = await this.getAchievementsWithUserAchievements(
      transaction,
      userId,
    );

    await this.insertMissingUserAchievementsIfNeeded(
      transaction,
      userId,
      achievements,
    );

    const achievementTypesToIncrementProgress: ObjectiveType[] = [
      ObjectiveType.LESSONS_COMPLETED,
    ];
    if (completedChapterId) {
      achievementTypesToIncrementProgress.push(
        ObjectiveType.CHAPTERS_COMPLETED,
      );
    }
    if (completedCourseId) {
      achievementTypesToIncrementProgress.push(ObjectiveType.COURSES_COMPLETED);
    }

    const achievementsToUpdate = this.getAchievementsToUpdate(
      achievements,
      achievementTypesToIncrementProgress,
      completedCourseId,
    );

    await this.updateAchievementsProgress(
      transaction,
      userId,
      achievementsToUpdate,
    );
    await this.completeAchievementsIfNeeded(
      transaction,
      userId,
      achievementsToUpdate,
    );
  }

  private async getAchievementsWithUserAchievements(
    transaction: SQLiteTransaction<any, any, any, any>,
    userId: number,
  ): Promise<AchievementWithUserAchievement[]> {
    return transaction
      .select({
        achievement: AchievementEntity,
        userAchievement: UserAchievementEntity,
      })
      .from(AchievementEntity)
      .leftJoin(
        UserAchievementEntity,
        and(
          eq(AchievementEntity.id, UserAchievementEntity.achievementId),
          eq(UserAchievementEntity.userId, userId),
        ),
      );
  }

  private async insertMissingUserAchievementsIfNeeded(
    transaction: SQLiteTransaction<any, any, any, any>,
    userId: number,
    achievements: AchievementWithUserAchievement[],
  ): Promise<void> {
    // TODO: add specifying initial progress for new user achievements
    const missingUserAchievements = achievements.filter(
      ({ userAchievement }) => !userAchievement,
    );
    if (missingUserAchievements.length > 0) {
      await transaction.insert(UserAchievementEntity).values(
        missingUserAchievements.map(({ achievement }) => ({
          userId,
          achievementId: achievement.id,
        })),
      );
    }
  }

  private getAchievementsToUpdate(
    achievements: AchievementWithUserAchievement[],
    achievementTypesToIncrementProgress: ObjectiveType[],
    completedCourseId?: number,
  ): AchievementWithUserAchievement[] {
    const achievementsToUpdate = achievements.filter(
      ({ achievement, userAchievement }) =>
        !userAchievement?.completed &&
        achievementTypesToIncrementProgress.includes(achievement.type),
    );
    if (completedCourseId) {
      const courseAchievement = achievements.find(
        ({ achievement }) =>
          achievement.type === ObjectiveType.SPECIFIC_COURSE_COMPLETED &&
          achievement.courseId === completedCourseId,
      );
      if (courseAchievement && !courseAchievement.userAchievement?.completed) {
        achievementsToUpdate.push(courseAchievement);
      }
    }
    return achievementsToUpdate;
  }

  private async updateAchievementsProgress(
    transaction: SQLiteTransaction<any, any, any, any>,
    userId: number,
    achievementsToUpdate: AchievementWithUserAchievement[],
  ): Promise<void> {
    if (achievementsToUpdate.length === 0) return;
    await transaction
      .update(UserAchievementEntity)
      .set({
        progress: sql`${UserAchievementEntity.progress} + 1`,
      })
      .where(
        and(
          eq(UserAchievementEntity.userId, userId),
          inArray(
            UserAchievementEntity.achievementId,
            achievementsToUpdate.map(({ achievement }) => achievement.id),
          ),
        ),
      );
  }

  private async completeAchievementsIfNeeded(
    transaction: SQLiteTransaction<any, any, any, any>,
    userId: number,
    achievementsToUpdate: AchievementWithUserAchievement[],
  ): Promise<void> {
    const achievementsToComplete = achievementsToUpdate.filter(
      ({ achievement, userAchievement }) =>
        (userAchievement?.progress || 0) + 1 >= achievement.target,
    );
    if (achievementsToComplete.length !== 0) {
      const now = new Date().toISOString();
      await transaction
        .update(UserAchievementEntity)
        .set({
          completed: true,
          completedAt: now,
        })
        .where(
          and(
            eq(UserAchievementEntity.userId, userId),
            inArray(
              UserAchievementEntity.achievementId,
              achievementsToComplete.map(({ achievement }) => achievement.id),
            ),
          ),
        );
    }
  }
}

export const userAchievementService = new UserAchievementService();
