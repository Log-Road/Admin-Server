import { IsString } from "class-validator";

export class PatchDisapproveRequestDto {
  @IsString()
  id: string;
}
