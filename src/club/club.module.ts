import { Logger, Module } from "@nestjs/common";
import { ClubController } from "./club.controller";
import { ClubService } from "./club.service";
import { PrismaService } from "../prisma/prisma.service";
// import { PrismaService as UserPrismaService } from "@iixanx/dias/src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [ClubController],
  providers: [
    ClubService,
    PrismaService,
    JwtService,
    Logger,
  ],
})
export class ClubModule {}
