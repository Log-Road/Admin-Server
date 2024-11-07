import { IsNumber } from "class-validator";

export class GetVotePerResponseDto {
  @IsNumber()
  student: number;

  @IsNumber()
  teacher: number;
}