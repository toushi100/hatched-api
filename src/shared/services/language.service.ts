import { Injectable } from "@nestjs/common";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { ConfigService } from "../../configs";

@Injectable()
export class LanguageService {
    private current: AvailableLanguageCodes;

    constructor(public configService: ConfigService) {
        this.current = AvailableLanguageCodes[configService.ENV_CONFIG.FALLBACK_LANGUAGE];
    }

    setCurrent(newLang: AvailableLanguageCodes): void {
        this.current = newLang;
    }

    getCurrent(): AvailableLanguageCodes {
        return this.current;
    }
}
