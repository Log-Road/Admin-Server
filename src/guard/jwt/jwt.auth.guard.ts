import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import axios from "axios";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  @Inject() private logger: Logger;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = await context.switchToHttp().getRequest();

    const token: string = req.headers["authorization"];

    if (!token) throw new UnauthorizedException("토큰 필요");
    if (!token.includes(" ")) throw new UnauthorizedException("토큰 형식 오류");

    await axios
      .post(`http://${process.env.LOCALHOST}:${process.env.DIAS_PORT}/auth/user`, {
        headers: req.headers,
      })
      .then((res) => {
        req.body.user = res;
      })
      .catch((e) => {
        this.logger.error(e);
        throw new InternalServerErrorException(e);
      });

    return true;
  }
}
