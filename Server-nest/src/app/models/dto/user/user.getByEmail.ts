import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';
export class GetUserWithEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
