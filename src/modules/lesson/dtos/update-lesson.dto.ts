import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

import { LessonDto } from './params.dto';

export class UpdateLessonRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  public name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  public order?: number;

  @IsOptional()
  @IsNumber()
  public chapterId?: number;
}

export class UpdateLessonResponseDto {
  public message: string;
  public lesson: LessonDto;
}
