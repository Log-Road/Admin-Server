import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { ROLE } from "prisma/client";

export class GetNonVoterListResponseDto {
  @IsArray()
  list: List[];
}

export class List {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  number?: number;

  @IsEnum(ROLE)
  category: ROLE;
}
