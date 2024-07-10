import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';
import { BoardMember } from '../../schemas/board.schema';

export class CreateBoardDto {
  @IsNotEmpty()
  title: string;
  @IsOptional()
  backgroundImageLink: string;
  @IsOptional()
  members: BoardMember[];
}
