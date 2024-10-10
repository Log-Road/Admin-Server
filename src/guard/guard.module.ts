import { Logger, Module } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt/jwt.auth.guard";
import { VerifyGuard } from "./verify/verify.guard";
import { AdminValidateGuard } from "./adminValidator/adminValidator.guard";

@Module({
  imports: [],
  providers: [
    JwtAuthGuard, 
    VerifyGuard, 
    AdminValidateGuard, 
    Logger
  ],
})
export class GuardModule {}
