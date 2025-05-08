import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UserIdRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public userId: number;
}

export class GetUserResponseDto {
  public id: number;
  public name: string;
}

export class GetAllUsersResponseDto {
  public users: GetUserResponseDto[];
}
