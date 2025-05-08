import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CourseIdRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public courseId: number;
}

export class GetCourseResponseDto {
  public id: number;
  public name: string;
}

export class GetAllCoursesResponseDto {
  public courses: GetCourseResponseDto[];
}
