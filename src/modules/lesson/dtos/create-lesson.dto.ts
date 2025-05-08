import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

import { LessonDto } from './params.dto';

export class CreateLessonRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  public order: number;

  @IsNotEmpty()
  @IsNumber()
  public chapterId: number;
}

export class CreateLessonResponseDto {
  public message: string;
  public lesson: LessonDto;
}
