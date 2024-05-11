import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";

import { UserRepository } from "./repositories/user.repository";
import { UserMapper } from "./mapper/user.mapper";
import { UserDto } from "./dto/user.dto";
import { UserEntity } from "./entities/user.entity";
import { UserRole } from "./user-role.enum";
import { UserKeys } from "./translate.enum";
import * as bcrypt from "bcrypt";
import { UserPayloadMapper } from "./mapper/user-payload.mapper";
import { UserPayloadDto } from "./dto/user-payload.dto";
import { UserProfileDto } from "./dto/response/user-profile.dto";
import { UserProfileMapper } from "./mapper/user-profile.mapper";
import { UpdateUserProfileDto } from "./dto/request/update-user-profile.dto";
import { BasicOperationsResponse } from "../../../common/dto/basic-operations-response.dto";
import { languagesCodes } from "../../../constants/languages";
import { EmailService, EmailTemplates } from "../../../shared/services/email.service";
import { CompanyService } from "../../company/services/company.service";
import { UserEmailDto } from "./dto/request/user-email.dto";
import { UserEmailVerificationCodeRepository } from "./repositories/user-email-verification-code.repository";
import { ConfigService } from "../../../configs";
import { HelperService } from "../../../shared/services/helper";
import { EmailVerificationCodeDto } from "./dto/request/email-verification-code.dto";
import { Not } from "typeorm";
import { AccountType } from "./account-type.enum";
import { AcceleratorService } from "../../accelerator/accelerator.service";
import { InvitationService } from "../../company/services/invitation.service";

@Injectable()
export class UserService {
    constructor(
        public readonly userRepository: UserRepository,
        public readonly userEmailVerificationCodeRepository: UserEmailVerificationCodeRepository,
        public readonly userMapper: UserMapper,
        public readonly userPayloadMapper: UserPayloadMapper,
        public readonly userProfileMapper: UserProfileMapper,
        public readonly configService: ConfigService,
        public readonly helperService: HelperService,
        public readonly emailService: EmailService,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        public readonly companyService: CompanyService,
        public readonly acceleratorService: AcceleratorService,
        @Inject(forwardRef(() => InvitationService))
        public readonly invitationService: InvitationService,
    ) {}

    async getUserProfile(userPayloadDto: UserPayloadDto, language: string): Promise<UserProfileDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userRepository.findOne(userPayloadDto.id, {
            select: ["firstName", "lastName", "email"],
        });

        if (!user) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(UserKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.userProfileMapper.fromEntityToDTO(UserProfileDto, user);
    }

