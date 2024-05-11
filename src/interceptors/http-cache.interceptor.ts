import { CacheInterceptor, ExecutionContext, Injectable } from "@nestjs/common";
import { CACHE_KEY_METADATA } from "@nestjs/common/cache/cache.constants";

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
	trackBy(context: ExecutionContext): string | undefined {
		const request = context.getArgByIndex(0);
		const lang = request.headers['accept-language'] || 'en';
		const httpAdapter = this.httpAdapterHost.httpAdapter;
		const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
		const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());
		if (!isHttpApp || cacheMetadata) {
			return `${cacheMetadata}_${lang}`;
		}

		if (httpAdapter.getRequestMethod(request) !== 'GET') {
			return undefined;
		}
		return httpAdapter.getRequestUrl(request) + '_' + lang;
	}
}