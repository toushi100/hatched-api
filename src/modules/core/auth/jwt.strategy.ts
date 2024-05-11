import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { IJwtPayload } from "./jwt-payload.interface";
import { ConfigService } from "../../../configs";
import { UserService } from "../user/user.service";
import { UserPayloadDto } from "../user/dto/user-payload.dto";
import { languagesCodes } from "../../../constants/languages";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(public readonly configService: ConfigService, public readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET_KEY
    });
  }

  async validate(jwtPayload: IJwtPayload): Promise<UserPayloadDto> {
    const user = await this.userService.getUserPayLoadById(jwtPayload.id, languagesCodes.Default);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