    async updateUserProfile(
        userPayloadDto: UserPayloadDto,
        updateUserProfileDto: UpdateUserProfileDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userRepository.findOne(userPayloadDto.id, {
            select: ["id", "firstName", "lastName", "email", "password"],
        });

        if (!user) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(UserKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (updateUserProfileDto.oldPassword) {
            const match = await bcrypt.compare(updateUserProfileDto.oldPassword, user.password);
            if (!match) {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(UserKeys.USER_PASSWORD_NOT_MATCH, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        // update user profile
        const hashedPassword = updateUserProfileDto.newPassword
            ? await bcrypt.hash(updateUserProfileDto.newPassword, 10)
            : user.password;
        if (updateUserProfileDto.email && user.email != updateUserProfileDto.email) {
            await this.checkMailExists(updateUserProfileDto.email, languageCode);
        }
        await this.userRepository.save({
            id: user.id,
            firstName: updateUserProfileDto.firstName ? updateUserProfileDto.firstName : user.firstName,
            email: updateUserProfileDto.email ?? user.email,
            lastName: updateUserProfileDto.lastName ? updateUserProfileDto.lastName : user.lastName,
            password: hashedPassword,
        });

        return {
            isSuccessful: true,
            message: await this.i18n.translate(UserKeys.UPDATED_USER_PROFILE_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async checkMailExists(email: string, languageCode: string): Promise<void> {
        const exist = await this.userRepository.findOne({
            where: {
                email: email,
            },
        });
        if (exist) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(UserKeys.EMAIL_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async sendEmailVerificationCode(
        userPayloadDto: UserPayloadDto,
        userEmailDto: UserEmailDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;

        // check if any user using the new email
        const exist = await this.userRepository.findOne({
            where: {
                email: userEmailDto.email,
                id: Not(userPayloadDto.id),
            },
        });

        if (exist) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(UserKeys.EMAIL_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const emailVerificationCodeEntry = await this.userEmailVerificationCodeRepository.findOne({
            user: {
                id: userPayloadDto.id,
            },
        });

        // generate verification code
        const code = this.helperService.getCustomLengthRandomNumber(5);

        // save verification code
        await this.userEmailVerificationCodeRepository.save({
            id: emailVerificationCodeEntry ? emailVerificationCodeEntry.id : undefined,
            email: userEmailDto.email,
            verificationCode: code,
            user: {
                id: userPayloadDto.id,
            },
        });

        // send email verification code
        await this.emailService.sendEmailThroughSMTP(
            userEmailDto.email,
            this.configService.ENV_CONFIG.SMTP_SERVER_SENDER_EMAIL,
            EmailTemplates.EMAIL_VERIFICATION_CODE_SUBJECT,
            EmailTemplates.EMAIL_VERIFICATION_CODE_TEMPLATE,
            {
                name: userPayloadDto.firstName,
                code,
            },
        );

        return {
            isSuccessful: true,
            message: await this.i18n.translate(UserKeys.EMAIL_VERIFICATION_CODE_SENT_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async verifyEmailVerificationCode(
        userPayloadDto: UserPayloadDto,
        emailVerificationCodeDto: EmailVerificationCodeDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const emailVerificationCodeEntry = await this.userEmailVerificationCodeRepository.findOne({
            user: {
                id: userPayloadDto.id,
            },
            verificationCode: emailVerificationCodeDto.code,
        });

        if (!emailVerificationCodeEntry) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(UserKeys.VERIFICATION_CODE_NOT_VALID, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // delete verification code
        await this.userEmailVerificationCodeRepository.delete(emailVerificationCodeEntry.id);

        const expirationCodeTime =
            emailVerificationCodeEntry.updatedAt.getTime() +
            this.configService.ENV_CONFIG.EMAIL_VERIFICATION_CODE_EXPIRATION_IN_MINUTE * 60000;

        // UTC milliseconds
        const currentTimeInUTC = this.helperService.getCurrentTimeInUTC();

        if (expirationCodeTime < currentTimeInUTC) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(UserKeys.VERIFICATION_CODE_EXPIRED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // check if any user using the new email
        const exist = await this.userRepository.findOne({
            where: {
                email: emailVerificationCodeEntry.email,
                id: Not(userPayloadDto.id),
            },
        });

        if (exist) {
            throw new HttpException(
                {
                    isSuccessful: false,
                    message: await this.i18n.translate(UserKeys.EMAIL_EXISTS, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // update user's email
        await this.userRepository.save({
            id: userPayloadDto.id,
            email: emailVerificationCodeEntry.email,
            isEmailVerified: true,
        });

        return {
            isSuccessful: true,
            message: await this.i18n.translate(UserKeys.UPDATED_USER_EMAIL_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async createUser(userDto: UserDto, language: string, isEmailVerified = false): Promise<UserEntity> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = this.userMapper.fromDTOToEntity(UserEntity, userDto);
        user.isEmailVerified = isEmailVerified;
        user.password = userDto.password;

        if (userDto.accountType === AccountType.STARTUP && userDto.companyName) {
            const isInvited = await this.invitationService.getPendingInvitationsByEmail(userDto.email);
            if (isInvited.length) {
                throw new HttpException(
                    { message: await this.i18n.translate(UserKeys.EMAIL_INVITED_AS_INVESTOR, { lang: languageCode }) },
                    HttpStatus.BAD_REQUEST,
                );
            }
            // create new company
            const newCompany = await this.companyService.createCompany({ name: userDto.companyName }, languageCode);
            user.company = newCompany;
        }
        const newUser = await this.userRepository.save(user);

        if (userDto.accountType === AccountType.ACCELERATOR && userDto.acceleratorName) {
            // create new accelerator
            const newAccelerator = await this.acceleratorService.createAccelerator({
                name: userDto.acceleratorName,
            });
            user.accelerator = newAccelerator;
            const invitations = await this.invitationService.getPendingInvitationsByEmail(userDto.email);
            if (invitations.length) {
                const updateCompaniesAccelerator = invitations.map((inv) =>
                    this.companyService.updateCompanyInvestorsAndAccelerator(
                        inv.inviterCompany.id,
                        { acceleratorId: newAccelerator.id },
                        languagesCodes.en,
                    ),
                );
                await Promise.all(updateCompaniesAccelerator);
                await this.invitationService.deletePendingInvitationsByEmail(userDto.email, languageCode);
            }
        } else if (userDto.accountType === AccountType.INVESTOR) {
            const invitations = await this.invitationService.getPendingInvitationsByEmail(userDto.email);

            if (invitations.length) {
                const updateCompaniesInvestors = invitations.map((inv) =>
                    this.companyService.updateCompanyInvestorsAndAccelerator(
                        inv.inviterCompany.id,
                        { investorsIds: [newUser.id] },
                        languagesCodes.en,
                    ),
                );
                await Promise.all(updateCompaniesInvestors);
                await this.invitationService.deletePendingInvitationsByEmail(userDto.email, languageCode);
            }
        }

        await this.userRepository.save(newUser);

        return newUser;
    }

    async findUserByEmail(email: string, selectPassword = false): Promise<UserEntity> {
        return this.userRepository.findOne({
            where: { email },
            select: selectPassword
                ? ["id", "refreshToken", "firstName", "lastName", "accountType", "password"]
                : ["id", "refreshToken", "firstName", "lastName", "accountType"],
            relations: ["roles"],
        });
    }

    async findUsersByEmails(emails: string[]): Promise<UserEntity[]> {
        return this.userRepository.find({
            where: emails.map((email) => ({ email })),
            select: ["id", "email", "firstName", "lastName", "accountType"],
        });
    }

    async findUserById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne(id, {
            select: ["id", "refreshToken"],
            relations: ["roles"],
        });
    }

    async findOneById(id: number, language: string): Promise<UserDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(UserKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.userMapper.fromEntityToDTO(UserDto, user);
    }

    async getUserPayLoadById(id: number, language: string): Promise<UserPayloadDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["roles"],
        });

        if (!user) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(UserKeys.USER_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.userPayloadMapper.fromEntityToDTO(UserPayloadDto, user);
    }

    async updateRefreshToken(userId: number, refreshToken: string): Promise<void> {
        await this.userRepository.update({ id: userId }, { refreshToken });
    }

    async updatedUserPassword(userId: number, password: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userRepository.update({ id: userId }, { password: hashedPassword });
    }

    async isAdminUser(userEntity: UserEntity): Promise<boolean> {
        const user = await this.userRepository.findOne(
            { id: userEntity.id },
            {
                relations: ["roles"],
            },
        );

        for (const role of user.roles) {
            if (role.name === UserRole.ADMIN) {
                return true;
            }
        }

        return false;
    }

    public async getUsersByIds(userIds: number[]): Promise<UserEntity[]> {
        return await this.userRepository.find({
            where: userIds.map((id) => ({ id })),
            select: ["createdAt", "id", "accountType", "email", "firstName", "lastName"],
        });
    }

    public async getUserWithInvestmentPortfolioCompanies(userId: number): Promise<UserEntity> {
        return await this.userRepository.findOne({
            relations: ["investmentPortfolioCompanies"],
            where: {
                id: userId,
            },
        });
    }

    public async getUserWithAcceleratorCompanies(userId: number): Promise<UserEntity> {
        return await this.userRepository.findOne({
            relations: ["accelerator", "accelerator.companies"],
            where: {
                id: userId,
            },
        });
    }

    async getUserWithCompany(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne(
            { id },
            {
                relations: ["company", "company.accelerator"],
            },
        );
    }

    public async deleteUser(userPayload: UserPayloadDto, language: string): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            await this.userRepository.deleteUser(userPayload.id);
            return {
                isSuccessful: true,
                message: "User Deleted Successfully!",
            };
        } catch (e) {
            console.error(`Error while deleting user data and profile: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(UserKeys.DELETION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }
}
