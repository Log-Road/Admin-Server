import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class VerifyGuard implements CanActivate {
  constructor() {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    return true;
  }
}
