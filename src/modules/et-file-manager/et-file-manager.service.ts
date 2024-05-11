import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { AwsS3Service } from 'nestjs-aws';

import { CreateUploadUrRequestDto } from './dto/create-upload-url-request.dto';
import { CreateUploadUrlResponseDto } from './dto/create-upload-url-response.dto';
import { ConfigService } from "../../configs";
import { HelperService } from "../../shared/services/helper";
import { UserPayloadDto } from '../core/user/dto/user-payload.dto';
import { CompanyService } from '../company/services/company.service';
import { languagesCodes } from 'src/constants/languages';

@Injectable()
export class EtFileManagerService {
    constructor(
        private readonly awsS3Service: AwsS3Service,
        private readonly configService: ConfigService,
        private readonly helperService: HelperService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
    ) { }
    async createUploadUrl(
        createUploadUrlReq: CreateUploadUrRequestDto,
        userPayload: UserPayloadDto,
        language: string,
    ): Promise<CreateUploadUrlResponseDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        const domain = createUploadUrlReq.domain;
        const key = `${domain}/${userCompany.id}/${this.helperService.getCustomLengthRandomNumber(9)}`;
        console.info(domain);

        const params: any = {
            Bucket: this.configService.awsConfig.AWS_S3_BUCKET_NAME,
            Key: key,
            Expires: 3600, // 1 hour
            ContentType: 'image/jpeg',
        }

        const uploadUrl = await this.awsS3Service.getUploadSignedUrl(params);

        return {
            uploadUrl,
            fileUrl: `https://${this.configService.awsConfig.AWS_S3_BUCKET_NAME}.s3.${this.configService.awsConfig.AWS_REGION}.amazonaws.com/${key}`,
        };
    }
}
