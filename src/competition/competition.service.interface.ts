import { GetNonVoterListRequestDto } from "./dto/request/getNonVoterList.request.dto";
import { PatchCompetitionRequestDto } from "./dto/request/patchCompetition.request.dto";
import { PostAwardsRequestDto } from "./dto/request/postAwards.request.dto";
import { PostCompetitionRequestDto } from "./dto/request/postCompetition.request.dto";
import { DeleteCompetitionResponseDto } from "./dto/response/deleteCompetition.response.dto";
import { GetCompetitionResponseDto } from "./dto/response/getCompetition.response.dto";
import { GetCompetitionListResponseDto } from "./dto/response/getCompetitionList.response.dto";
import { GetNonVoterListResponseDto } from "./dto/response/getNonVoterList.response.dto";
import { GetRecentCompetitionsResponseDto } from "./dto/response/getRecentCompetitions.response.dto";
import { GetVotePerResponseDto } from "./dto/response/getVotePer.response.dto";
import { PatchCompetitionResponseDto } from "./dto/response/patchCompetition.response.dto";
import { PostAwardsResponseDto } from "./dto/response/postAwards.response.dto";
import { PostCompetitionResponseDto } from "./dto/response/postCompetition.response.dto";

export interface ICompetitionService {
  postCompetition(
    request: PostCompetitionRequestDto,
  ): Promise<PostCompetitionResponseDto>;
  postAwards(
    id: string,
    request: PostAwardsRequestDto,
  ): Promise<PostAwardsResponseDto>;
  getCompetitionList(page: string): Promise<GetCompetitionListResponseDto>;
  getRecentCompetitions(): Promise<GetRecentCompetitionsResponseDto>;
  getCompetition(id: string): Promise<GetCompetitionResponseDto>;
  getNonVoterList(
    request: GetNonVoterListRequestDto,
  ): Promise<GetNonVoterListResponseDto>;
  getVotePer(id: string): Promise<GetVotePerResponseDto>;
  patchCompetition(
    id: string,
    request: PatchCompetitionRequestDto,
  ): Promise<PatchCompetitionResponseDto>;
  deleteCompetition(id: string): Promise<DeleteCompetitionResponseDto>;
}
