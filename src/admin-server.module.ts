import { Logger, Module } from "@nestjs/common";
import { ClubModule } from "./club/club.module";
import { ConfigModule } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import { CompetitionModule } from "./competition/competition.module";
import { WinstonInstance } from "utils/winston";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GuardModule } from "./guard/guard.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: "../.env",
    }),
    WinstonModule.forRoot({
      instance: WinstonInstance,
    }),
    // ClientsModule.register([
    //   {
    //     name: 'DIAS',
    //     transport: Transport.GRPC,
    //     options: {
    //       package: 'dias',
    //       protoPath: "./proto/dias.proto",
    //     },
    //   },
    // ]),
    ClubModule,
    CompetitionModule,
    Logger,
    GuardModule,
  ],
  controllers: [],
  providers: [],
})
export class AdminServerModule {}
