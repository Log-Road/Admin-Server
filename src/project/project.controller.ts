import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ProjectService } from "./project.service";
import { IProjectController } from "./project.controller.interface";
import { Res } from "dtos/response.dto";
import { GetProjectListGroupByRequestDto } from "./dto/request/getProjectListGroupBy.request.dto";
import { PatchDisapproveRequestDto } from "./dto/request/patchDisapprove.request.dto";
import { PostProjectRequestDto } from "./dto/request/postProject.request.dto";
import { GetProjectListGroupByResponseDto } from "./dto/response/getProjectListGroupBy.response.dto";
import { PatchDisapproveResponseDto } from "./dto/response/patchDisapprove.response.dto";
import { PostProjectResponseDto } from "./dto/response/postProject.response.dto";

@Controller("project")
export class ProjectController implements IProjectController {
  constructor(
    private service: ProjectService,
    @Inject(Logger) private logger: Logger,
  ) {}

  @Get("list")
  async getProjectListGroupBy(
    @Query() req: GetProjectListGroupByRequestDto,
  ): Promise<Res<GetProjectListGroupByResponseDto>> {
    const data = await this.service.getProjectListGroupBy(req);

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Post()
  async postProject(
    @Body() req: PostProjectRequestDto,
  ): Promise<Res<PostProjectResponseDto>> {
    const data = await this.service.postProject(req);

    return {
      data,
      statusCode: 201,
      statusMsg: "",
    };
  }

  @HttpCode(204)
  @Patch("/:id")
  async patchDisapprove(
    @Param() req: PatchDisapproveRequestDto,
  ): Promise<Res<PatchDisapproveResponseDto>> {
    const data = await this.service.patchDisapprove(req);

    return {
      data,
      statusCode: 204,
      statusMsg: ""
    }
  }
}
