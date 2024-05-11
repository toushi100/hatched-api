import { CanActivate, ExecutionContext, mixin, Type } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";

const ApplyRoleGuardIfOneOfQueryParamExist = ({ role, queryParam }): Type<CanActivate> => {
    class RoleGuardMixin extends JwtAuthGuard {
        async canActivate(context: ExecutionContext) {
            const { query } = context.switchToHttp().getRequest();
            let isRequiredAuth = false;

            if (query && queryParam) {
                Object.keys(queryParam).forEach(key => {
                    if (query[ key ]) {
                        if (typeof queryParam[ key ] === "boolean" && (queryParam[ key ] === (query[ key ] === "true"))) {
                            isRequiredAuth = true;
                        } else if (query[ key ] === queryParam[ key ]) {
                            isRequiredAuth = true;
                        }
                    }
                });
            }

            
            if (typeof role === "string") {
                role = [role];
            }

            if (role.length > 0 && isRequiredAuth) {
                await super.canActivate(context);
                const { user } = context.switchToHttp().getRequest();
                let valid = false;
                role.forEach(item => {
                    if (user?.roles.includes(item)) {
                        valid = true;
                    }
                });
                return valid;
            }

            return true;
        }
    }

    return mixin(RoleGuardMixin);
};

const ApplyRoleGuardIfOneOfRequestBodyValueExist = ({ role, bodyValues }): Type<CanActivate> => {
    class RoleGuardMixin extends JwtAuthGuard {
        async canActivate(context: ExecutionContext) {
            const { body } = context.switchToHttp().getRequest();
            let isRequiredAuth = false;

            if (body && bodyValues) {
                Object.keys(bodyValues).forEach(key => {
                    if (body[ key ]) {
                        if (typeof bodyValues[ key ] === "boolean" && (bodyValues[ key ] === (body[ key ] === "true"))) {
                            isRequiredAuth = true;
                        } else if (body[ key ] === bodyValues[ key ]) {
                            isRequiredAuth = true;
                        }
                    }
                });
            }

            if (isRequiredAuth) {
                await super.canActivate(context);
                const { user } = context.switchToHttp().getRequest();
                return user?.roles.includes(role);
            }

            return true;
        }
    }

    return mixin(RoleGuardMixin);
};
export {
    ApplyRoleGuardIfOneOfQueryParamExist,
    ApplyRoleGuardIfOneOfRequestBodyValueExist
};
