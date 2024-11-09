import {
  IsArray,
  IsString,
  IsEnum,
  Length,
  IsDateString,
  Min,
  IsNumber,
} from "class-validator";

export class GetProjectListGroupByResponseDto {
  @IsArray()
  list: ProjectList[];
}

enum ProjectStatus {
  PENDING = "PENDING",
  APPROVAL = "APPROVAL",
  REJECTED = "REJECTED",
  MODIFICATION = "MODIFICATION",
  DELETION = "DELETION",
}

enum AuthCategory {
  PERSONAL = "PERSONAL",
  TEAM = "TEAM",
  CLUB = "CLUB",
}

class ProjectList {
  @IsString()
  id: string;

  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsString()
  name: string;

  @IsString()
  image: string;

  @IsEnum(AuthCategory)
  @IsString()
  authCategory: string;

  @IsArray()
  member: string[];

  @Length(0, 256)
  @IsString()
  introduction: string;

  @IsDateString()
  createdAt: string;

  @Min(0)
  @IsNumber()
  like: number;
}
