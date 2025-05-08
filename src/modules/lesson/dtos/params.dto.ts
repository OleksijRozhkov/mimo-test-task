import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class LessonIdRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public lessonId: number;
}

export class LessonDto {
  public id: number;
  public name: string;
  public order: number;
  public chapterId: number;
}

export class GetLessonResponseDto {
  public lesson: LessonDto;
}

export class GetAllLessonsResponseDto {
  public lessons: LessonDto[];
}
