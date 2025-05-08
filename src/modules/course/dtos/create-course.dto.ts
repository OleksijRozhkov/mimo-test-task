import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCourseRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;
}

export class CreateCourseResponseDto {
  public id: number;
  public name: string;
}
