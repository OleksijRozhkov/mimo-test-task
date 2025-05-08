import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

import { ObjectiveType } from '../../../db/schema/achievement.schema';

export class UpdateAchievementRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  public description?: string;

  @IsOptional()
  @IsNumber()
  public courseId?: number;
}

export class UpdateAchievementResponseDto {
  public id: number;
  public name: string;
  public description: string;
  public type: ObjectiveType;
  public target: number;
  public courseId?: number;
}
