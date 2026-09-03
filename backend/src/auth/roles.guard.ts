import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from './roles.enum';
import { ROLES_KEY } from './decorators/role.decorator';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
        console.log('this page has no role requirements')
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log('checking roles')
    console.log(user.role)
    console.log(requiredRoles)
    if (!requiredRoles.some((role) => user.role.includes(role)))
        throw new ForbiddenException('Missing permissions.');
    console.log()
    return true;
  }
}
