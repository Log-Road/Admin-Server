import { NestFactory } from "@nestjs/core";
import { AdminServerModule } from "./admin-server.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { HttpExceptionFilter } from "./utils/http.exception.filter";
import { configDotenv } from "dotenv";
import { WinstonModule } from "nest-winston";
import { WinstonInstance } from "utils/winston";

async function bootstrap() {
  configDotenv({
    path: "../.env",
  });

  const logger = WinstonModule.createLogger({
    instance: WinstonInstance,
  });

  const app = await NestFactory.create(AdminServerModule, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    logger,
  });

  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: true,
    }),
  );
  app.useGlobalGuards();

  await app.listen(Number(process.env.PORT ?? "8082"), () => {
    logger.log(`ADMIN-SERVER HAD STARTED`);
  });
}
bootstrap();
