import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "./prisma.service";

@Module({
  providers: [PrismaService, ConfigService],
})
export class PrismaModule {}
