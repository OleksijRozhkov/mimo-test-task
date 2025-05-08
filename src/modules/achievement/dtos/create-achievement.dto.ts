import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

import { ObjectiveType } from '../../../db/schema/achievement.schema';

export class CreateAchievementRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  public description: string;

  @IsNotEmpty()
  @IsEnum(ObjectiveType)
  public type: ObjectiveType;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  public target: number;

  @IsOptional()
  @IsNumber()
  public courseId?: number;
}

export class CreateAchievementResponseDto {
  public id: number;
  public name: string;
  public description: string;
  public type: ObjectiveType;
  public target: number;
  public courseId?: number;
}
