import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ICompetitionController } from "./competition.controller.interface";
import { Res } from "../dtos/response.dto";
import { GetNonVoterListRequestDto } from "./dto/request/getNonVoterList.request.dto";
import { PatchCompetitionRequestDto } from "./dto/request/patchCompetition.request.dto";
import { PostAwardsRequestDto } from "./dto/request/postAwards.request.dto";
import { PostCompetitionRequestDto } from "./dto/request/postCompetition.request.dto";
import { GetCompetitionResponseDto } from "./dto/response/getCompetition.response.dto";
import { GetCompetitionListResponseDto } from "./dto/response/getCompetitionList.response.dto";
import { GetNonVoterListResponseDto } from "./dto/response/getNonVoterList.response.dto";
import { GetRecentCompetitionsResponseDto } from "./dto/response/getRecentCompetitions.response.dto";
import { PatchCompetitionResponseDto } from "./dto/response/patchCompetition.response.dto";
import { PostAwardsResponseDto } from "./dto/response/postAwards.response.dto";
import { PostCompetitionResponseDto } from "./dto/response/postCompetition.response.dto";
import { CompetitionService } from "./competition.service";
import { DeleteCompetitionResponseDto } from "./dto/response/deleteCompetition.response.dto";
import { GetVotePerResponseDto } from "./dto/response/getVotePer.response.dto";

@Controller("competition")
export class CompetitionController implements ICompetitionController {
  constructor(
    private service: CompetitionService,
    @Inject(Logger) private logger: Logger,
  ) {}

  @Post()
  async postCompetition(
    @Body() request: PostCompetitionRequestDto,
  ): Promise<Res<PostCompetitionResponseDto>> {
    const data = await this.service.postCompetition(request);

    return {
      data,
      statusCode: 201,
      statusMsg: "",
    };
  }

  @Post("/awarding/:id")
  async postAwards(
    @Param("id") id: string,
    @Body() request: PostAwardsRequestDto,
  ): Promise<Res<PostAwardsResponseDto>> {
    const data = await this.service.postAwards(id, request);

    return {
      data,
      statusCode: 201,
      statusMsg: "",
    };
  }

  @Get("recent")
  async getRecentCompetitions(): Promise<
    Res<GetRecentCompetitionsResponseDto>
  > {
    const data = await this.service.getRecentCompetitions();

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Get("inform/:id")
  async getCompetition(
    @Param("id") id: string,
  ): Promise<Res<GetCompetitionResponseDto>> {
    if (!id) throw new BadRequestException("Must included parameter as id");

    const data = await this.service.getCompetition(id);

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Get("list")
  async getNonVoterList(
    @Query() request: GetNonVoterListRequestDto,
  ): Promise<Res<GetNonVoterListResponseDto>> {
    const data = await this.service.getNonVoterList(request);

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Get("per/:id")
  async getVotePer(id: string): Promise<Res<GetVotePerResponseDto>> {
    const data = await this.service.getVotePer(id);

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Get(":page")
  async getCompetitionList(
    @Param("page") page: string,
  ): Promise<Res<GetCompetitionListResponseDto>> {
    if (!page) page = "0";
    if (isNaN(Number(page)) || Number(page) < 0) {
      throw new BadRequestException("Parameter have to valid");
    }

    const data = await this.service.getCompetitionList(page);

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Patch(":id")
  async patchCompetition(
    @Param("id") id: string,
    @Body() request: PatchCompetitionRequestDto,
  ): Promise<Res<PatchCompetitionResponseDto>> {
    const data = await this.service.patchCompetition(id, request);

    return {
      data,
      statusCode: 200,
      statusMsg: "",
    };
  }

  @Delete(":id")
  async deleteCompetition(
    @Param() id: string,
  ): Promise<Res<DeleteCompetitionResponseDto>> {
    const data = await this.service.deleteCompetition(id);

    return {
      data,
      statusCode: 204,
      statusMsg: "",
    };
  }
}
