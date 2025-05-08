import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

// Request DTO
export class RecordProgressRequestDto {
  @IsNotEmpty()
  @IsNumber()
  public lessonId: number;

  @IsNotEmpty()
  @IsDateString()
  public startedAt: string;

  @IsNotEmpty()
  @IsDateString()
  public completedAt: string;

  @IsNotEmpty()
  @IsNumber()
  public userId: number;
}

// Response DTO
export class RecordProgressResponseDto {
  public message: string;
  public progress: {
    id: number;
    lessonId: number;
    userId: number;
    startedAt: Date;
    completedAt: Date;
  };
}
