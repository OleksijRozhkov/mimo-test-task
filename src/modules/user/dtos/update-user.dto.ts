import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;
}

export class UpdateUserResponseDto {
  public id: number;
  public name: string;
}
