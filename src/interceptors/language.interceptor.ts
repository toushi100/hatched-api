import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { AvailableLanguageCodes } from "../i18n/languageCodes";
import { LanguageService } from "../shared/services/language.service";

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
    constructor(public readonly languageService: LanguageService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        if (!request.headers["accept-language"] || !AvailableLanguageCodes[request.headers["accept-language"]]) {
            request.headers["accept-language"] = AvailableLanguageCodes.en;
        }

        this.languageService.setCurrent(
            AvailableLanguageCodes[
                AvailableLanguageCodes.ar === request.headers["accept-language"]
                    ? AvailableLanguageCodes.ar
                    : AvailableLanguageCodes.en
            ],
        );

        return next.handle();
    }
}
