import { Logger, Module } from "@nestjs/common";
import { CompetitionController } from "./competition.controller";
import { CompetitionService } from "./competition.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [CompetitionController],
  providers: [
    CompetitionService,
    PrismaService,
    JwtService,
    Logger,
  ],
})
export class CompetitionModule {}
