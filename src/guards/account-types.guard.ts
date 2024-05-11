import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AccountType } from "../modules/core/user/account-type.enum";
import { ACCOUNT_TYPES_KEY } from "../decorators/account-types.decorator";

@Injectable()
export class AccountTypeGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredTypes = this.reflector.getAllAndOverride<AccountType[]>(ACCOUNT_TYPES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredTypes) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();

        return requiredTypes.some((type) => user.accountType === type);
    }
}
