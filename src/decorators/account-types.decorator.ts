import { SetMetadata } from "@nestjs/common";
import { AccountType } from "../modules/core/user/account-type.enum";

export const ACCOUNT_TYPES_KEY = "account-types";
export const AccountTypes = (...accountTypes: AccountType[]) => SetMetadata(ACCOUNT_TYPES_KEY, accountTypes);
