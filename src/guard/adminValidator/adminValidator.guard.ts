import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../jwt/jwt.auth.guard";
import { ROLE } from "../../types/proto.type";

@Injectable()
export class AdminValidateGuard implements CanActivate {
  constructor(private jwtAuthGuard: JwtAuthGuard) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const bearerToken: string = await req.headers["authorization"];

    if (!String(bearerToken).startsWith("Bearer "))
      throw new UnauthorizedException("토큰 형식 오류");
    await this.jwtAuthGuard.canActivate(context);

    if (req.body.user.role != ROLE.Admin) {
      throw new ForbiddenException();
    }

    return true;
  }
}
