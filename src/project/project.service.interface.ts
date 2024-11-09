import { GetProjectListGroupByRequestDto } from "./dto/request/getProjectListGroupBy.request.dto";
import { PatchDisapproveRequestDto } from "./dto/request/patchDisapprove.request.dto";
import { PostProjectRequestDto } from "./dto/request/postProject.request.dto";
import { GetProjectListGroupByResponseDto } from "./dto/response/getProjectListGroupBy.response.dto";
import { PatchDisapproveResponseDto } from "./dto/response/patchDisapprove.response.dto";
import { PostProjectResponseDto } from "./dto/response/postProject.response.dto";

export interface IProjectService {
  getProjectListGroupBy(
    req: GetProjectListGroupByRequestDto,
  ): Promise<GetProjectListGroupByResponseDto>;
  postProject(req: PostProjectRequestDto): Promise<PostProjectResponseDto>;
  patchDisapprove(
    req: PatchDisapproveRequestDto,
  ): Promise<PatchDisapproveResponseDto>;
}
