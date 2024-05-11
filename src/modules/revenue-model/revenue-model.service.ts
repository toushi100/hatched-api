import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { languagesCodes } from "../../constants/languages";
import { RevenueModelAndItemKeys } from "./translate.enum";
import { RevenueModelRepository } from "./repositories/revenue-model.repository";
import { RevenueItemRepository } from "./repositories/revenue-item.repository";
import { BasicOperationsResponse } from "../../common/dto/basic-operations-response.dto";
import { RevenueModelOptionsListItemMapper } from "./mapper/revenue_models_options_list.mapper";
import { CreatedRevenueItemMapper } from "./mapper/created_revenue_item.mapper";
import { UpdateRevenueItemDto } from "./dto/request/update_revenue_item.dto";
import { CreateRevenueItemDto } from "./dto/request/create_revenue_item.dto";
import { CreatedRevenueItemDto } from "./dto/response/created_revenue_item.dto";
import { RevenueModelDto } from "./dto/response/revenue_model.dto";
import { RevenueModelEntity } from "./entities/revenue-model.entity";
import { RevenueItemEntity } from "./entities/revenue-item.entity";
import { UserPayloadDto } from "../core/user/dto/user-payload.dto";
import { CompanyService } from "../company/services/company.service";
import { CompanyKeys } from "../company/translate.enum";
import { Entity } from "typeorm";

@Injectable()
export class RevenueModelService {
    constructor(
        public readonly revenueModelRepository: RevenueModelRepository,
        public readonly revenueItemRepository: RevenueItemRepository,
        public readonly revenueModelOptionsListItemMapper: RevenueModelOptionsListItemMapper,
        public readonly createdRevenueItemMapper: CreatedRevenueItemMapper,
        private readonly i18n: I18nService,
        @Inject(forwardRef(() => CompanyService))
        private readonly companyService: CompanyService,
    ) { }

    public async getRevenueModelOptionsList(): Promise<RevenueModelDto[]> {
        const result = await this.revenueModelRepository.find();

        if (!result) {
            return [];
        }
        return result.map((revModel: RevenueModelEntity) =>
            this.revenueModelOptionsListItemMapper.fromEntityToDTO(RevenueModelDto, revModel),
        );
    }

    public async getRevenueItemsList(userPayload: UserPayloadDto): Promise<CreatedRevenueItemDto[]> {
        const result = await this.revenueItemRepository.find({
            relations: ["revenueModel", "company", "company.user"],
            where: {
                company: {
                    user: {
                        id: userPayload.id,
                    },
                },
            },
            order: {
                createdAt: "ASC",
            },
        });

        if (!result) {
            return [];
        }
        return result.map((revItem: RevenueItemEntity) =>
            this.createdRevenueItemMapper.fromEntityToDTO(CreatedRevenueItemDto, revItem),
        );
    }

    public async getRevenueItemById(revItemId: number, language: string): Promise<CreatedRevenueItemDto> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const revItem = await this.revenueItemRepository.findOne(revItemId, {
            relations: ["revenueModel", "company"],
        });

        if (!revItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RevenueModelAndItemKeys.ITEM_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return this.createdRevenueItemMapper.fromEntityToDTO(CreatedRevenueItemDto, revItem);
    }

    public async isRevenueItemExist(
        userId: number,
        companyId: number,
        revItemId: number,
        language: string,
    ): Promise<boolean> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const revItem = await this.revenueItemRepository.findOne(revItemId, {
            relations: ["revenueModel", "company", "company.user"],
            where: {
                company: {
                    id: companyId,
                    user: {
                        id: userId,
                    },
                },
            },
        });

