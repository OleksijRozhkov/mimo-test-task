import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCourseRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;
}

export class UpdateCourseResponseDto {
  public id: number;
  public name: string;
}
