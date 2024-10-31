import { Test, TestingModule } from "@nestjs/testing";
import { CompetitionService } from "../competition.service";
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { PostCompetitionRequestDto } from "../dto/request/postCompetition.request.dto";
import { PostAwardsRequestDto } from "../dto/request/postAwards.request.dto";
import { COMPETITION_STATUS } from "../../prisma/client";
import { PatchCompetitionRequestDto } from "../dto/request/patchCompetition.request.dto";

describe("CompetitionService", () => {
  let service: CompetitionService;

  let competitionDatabase: {
    [key: string]: {
      id: string;
      name: string;
      startDate: Date;
      endDate: Date;
      purpose: string;
      audience: string;
      place: string;
      status: COMPETITION_STATUS;
    };
  } = {};
  let awardDatabase: {
    [key: string]: {
      id: string;
      contestId: string;
      count: number;
      name: string;
    };
  } = {};
  let winnerDatabase: {
    [key: string]: {
      id: string;
      contestId: string;
      awardId: string;
      userId: string;
    };
  } = {};
  let voteDatabase: {
    [key: string]: {
      contestId: string;
      projectId: string;
      userId: string;
    };
  };
  let foreignUserDatabase: {
    [key: string]: {
      userId: string;
      userStringId: string;
      userRole: string;
      userName: string;
      userStudentNumber: number;
    };
  };

  const prismaMock = {
    saveCompetition: jest.fn(
      async (competition: {
        name: string;
        startDate: Date;
        endDate: Date;
        purpose: string;
        audience: string;
        place: string;
        status: COMPETITION_STATUS;
      }) => {
        const id = String(Object.keys(competitionDatabase).length);
        competitionDatabase[id] = Object.assign({ id }, competition);
        return competitionDatabase[id];
      },
    ),
    saveAwards: jest.fn(
      async (awards: { contestId: string; count: number; name: string }) => {
        const id = String(Object.keys(awardDatabase).length);
        awardDatabase[id] = Object.assign({ id }, awards);
        return awardDatabase[id];
      },
    ),
    saveWinner: jest.fn(
      async (
        contestId: string,
        winner: { awardId: string; userId: string },
      ) => {
        const { awardId, userId } = winner;
        const id = String(Object.keys(winnerDatabase).length);
        winnerDatabase[id] = { id, userId, awardId, contestId };
      },
    ),
    findCompetitionById: jest.fn(async (id: string) => {
      return competitionDatabase[id];
    }),
    findManyCompetitionPendingAward: jest.fn(async () => {
      return Object.values(competitionDatabase).filter(
        (e) => e.status == "PENDING_AWARD",
      );
    }),
    findCompetitionList: jest.fn(async (page: number) => {
      return Object.values(competitionDatabase).slice(page, page + 15);
    }),
    findNonVoterList: jest.fn(async (id: string, category?: string) => {
      const voter = Object.values(voteDatabase)
        .filter((e) => e.contestId == id)
        .map((e) => e.userId);

      const nonVoter = Object.values(foreignUserDatabase)
        .filter(
          (e) =>
            !voter.includes(e.userId) &&
            (e.userRole == "Student" || e.userRole == "Teacher"),
        )
        .map((e) => ({
          id: e.userId,
          name: e.userName,
          number: e.userStudentNumber,
          category: e.userRole,
        }))
        .sort((a, b) => (a.category < b.category ? -1 : 1))
        .sort((a, b) => (a.number < b.number ? -1 : 1))
        .sort((a, b) => (a.id < b.id ? -1 : 1));

      return nonVoter;
    }),
    patchCompetition: jest.fn(
      async (
        id: string,
        obj: {
          name?: string;
          status?: COMPETITION_STATUS;
          startDate?: string;
          endDate?: string;
          purpose?: string;
          audience?: string;
          place?: string;
        },
      ) => {
        const comp = competitionDatabase[id];
        competitionDatabase[id] = {
          id,
          name: obj.name ?? comp.name,
          status: obj.status ?? comp.status,
          startDate: new Date(obj.startDate ?? comp.startDate),
          endDate: new Date(obj.endDate ?? comp.endDate),
          purpose: obj.purpose ?? comp.purpose,
          audience: obj.audience ?? comp.audience,
          place: obj.place ?? comp.place,
        };
      },
    ),
    deleteCompetition: jest.fn(async (id: string) => {
      if (competitionDatabase[id] == undefined) return undefined;
      else {
        delete competitionDatabase[id];
        return id;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitionService,
        { provide: PrismaService, useValue: prismaMock },
        JwtService,
        Logger,
      ],
    }).compile();

    service = module.get<CompetitionService>(CompetitionService);

    competitionDatabase = {
      "0": {
        id: "0",
        name: "대덕소프트웨어마이스터고등학교 전국 중학생 알고리즘 대회",
        status: "ONGOING",
        startDate: new Date("2024-08-27T00:00:00.000Z"),
        endDate: new Date("2024-08-30T23:59:59.000Z"),
        purpose:
          "학생들의 알고리즘 풀이 능력 향상 및 중학생 대상으로 본교 홍보",
        audience: "전국 중학생 중 본 대회의 예선 통과자",
        place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
      },
    };
    awardDatabase = {};
    winnerDatabase = {};
    voteDatabase = {};
    foreignUserDatabase = {};

    jest.clearAllMocks();
  });

  describe("PostCompetition", () => {
    const request: PostCompetitionRequestDto = {
      name: "test",
      startDate: "2024-08-19T00:00:00Z",
      endDate: "2024-08-21T23:59:59Z",
      purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
      audience: "대덕소프트웨어마이스터고등학교 2학년",
      place: "청죽관",
      awards: [
        {
          count: 1,
          name: "금상",
        },
        {
          count: 2,
          name: "은상",
        },
        {
          count: 4,
          name: "동상",
        },
      ],
    };

    it("[201]", async () => {
      const { awards, ...competition } = request;
      const res = await service.postCompetition(request);

      expect(prismaMock.saveCompetition).toHaveBeenCalledTimes(1);
      expect(prismaMock.saveAwards).toHaveBeenCalledTimes(3);
      expect(prismaMock.saveCompetition).toHaveBeenCalledWith(competition);
      expect(prismaMock.saveAwards).toHaveBeenNthCalledWith(
        1,
        Object.assign(awards[0], { contestId: 0 }),
      );
      expect(prismaMock.saveAwards).toHaveBeenNthCalledWith(
        2,
        Object.assign(awards[1], { contestId: 0 }),
      );
      expect(prismaMock.saveAwards).toHaveBeenNthCalledWith(
        3,
        Object.assign(awards[2], { contestId: 0 }),
      );
      expect(res).toEqual({ id: "1" });
    });
  });

  describe("PostAwards", () => {
    const request: PostAwardsRequestDto = {
      list: [
        {
          awardId: "1",
          userId: ["1"],
        },
        {
          awardId: "2",
          userId: ["2", "3"],
        },
        {
          awardId: "3",
          userId: ["4", "5", "6"],
        },
      ],
    };

    it("[201]", async () => {
      competitionDatabase["1"] = {
        id: "1",
        name: "test",
        startDate: new Date("2024-08-19T00:00:00Z"),
        endDate: new Date("2024-08-21T23:59:59Z"),
        purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
        audience: "대덕소프트웨어마이스터고등학교 2학년",
        place: "청죽관",
        status: "ONGOING",
      };

      awardDatabase["1"] = {
        id: "1",
        contestId: "1",
        count: 1,
        name: "금상",
      };

      awardDatabase["2"] = {
        id: "2",
        contestId: "1",
        count: 2,
        name: "은상",
      };

      awardDatabase["3"] = {
        id: "3",
        contestId: "1",
        count: 3,
        name: "동상",
      };

      const res = await service.postAwards("1", request);

      expect(prismaMock.saveWinner).toHaveBeenCalledTimes(6);
      expect(prismaMock.saveWinner).toHaveBeenNthCalledWith(1, "1", {
        awardId: "1",
        userId: "1",
      });
      expect(prismaMock.saveWinner).toHaveBeenNthCalledWith(2, "1", {
        awardId: "2",
        userId: "2",
      });
      expect(prismaMock.saveWinner).toHaveBeenNthCalledWith(3, "1", {
        awardId: "2",
        userId: "3",
      });
      expect(prismaMock.saveWinner).toHaveBeenNthCalledWith(4, "1", {
        awardId: "3",
        userId: "4",
      });
      expect(prismaMock.saveWinner).toHaveBeenNthCalledWith(5, "1", {
        awardId: "3",
        userId: "5",
      });
      expect(prismaMock.saveWinner).toHaveBeenNthCalledWith(6, "1", {
        awardId: "3",
        userId: "6",
      });
      expect(res).toEqual({});
    });

    it("[404]", async () => {
      prismaMock.findCompetitionById.mockImplementationOnce(() => undefined);
      expect(
        async () => await service.postAwards("1", request),
      ).rejects.toThrow(new NotFoundException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith("1");
    });
  });

  describe("GetCompetitionList", () => {
    const page: string = "0";

    it("[200]", async () => {
      competitionDatabase = {
        "0": {
          id: "0",
          name: "test",
          startDate: new Date("2024-08-19T00:00:00Z"),
          endDate: new Date("2024-08-21T23:59:59Z"),
          purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
          audience: "대덕소프트웨어마이스터고등학교 2학년",
          place: "청죽관",
          status: "ONGOING",
        },
        "1": {
          id: "1",
          name: "test",
          startDate: new Date("2024-08-19T00:00:00Z"),
          endDate: new Date("2024-08-21T23:59:59Z"),
          purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
          audience: "대덕소프트웨어마이스터고등학교 2학년",
          place: "청죽관",
          status: "IN_PROGRESS",
        },
      };

      const res = await service.getCompetitionList(page);

      expect(prismaMock.findCompetitionList).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionList).toHaveBeenCalledWith(Number(page));
      expect(res).toEqual({
        list: [
          {
            id: "0",
            name: "test",
            startDate: "2024-08-19T00:00:00.000Z",
            endDate: "2024-08-21T23:59:59.000Z",
            status: "ONGOING",
          },
          {
            id: "1",
            name: "test",
            startDate: "2024-08-19T00:00:00.000Z",
            endDate: "2024-08-21T23:59:59.000Z",
            status: "IN_PROGRESS",
          },
        ],
      });
    });

    it("[404]", async () => {
      competitionDatabase = {};
      await expect(async () => {
        await service.getCompetitionList(page);
      }).rejects.toThrow(new NotFoundException());

      expect(prismaMock.findCompetitionList).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionList).toHaveBeenCalledWith(Number(page));
    });

    it("[500]", async () => {
      prismaMock.findCompetitionList.mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(async () => {
        await service.getCompetitionList(page);
      }).rejects.toThrow(new InternalServerErrorException());

      expect(prismaMock.findCompetitionList).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionList).toHaveBeenCalledWith(Number(page));
    });
  });

  describe("GetCompetition", () => {
    const request = "0";

    it("[200]", async () => {
      const res = await service.getCompetition(request);

      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(request);
      expect(res).toEqual({
        id: "0",
        name: "대덕소프트웨어마이스터고등학교 전국 중학생 알고리즘 대회",
        status: "ONGOING",
        startDate: new Date("2024-08-27T00:00:00.000Z").toISOString(),
        endDate: new Date("2024-08-30T23:59:59.000Z").toISOString(),
        purpose:
          "학생들의 알고리즘 풀이 능력 향상 및 중학생 대상으로 본교 홍보",
        audience: "전국 중학생 중 본 대회의 예선 통과자",
        place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
      });
    });

    it("[404]", async () => {
      prismaMock.findCompetitionById.mockImplementationOnce(() => undefined);

      await expect(async () => {
        await service.getCompetition(request);
      }).rejects.toThrow(new NotFoundException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(request);
    });

    it("[500]", async () => {
      prismaMock.findCompetitionById.mockImplementationOnce(() => {
        throw new InternalServerErrorException();
      });
      await expect(async () => {
        await service.getCompetition(request);
      }).rejects.toThrow(new InternalServerErrorException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(request);
    });
  });

  describe("GetRecentCompetition", () => {
    it("[200]", async () => {
      competitionDatabase = {
        "0": {
          id: "0",
          name: "Test0_ONGOING_DSM",
          status: "ONGOING",
          startDate: new Date("2024-08-27T00:00:00.000Z"),
          endDate: new Date("2024-08-30T23:59:59.000Z"),
          purpose:
            "학생들의 알고리즘 풀이 능력 향상 및 중학생 대상으로 본교 홍보",
          audience: "전국 중학생 중 본 대회의 예선 통과자",
          place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
        },
        "1": {
          id: "1",
          name: "Test1_PENDING_DSM",
          status: "PENDING_AWARD",
          startDate: new Date("2024-08-27T00:00:00.000Z"),
          endDate: new Date("2024-08-30T23:59:59.000Z"),
          purpose:
            "학생들의 알고리즘 풀이 능력 향상 및 중학생 대상으로 본교 홍보",
          audience: "전국 중학생 중 본 대회의 예선 통과자",
          place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
        },
        "2": {
          id: "2",
          name: "Test2_AWARD_DSM",
          status: "PENDING_AWARD",
          startDate: new Date("2024-08-27T00:00:00.000Z"),
          endDate: new Date("2024-08-30T23:59:59.000Z"),
          purpose:
            "학생들의 알고리즘 풀이 능력 향상 및 중학생 대상으로 본교 홍보",
          audience: "전국 중학생 중 본 대회의 예선 통과자",
          place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
        },
        "3": {
          id: "3",
          name: "Test3_CLOSED_BETA_DSM",
          status: "CLOSED",
          startDate: new Date("2024-08-27T00:00:00.000Z"),
          endDate: new Date("2024-08-30T23:59:59.000Z"),
          purpose:
            "학생들의 알고리즘 풀이 능력 향상 및 중학생 대상으로 본교 홍보",
          audience: "전국 중학생 중 본 대회의 예선 통과자",
          place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
        },
      };

      const res = await service.getRecentCompetitions();

      expect(prismaMock.findManyCompetitionPendingAward).toHaveBeenCalledTimes(1);
      expect(prismaMock.findManyCompetitionPendingAward).toHaveBeenCalledWith();
      expect(res).toEqual({
        list: [
          {
            id: "1",
            name: "Test1_PENDING_DSM",
            status: "PENDING_AWARD",
            startDate: new Date("2024-08-27T00:00:00.000Z").toISOString(),
            endDate: new Date("2024-08-30T23:59:59.000Z").toISOString(),
          },
          {
            id: "2",
            name: "Test2_AWARD_DSM",
            status: "PENDING_AWARD",
            startDate: new Date("2024-08-27T00:00:00.000Z").toISOString(),
            endDate: new Date("2024-08-30T23:59:59.000Z").toISOString(),
          },
        ],
      });
    });
  });

  describe("GetNonVoterList", () => {
    const request = {
      id: "1",
      category: "Student",
    };

    it("[200]", async () => {
      foreignUserDatabase = {
        "afd29e54-9207-47a6-8816-9e6e971feb97": {
          userId: "afd29e54-9207-47a6-8816-9e6e971feb97",
          userName: "Admin",
          userRole: "Admin",
          userStringId: "admin1234",
          userStudentNumber: null,
        },
        "95d1e209-0337-40f4-a852-3c16f3a9a2df": {
          userId: "95d1e209-0337-40f4-a852-3c16f3a9a2df",
          userName: "청도서",
          userRole: "Teacher",
          userStringId: "r0adwest",
          userStudentNumber: null,
        },
        "95d1e209-0337-40f4-a842-3c16f3a9a2df": {
          userId: "95d1e209-0337-40f4-a842-3c16f3a9a2df",
          userName: "청희도",
          userRole: "Teacher",
          userStringId: "ziio",
          userStudentNumber: null,
        },
        "5fe187b2-cf86-4bda-b1f8-d638f2c53324": {
          userId: "5fe187b2-cf86-4bda-b1f8-d638f2c53324",
          userName: "홍길동",
          userRole: "Student",
          userStringId: "hongi1d0ng",
          userStudentNumber: 2345,
        },
        "5fe187b2-ctfx-4bda-b1f8-d638f2c53324": {
          userId: "5fe187b2-ctfx-4bda-b1f8-d638f2c53324",
          userName: "홍이삭",
          userRole: "Student",
          userStringId: "binding0f1ssac",
          userStudentNumber: 2468,
        },
      };

      voteDatabase = {
        "1": {
          userId: "95d1e209-0337-40f4-a842-3c16f3a9a2df",
          contestId: "1",
          projectId: "1",
        },
        "2": {
          userId: "5fe187b2-ctfx-4bda-b1f8-d638f2c53324",
          contestId: "1",
          projectId: "4",
        },
      };

      const res = await service.getNonVoterList(request);

      expect(prismaMock.findNonVoterList).toHaveBeenCalledTimes(1);
      expect(prismaMock.findNonVoterList).toHaveBeenCalledWith(
        request.id,
        request.category,
      );
      expect(res).toEqual({
        list: [
          {
            id: "5fe187b2-cf86-4bda-b1f8-d638f2c53324",
            name: "홍길동",
            number: 2345,
            category: "Student",
          },
          {
            id: "95d1e209-0337-40f4-a852-3c16f3a9a2df",
            name: "청도서",
            number: null,
            category: "Teacher",
          },
        ],
      });
    });
  });

  describe("PatchCompetition", () => {
    const id = "0";
    const request: PatchCompetitionRequestDto = {};

    it("[200] update all", async () => {
      const request: PatchCompetitionRequestDto = {
        name: "전국 중학생 알고리즘 대회",
        status: "IN_PROGRESS",
        startDate: "2024-08-27T10:00:00.000Z",
        endDate: "2024-08-29T23:59:59.000Z",
        purpose: "본교 홍보 및 중학생의 알고리즘 풀이 능력 향상 등",
        audience: "대전 관내 중학생",
        place:
          "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실 및 정보보안 1 ~ 3실",
      };

      const res = await service.patchCompetition(id, request);
      expect(res).toEqual({ id: "0" });
      expect(competitionDatabase).toEqual({
        "0": {
          id: "0",
          name: "전국 중학생 알고리즘 대회",
          status: "IN_PROGRESS",
          startDate: new Date("2024-08-27T10:00:00Z"),
          endDate: new Date("2024-08-29T23:59:59Z"),
          purpose: "본교 홍보 및 중학생의 알고리즘 풀이 능력 향상 등",
          audience: "대전 관내 중학생",
          place:
            "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실 및 정보보안 1 ~ 3실",
        },
      });
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.patchCompetition).toHaveBeenCalledTimes(1);
      expect(prismaMock.patchCompetition).toHaveBeenCalledWith(id, request);
    });

    it("[200] update partial", async () => {
      const request: PatchCompetitionRequestDto = {
        status: "CLOSED",
        startDate: "2024-08-27T10:00:00Z",
        purpose: "본교 홍보 및 중학생의 알고리즘 풀이 능력 향상 등",
      };

      const res = await service.patchCompetition(id, request);
      expect(res).toEqual({ id: "0" });
      expect(competitionDatabase).toEqual({
        "0": {
          id: "0",
          name: "대덕소프트웨어마이스터고등학교 전국 중학생 알고리즘 대회",
          status: "CLOSED",
          startDate: new Date("2024-08-27T10:00:00.000Z"),
          endDate: new Date("2024-08-30T23:59:59.000Z"),
          purpose: "본교 홍보 및 중학생의 알고리즘 풀이 능력 향상 등",
          audience: "전국 중학생 중 본 대회의 예선 통과자",
          place: "대덕소프트웨어마이스터고등학교 소프트웨어개발 1 ~ 3실",
        },
      });
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.patchCompetition).toHaveBeenCalledTimes(1);
      expect(prismaMock.patchCompetition).toHaveBeenCalledWith(id, request);
    });

    it("[404]", async () => {
      prismaMock.findCompetitionById.mockImplementationOnce(() => {
        return null;
      });

      await expect(
        async () => await service.patchCompetition(id, request),
      ).rejects.toThrow(new NotFoundException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.patchCompetition).toHaveBeenCalledTimes(0);
    });

    it("[500]", async () => {
      const request: PatchCompetitionRequestDto = {
        status: "IN_PROGRESS",
        startDate: "2024-08-27T10:00:00.000Z",
        purpose: "본교 홍보 및 중학생의 알고리즘 풀이 능력 향상 등",
      };

      prismaMock.patchCompetition.mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(
        async () => await service.patchCompetition(id, request),
      ).rejects.toThrow(new InternalServerErrorException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.patchCompetition).toHaveBeenCalledTimes(1);
      expect(prismaMock.patchCompetition).toHaveBeenCalledWith(id, request);
    });
  });

  describe("DeleteCompetition", () => {
    const id = "1";

    it("[204]", async () => {
      competitionDatabase["1"] = {
        id: "1",
        name: "test",
        startDate: new Date("2024-08-19T00:00:00Z"),
        endDate: new Date("2024-08-21T23:59:59Z"),
        purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
        audience: "대덕소프트웨어마이스터고등학교 2학년",
        place: "청죽관",
        status: "ONGOING",
      };

      const res = await service.deleteCompetition(id);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.deleteCompetition).toHaveBeenCalledTimes(1);
      expect(prismaMock.deleteCompetition).toHaveBeenCalledWith(id);
      expect(res).toEqual({});
    });

    it("[400]", async () => {
      competitionDatabase["1"] = {
        id: "1",
        name: "test",
        startDate: new Date("2024-08-19T00:00:00Z"),
        endDate: new Date("2024-08-21T23:59:59Z"),
        purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
        audience: "대덕소프트웨어마이스터고등학교 2학년",
        place: "청죽관",
        status: "IN_PROGRESS",
      };

      await expect(
        async () => await service.deleteCompetition(id),
      ).rejects.toThrow(new BadRequestException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.deleteCompetition).toHaveBeenCalledTimes(0);
    });

    it("[404]", async () => {
      competitionDatabase["2"] = {
        id: "2",
        name: "test",
        startDate: new Date("2024-08-19T00:00:00Z"),
        endDate: new Date("2024-08-21T23:59:59Z"),
        purpose: "학생들의 협업 능력 향상 및 코드 검수 정도 확인",
        audience: "대덕소프트웨어마이스터고등학교 2학년",
        place: "청죽관",
        status: "IN_PROGRESS",
      };

      await expect(
        async () => await service.deleteCompetition(id),
      ).rejects.toThrow(new NotFoundException());
      expect(prismaMock.findCompetitionById).toHaveBeenCalledTimes(1);
      expect(prismaMock.findCompetitionById).toHaveBeenCalledWith(id);
      expect(prismaMock.deleteCompetition).toHaveBeenCalledTimes(0);
    });
  });
});
