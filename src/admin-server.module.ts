import { Module } from "@nestjs/common";
import { ClubModule } from "./club/club.module";
import { ConfigModule } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import { CompetitionModule } from "./competition/competition.module";
import { WinstonInstance } from "utils/winston";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: "../../../.env",
    }),
    WinstonModule.forRoot({
      instance: WinstonInstance,
    }),
    ClubModule,
    CompetitionModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminServerModule {}
