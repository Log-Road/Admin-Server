import { IsBoolean, IsEnum, IsString } from "class-validator";

enum ProjectStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  APPROVAL = "APPROVAL",
  REJECTED = "REJECTED",
  MODIFICATION = "MODIFICATION",
  DELETION = "DELETION",
}

export class GetProjectListGroupByRequestDto {
  @IsString()
  contest: string;

  @IsEnum(ProjectStatus)
  @IsString()
  status: ProjectStatus;
}
