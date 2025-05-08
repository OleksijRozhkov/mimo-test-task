import { ObjectiveType } from '../../../db/schema/achievement.schema';

export class AchievementDto {
  public id: number;
  public name: string;
  public description: string;
  public type: ObjectiveType;
  public target: number;
  public courseId?: number;
}

export class AchievementResponseDto {
  public id: number;
  public name: string;
  public description: string;
  public completed: boolean;
  public progress: number;
  public target: number;
}

export class GetAchievementsResponseDto {
  public achievements: AchievementResponseDto[];
}

export class AchievementsResponseDto {
  public achievements: AchievementDto[];
}
