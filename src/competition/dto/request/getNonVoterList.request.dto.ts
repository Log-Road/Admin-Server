import { IsOptional, IsString, IsUUID } from "class-validator";

export class GetNonVoterListRequestDto {
  @IsString()
  @IsUUID()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  category: string;
}
