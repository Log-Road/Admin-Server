import { IsBoolean, IsEnum, IsString } from "class-validator";

export class PostProjectRequestDto {
  @IsString()
  id: string;

  @IsBoolean()
  confirm: boolean;
}
