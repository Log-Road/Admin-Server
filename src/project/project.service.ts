import { Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { IProjectService } from "./project.service.interface";
import { GetProjectListGroupByRequestDto } from "./dto/request/getProjectListGroupBy.request.dto";
import { PatchDisapproveRequestDto } from "./dto/request/patchDisapprove.request.dto";
import { PostProjectRequestDto } from "./dto/request/postProject.request.dto";
import { GetProjectListGroupByResponseDto } from "./dto/response/getProjectListGroupBy.response.dto";
import { PatchDisapproveResponseDto } from "./dto/response/patchDisapprove.response.dto";
import { PostProjectResponseDto } from "./dto/response/postProject.response.dto";

@Injectable()
export class ProjectService implements IProjectService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private prisma: PrismaService,
  ) {}

  async getProjectListGroupBy(
    req: GetProjectListGroupByRequestDto,
  ): Promise<GetProjectListGroupByResponseDto> {
    return;
  }
  async postProject(
    req: PostProjectRequestDto,
  ): Promise<PostProjectResponseDto> {
    return;
  }
  async patchDisapprove(
    req: PatchDisapproveRequestDto,
  ): Promise<PatchDisapproveResponseDto> {
    return;
  }
}
