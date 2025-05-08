import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserRequestDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  public name: string;
}

export class CreateUserResponseDto {
  public id: number;
  public name: string;
}
