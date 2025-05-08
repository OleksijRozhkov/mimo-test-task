import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ChapterIdRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public chapterId: number;
}

export class GetChapterResponseDto {
  public id: number;
  public name: string;
  public order: number;
  public courseId: number;
}

export class GetAllChaptersResponseDto {
  public chapters: GetChapterResponseDto[];
}