        return !!revItem;
    }

    public async createRevenueItem(
        userPayload: UserPayloadDto,
        createRevItemDto: CreateRevenueItemDto,
        language: string,
    ): Promise<CreatedRevenueItemDto[]> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        try {
            const company = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);
            if (!company) {
                console.error(`Can't find company for user id ${userPayload.id}`);
                throw new Error(
                    await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                );
            }

            const listToSave: RevenueItemEntity[] = [];
            for (let i = 0; i < createRevItemDto.items.length; i++) {
                const revenueItem = new RevenueItemEntity();
                revenueItem.name = createRevItemDto.items[i].name;
                revenueItem.description = createRevItemDto.items[i].description;
                revenueItem.initialPrice = createRevItemDto.items[i].initialPrice;
                revenueItem.company = company;
                const { revenueModelId } = createRevItemDto.items[i];
                const revModel = await this.revenueModelRepository.findOne(revenueModelId);
                if (revModel) {
                    revenueItem.revenueModel = revModel;
                } else {
                    console.error(`Can't find revenue model with id ${revenueModelId}`);
                    throw new Error(
                        await this.i18n.translate(RevenueModelAndItemKeys.MODEL_NOT_FOUND, {
                            lang: languageCode,
                        }),
                    );
                }

                listToSave.push(revenueItem);
            }
            const result = await this.revenueItemRepository.save(listToSave);

            return result.map((entity: RevenueItemEntity) =>
                this.createdRevenueItemMapper.fromEntityToDTO(CreatedRevenueItemDto, entity),
            );
        } catch (e) {
            console.error(`Can't create revenue item: ${e}`);
            if (e instanceof HttpException) {
                throw e; // Re-throw HttpException
            } else {
                throw new HttpException(
                    {
                        message: await this.i18n.translate(RevenueModelAndItemKeys.CREATION_ERROR, {
                            lang: languageCode,
                        }),
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    async updateRevenueItem(
        userPayload: UserPayloadDto,
        revItemId: number,
        updateRevItemDto: UpdateRevenueItemDto,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const revItem = await this.revenueItemRepository.findOne(revItemId, {
            relations: ["revenueModel", "company"],
        });

        if (!revItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RevenueModelAndItemKeys.ITEM_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== revItem.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RevenueModelAndItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        let revenueModel = revItem.revenueModel;
        if (updateRevItemDto.revenueModelId !== revItem.revenueModel.id) {
            const revModel = await this.revenueModelRepository.findOne(updateRevItemDto.revenueModelId);
            if (revModel) {
                revenueModel = revModel;
            } else {
                console.error(`Can't find revenue model with id ${updateRevItemDto.revenueModelId}`);
                throw new Error(
                    await this.i18n.translate(RevenueModelAndItemKeys.MODEL_NOT_FOUND, {
                        lang: languageCode,
                    }),
                );
            }
        }
        const revItemUpdated = await this.revenueItemRepository.save({
            id: revItemId,
            ...updateRevItemDto,
            revenueModel,
        });
        if (!revItemUpdated) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RevenueModelAndItemKeys.UPDATE_ERROR, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return {
            isSuccessful: true,
            message: await this.i18n.translate(RevenueModelAndItemKeys.UPDATED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }

    async deleteRevenueItem(
        userPayload: UserPayloadDto,
        revItemId: number,
        language: string,
    ): Promise<BasicOperationsResponse> {
        const languageCode: string = languagesCodes[language] || languagesCodes.Default;
        const revItem = await this.revenueItemRepository.findOne(revItemId,
            {
                relations: ["company", "financialItemRevenues", "budgetItemRevenues"]
            }
        );

        if (!revItem) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RevenueModelAndItemKeys.ITEM_NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        const userCompany = await this.companyService.getCompanyByUserId(userPayload.id, languageCode);

        if (!userCompany) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(CompanyKeys.NOT_FOUND, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.NOT_FOUND,
            );
        }

        if (userCompany.id !== revItem.company.id) {
            throw new HttpException(
                {
                    message: await this.i18n.translate(RevenueModelAndItemKeys.COMPANY_ACCESS_DENIED, {
                        lang: languageCode,
                    }),
                },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const financialItemRevenuesIsNotEmpty = (revItem.financialItemRevenues && revItem.financialItemRevenues.length > 0);
        const budgetItemRevenuesIsNotEmpty = (revItem.budgetItemRevenues && revItem.budgetItemRevenues.length > 0);
        if (financialItemRevenuesIsNotEmpty || budgetItemRevenuesIsNotEmpty) {
            const message = (budgetItemRevenuesIsNotEmpty && financialItemRevenuesIsNotEmpty) ? "budget and financial model" : (budgetItemRevenuesIsNotEmpty ? "budget" : "financial model");
            throw new HttpException(
                {
                    message: `Cannot delete revenue item because it is already used in the ${message}`,
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.revenueItemRepository.delete(revItemId);

        return {
            isSuccessful: true,
            message: await this.i18n.translate(RevenueModelAndItemKeys.DELETED_SUCCESSFULLY, {
                lang: languageCode,
            }),
        };
    }
}
