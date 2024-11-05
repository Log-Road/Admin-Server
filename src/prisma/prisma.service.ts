import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { COMPETITION_STATUS, PrismaClient, ROLE } from "./client";
import { List } from "competition/dto/response/getNonVoterList.response.dto";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    readonly configService: ConfigService,
    @Inject(Logger) private logger: Logger,
  ) {
    super({
      datasources: {
        db: {
          url: configService.get("POSTGRESQL_DB"),
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async saveClub(clubName: string, isActive?: boolean) {
    try {
      return await this.club.create({
        data: {
          clubName: clubName,
          isActive: isActive,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async saveCompetition(competition: {
    name: string;
    startDate: string;
    endDate: string;
    purpose: string;
    audience: string;
    place: string;
  }) {
    const { name, startDate, endDate, purpose, audience, place } = competition;

    try {
      return await this.contests.create({
        data: {
          name,
          startDate: startDate,
          endDate: endDate,
          purpose,
          audience,
          place,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async saveAwards(awards: { contestId: string; count: number; name: string }) {
    const { contestId, count, name } = awards;
    try {
      return await this.awards.create({
        data: {
          contestId: contestId,
          count,
          name,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async saveWinner(
    contestId: string,
    winner: { awardId: string; userId: string },
  ) {
    try {
      const { awardId, userId } = winner;
      return await this.winner.create({
        data: {
          contestId: contestId,
          awardId: awardId,
          userId: userId,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findClubs() {
    try {
      return await this.club.findMany();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findClub(clubId: string) {
    try {
      const thisClub = await this.club.findUnique({
        where: {
          clubId: clubId,
        },
      });
      if (!thisClub) throw new NotFoundException();
      return thisClub;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findClubByName(clubName: string) {
    try {
      const result = await this.club.findFirst({
        where: {
          clubName: clubName,
        },
      });

      return result;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findCompetitionById(competitionId: string) {
    try {
      return await this.contests.findUnique({
        where: {
          id: competitionId,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findCompetitionList(page: number) {
    try {
      const result = await this.contests.findMany({
        // page >= 0
        skip: page * 15,
        take: 15,
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      });
      return result;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findManyCompetitionPendingAward() {
    try {
      const theseComp = await this.contests.findMany({
        where: {
          status: "PENDING_AWARD",
        },
      });

      return theseComp;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findNonVoterList(id: string, category?: string) {
    try {
      const thisCompetition = await this.contests.findUnique({
        where: { id },
      });

      if (!thisCompetition)
        throw new NotFoundException("해당 대회 존재하지 않음");

      const nonVoters = await this.$queryRaw<
        {
          userId: string;
          userName: string;
          userStudentNumber: number;
          userRole: ROLE;
        }[]
      >`
        SELECT "u"."user_id" "userId", "u"."user_name" "userName", "u"."user_student_number" "userStudentNumber", "u"."user_role"::TEXT "userRole"
        FROM (
          SELECT "v"."user_id" "userId"
          FROM "Vote" "v"
          WHERE "v"."contest_id" = ${id}
        ) "v"
        RIGHT JOIN "foreign_user" "u"
        ON "v"."userId" = "u"."user_id"
        WHERE "v"."userId" IS NULL AND "u"."user_role"::TEXT IN ('Student', 'Teacher')
        ORDER BY "userRole", "userStudentNumber", "userId";
      `;

      return nonVoters.map((e) => ({
        id: e.userId,
        name: e.userName,
        number: e.userStudentNumber,
        category: e.userRole,
      }));
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findCountVoterPer(
    id: string,
    role: "Student" | "Teacher",
    all: boolean,
  ) {
    try {
      const cnt = await this.$queryRaw`
        SELECT COUNT("u"."user_id") "count"
        FROM (
          SELECT "v"."user_id" "userId"
          FROM "Vote" "v"
          WHERE "v"."contest_id" = ${id}
        ) "v"
        RIGHT JOIN "foreign_user" "u"
        ON "v"."userId" = "u"."user_id"
        WHERE (${all}='false' AND "user_role" = ${role})
      `;

      return cnt;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async patchClubStatus(clubId: string) {
    try {
      const thisClub = await this.findClub(clubId);
      if (!thisClub) throw new NotFoundException();
      return await this.club.update({
        where: {
          clubId: clubId,
        },
        data: {
          isActive: !thisClub.isActive,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async patchCompetition(
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
  ) {
    try {
      await this.$transaction(async (prisma) => {
        const thisComp = await this.contests.findUnique({
          where: {
            id,
          },
        });

        await this.contests.update({
          where: {
            id,
          },
          data: {
            name: obj.name ?? thisComp.name,
            status: obj.status ?? thisComp.status,
            startDate: new Date(obj.startDate ?? thisComp.startDate),
            endDate: new Date(obj.endDate ?? thisComp.endDate),
            purpose: obj.purpose ?? thisComp.purpose,
            audience: obj.audience ?? thisComp.audience,
            place: obj.place ?? thisComp.place,
          },
        });
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async deleteClub(clubId: string) {
    try {
      const thisClub = await this.findClub(clubId);
      if (!thisClub) throw new NotFoundException();
      return await this.club.delete({
        where: {
          clubId: clubId,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async deleteCompetition(competitionId: string) {
    try {
      return await this.contests.delete({
        where: {
          id: competitionId,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(e);
    }
  }
}
