import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (req?.body && !req.body.username && req.body.email) {
      req.body.username = req.body.email;
    }
    return super.canActivate(context);
  }
}