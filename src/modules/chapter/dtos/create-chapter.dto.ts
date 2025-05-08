import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateChapterRequestDto {
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
  public courseId: number;
}

export class CreateChapterResponseDto {
  public id: number;
  public name: string;
  public order: number;
  public courseId: number;
}
