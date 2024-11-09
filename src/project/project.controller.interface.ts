import { Res } from "dtos/response.dto";
import { GetProjectListGroupByResponseDto } from "./dto/response/getProjectListGroupBy.response.dto";
import { GetProjectListGroupByRequestDto } from "./dto/request/getProjectListGroupBy.request.dto";
import { PostProjectRequestDto } from "./dto/request/postProject.request.dto";
import { PatchDisapproveRequestDto } from "./dto/request/patchDisapprove.request.dto";
import { PostProjectResponseDto } from "./dto/response/postProject.response.dto";
import { PatchDisapproveResponseDto } from "./dto/response/patchDisapprove.response.dto";

export interface IProjectController {
  getProjectListGroupBy(
    req: GetProjectListGroupByRequestDto,
  ): Promise<Res<GetProjectListGroupByResponseDto>>;
  postProject(req: PostProjectRequestDto): Promise<Res<PostProjectResponseDto>>;
  patchDisapprove(
    req: PatchDisapproveRequestDto,
  ): Promise<Res<PatchDisapproveResponseDto>>;
}
