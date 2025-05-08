import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AchievementIdRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public achievementId: number;
}
