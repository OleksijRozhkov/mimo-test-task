import {
  IsString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateChapterRequestDto {
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
  public courseId?: number;
}

export class UpdateChapterResponseDto {
  public id: number;
  public name: string;
  public order: number;
  public courseId: number;
}
