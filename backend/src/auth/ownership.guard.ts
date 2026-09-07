import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_PARAM_KEY } from './decorators/ownership.decorator';
import { UserRole } from './roles.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const paramName = this.reflector.getAllAndOverride<string>(OWNERSHIP_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!paramName) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing.');
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const targetId = Number(request.params[paramName]);

    if (isNaN(targetId) || user.userId !== targetId) {
      throw new ForbiddenException("You do not own this resource.");
    }

    return true;
  }
}