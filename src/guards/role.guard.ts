import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/decorators/roles.decorator';
import { Role } from '@/enums/roles.enum';
import { UserService } from '@/user/user.service';
import { Context } from 'telegraf';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    let isRoleFound: boolean = false;
    const type = context.getType() as any;
    if (type == 'telegraf') {
      const ctx = context.getArgByIndex(0) as Context;
      const userId = ctx.from?.id;
      const user = await this.userService.findOne({ telegramId: userId });
      isRoleFound = requiredRoles.some((role) => user.roles?.includes(role));
    } else {
      const request = context.switchToHttp().getRequest();
      const user = request['user'];
      isRoleFound = requiredRoles.some((role) => user.roles?.includes(role));
    }

    if (!isRoleFound) {
      throw new NotFoundException();
    }

    return isRoleFound;
  }
}
