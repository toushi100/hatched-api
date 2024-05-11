import { EntityRepository, In, IsNull, Not } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { AbstractRepository } from "../../../common/abstract.repository";
import { InvestmentRoundEntity } from "../entities/investment-round.entity";
import { CompanyEntity } from "src/modules/company/entities/company.entity";
import { UpdateInvestmentRoundDto } from "../dto/request/update_investment_round.dto";
import { RoundInvestorEntity } from "../entities/round-investor.entity";
import { RoundInvestorInvestmentEntity } from "../entities/round-investor-investment.entity";
import { CreateInvestmentRoundDto } from "../dto/request/create_investment_round.dto";
import { InvestmentRoundName } from "../types/InvestmentRoundName.enum";

@EntityRepository(InvestmentRoundEntity)
export class InvestmentRoundRepository extends AbstractRepository<InvestmentRoundEntity> {
    public async createInvestmentRound(company: CompanyEntity, createInvestmentRoundDto: CreateInvestmentRoundDto) {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const isFirstRound = InvestmentRoundName.Incorporation === createInvestmentRoundDto.name;
            const newInvestmentRound = transactionalEntityManager.create(InvestmentRoundEntity);
            newInvestmentRound.company = company;
            newInvestmentRound.name = createInvestmentRoundDto.name;
            newInvestmentRound.valuePerLastCompanyValuation = createInvestmentRoundDto.valuePerLastCompanyValuation;
            newInvestmentRound.preMoney = createInvestmentRoundDto.preMoney;
            newInvestmentRound.investmentAmount = createInvestmentRoundDto.investmentAmount;
            newInvestmentRound.postMoney = createInvestmentRoundDto.postMoney;
            newInvestmentRound.existingShares = createInvestmentRoundDto.existingShares;
            newInvestmentRound.existingSharesLessESOP = createInvestmentRoundDto.existingSharesLessESOP;
            newInvestmentRound.newShares = createInvestmentRoundDto.newRoundShares;

            const latestClosedRound = await transactionalEntityManager.findOne(InvestmentRoundEntity, {
                where: {
                    company: { id: company.id },
                    roundClosingDate: Not(IsNull()),
                    registrationDate: Not(IsNull()),
                },
                relations: ["company"],
                order: { createdAt: "DESC" },
            });

            if (latestClosedRound) {
                newInvestmentRound.totalSharesAfterRound =
                    latestClosedRound.totalSharesAfterRound + createInvestmentRoundDto.newRoundShares;
            } else {
                newInvestmentRound.totalSharesAfterRound = createInvestmentRoundDto.newRoundShares;
            }
            if (createInvestmentRoundDto.exportToNewCapTable) {
                newInvestmentRound.roundClosingDate = new Date(createInvestmentRoundDto.roundClosingDate);
                newInvestmentRound.registrationDate = new Date(createInvestmentRoundDto.registrationDate);
            }

            const createdInvestmentRound = await transactionalEntityManager.save(newInvestmentRound);

            // create investors
            if (createInvestmentRoundDto.investors) {
                // get current investors, if any
                const dtoInvestorsEmails = createInvestmentRoundDto.investors.map(({ email }) => email);
                const currentInvestors = await transactionalEntityManager.find(RoundInvestorEntity, {
                    where: { email: In(dtoInvestorsEmails), company },
                    relations: ["company"],
                });

                // create new investment rounds for current investors
                const currentInvestorsNewInvestmentsPromises = currentInvestors.map(async (currentInvestor) => {
                    const newRoundInvestorData = createInvestmentRoundDto.investors.find(
                        (inv) => inv.email === currentInvestor.email,
                    );
                    // update investor data
                    currentInvestor.name = newRoundInvestorData.name;
                    currentInvestor.phone = newRoundInvestorData.phone;
                    currentInvestor.nationality = newRoundInvestorData.nationality;
                    currentInvestor.taxNo = newRoundInvestorData.taxNo;
                    // new round investment
                    const newRoundInvestment = transactionalEntityManager.create(RoundInvestorInvestmentEntity);
                    newRoundInvestment.investor = currentInvestor;
                    newRoundInvestment.investmentRound = createdInvestmentRound;
                    newRoundInvestment.issuedSharesFrom = newRoundInvestorData.issuedSharesFrom;
                    newRoundInvestment.issuedSharesTo = newRoundInvestorData.issuedSharesTo;
                    newRoundInvestment.investedAmount = newRoundInvestorData.investedAmount;
                    // newRoundInvestment.percentage = newRoundInvestorData.sharesPercentage;
                    if (isFirstRound) {
                        newRoundInvestment.shares = newRoundInvestorData.shares;
                        newRoundInvestment.percentage = !!newInvestmentRound.newShares
                            ? Number(((newRoundInvestment.shares / newInvestmentRound.newShares) * 100.0).toFixed(12))
                            : 0;
                    } else {
                        if (!!newInvestmentRound.postMoney) {
                            newRoundInvestment.shares = Math.round(
                                (newRoundInvestment.investedAmount / newInvestmentRound.postMoney) *
                                    (newInvestmentRound.newShares + newInvestmentRound.existingSharesLessESOP),
                            );
                        } else {
                            newRoundInvestment.shares = newRoundInvestorData.shares;
                        }
                        let totalShares = 0;
                        if (newInvestmentRound.newShares) totalShares += newInvestmentRound.newShares;
                        if (newInvestmentRound.existingSharesLessESOP)
                            totalShares += newInvestmentRound.existingSharesLessESOP;
                        newRoundInvestment.percentage = !!totalShares
                            ? Number(((newRoundInvestment.shares / totalShares) * 100.0).toFixed(12))
                            : 0;
                    }
                    newRoundInvestment.premium = newRoundInvestorData.premium;
                    newRoundInvestment.nominalPrice = newRoundInvestorData.nominalPrice;
                    newRoundInvestment.notes = newRoundInvestorData.notes;
                    const createdRoundInvestment = await transactionalEntityManager.save(newRoundInvestment);

                    return createdRoundInvestment;
                });

                const currentInvestorsEmails = currentInvestors.map((inv) => inv.email);

                const newInvestors = createInvestmentRoundDto.investors.filter(
                    ({ email }) => !currentInvestorsEmails.includes(email),
                );

                // create new investors and their new investments
                const newInvestorsInvestmentsPromises = newInvestors.map(async (investorDto) => {
                    // new investor
                    const newInvestor = transactionalEntityManager.create(RoundInvestorEntity);
                    newInvestor.name = investorDto.name;
                    newInvestor.email = investorDto.email;
                    newInvestor.phone = investorDto.phone;
                    newInvestor.nationality = investorDto.nationality;
                    newInvestor.taxNo = investorDto.taxNo;
                    newInvestor.company = company;
                    const createdInvestor = await transactionalEntityManager.save(newInvestor);
                    // new investment
                    const newRoundInvestment = transactionalEntityManager.create(RoundInvestorInvestmentEntity);
                    newRoundInvestment.investor = createdInvestor;
                    newRoundInvestment.investmentRound = createdInvestmentRound;
                    newRoundInvestment.issuedSharesFrom = investorDto.issuedSharesFrom;
                    newRoundInvestment.issuedSharesTo = investorDto.issuedSharesTo;
                    newRoundInvestment.investedAmount = investorDto.investedAmount;
                    // newRoundInvestment.percentage = investorDto.sharesPercentage;
                    if (isFirstRound) {
                        newRoundInvestment.shares = investorDto.shares;
                        newRoundInvestment.percentage = !!newInvestmentRound.newShares
                            ? Number(((newRoundInvestment.shares / newInvestmentRound.newShares) * 100.0).toFixed(12))
                            : 0;
                    } else {
                        if (!!newInvestmentRound.postMoney) {
                            newRoundInvestment.shares = Math.round(
                                (newRoundInvestment.investedAmount / newInvestmentRound.postMoney) *
                                    (newInvestmentRound.newShares + newInvestmentRound.existingSharesLessESOP),
                            );
                        } else {
                            newRoundInvestment.shares = investorDto.shares;
                        }
                        let totalShares = 0;
                        if (newInvestmentRound.newShares) totalShares += newInvestmentRound.newShares;
                        if (newInvestmentRound.existingSharesLessESOP)
                            totalShares += newInvestmentRound.existingSharesLessESOP;
                        newRoundInvestment.percentage = !!totalShares
                            ? Number(((newRoundInvestment.shares / totalShares) * 100.0).toFixed(12))
                            : 0;
                    }
                    newRoundInvestment.premium = investorDto.premium;
                    newRoundInvestment.nominalPrice = investorDto.nominalPrice;
                    newRoundInvestment.notes = investorDto.notes;
                    const createdRoundInvestment = await transactionalEntityManager.save(newRoundInvestment);

                    return createdRoundInvestment;
                });

                const newInvestorsInvestments = await Promise.all([
                    ...currentInvestorsNewInvestmentsPromises,
                    ...newInvestorsInvestmentsPromises,
                ]);

                // check investors invested sum is equal to the round investment amount
                // before the round is closed and exported to captable
                if (createInvestmentRoundDto.exportToNewCapTable) {
                    const investorsInvestedAmountsSum = newInvestorsInvestments.reduce(
                        (acc, investment) => acc + investment.investedAmount,
                        0,
                    );

                    if (investorsInvestedAmountsSum !== createInvestmentRoundDto.investmentAmount) {
                        throw new BadRequestException(
                            "The sum of the investors' investments must be equal to the round's invested amount",
                        );
                    }
                }

                createdInvestmentRound.investorInvestments = newInvestorsInvestments;
            } else {
                createdInvestmentRound.investorInvestments = [];
            }

            return createdInvestmentRound;
        });
    }

    public async updateInvestmentRound(
        company: CompanyEntity,
        investmentRoundId: number,
        updateInvestmentRoundDto: UpdateInvestmentRoundDto,
    ): Promise<InvestmentRoundEntity> {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const investmentRound = await transactionalEntityManager.findOne(InvestmentRoundEntity, investmentRoundId, {
                relations: ["company", "investorInvestments", "investorInvestments.investor"],
            });
            const isFirstRound = InvestmentRoundName.Incorporation === updateInvestmentRoundDto.name;

            // keep saved data as is, if the round is closed
            if (!!investmentRound.roundClosingDate) {
                updateInvestmentRoundDto.name = investmentRound.name as InvestmentRoundName;
                updateInvestmentRoundDto.valuePerLastCompanyValuation = investmentRound.valuePerLastCompanyValuation;
                updateInvestmentRoundDto.preMoney = investmentRound.preMoney;
                updateInvestmentRoundDto.investmentAmount = investmentRound.investmentAmount;
                updateInvestmentRoundDto.postMoney = investmentRound.postMoney;
                updateInvestmentRoundDto.existingShares = investmentRound.existingShares;
                updateInvestmentRoundDto.existingSharesLessESOP = investmentRound.existingSharesLessESOP;
                updateInvestmentRoundDto.newRoundShares = investmentRound.newShares;
            }

            // update investment round
            investmentRound.name = updateInvestmentRoundDto.name;
            investmentRound.valuePerLastCompanyValuation = updateInvestmentRoundDto.valuePerLastCompanyValuation;
            investmentRound.preMoney = updateInvestmentRoundDto.preMoney;
            investmentRound.investmentAmount = updateInvestmentRoundDto.investmentAmount;
            investmentRound.postMoney = updateInvestmentRoundDto.postMoney;
            investmentRound.existingShares = updateInvestmentRoundDto.existingShares;
            investmentRound.existingSharesLessESOP = updateInvestmentRoundDto.existingSharesLessESOP;
            investmentRound.newShares = updateInvestmentRoundDto.newRoundShares;

            const latestClosedRound = await transactionalEntityManager.findOne(InvestmentRoundEntity, {
                where: {
                    id: Not(investmentRoundId),
                    company: { id: company.id },
                    roundClosingDate: Not(IsNull()),
                    registrationDate: Not(IsNull()),
                },
                relations: ["company"],
                order: { createdAt: "DESC" },
            });

            if (latestClosedRound) {
                investmentRound.totalSharesAfterRound =
                    latestClosedRound.totalSharesAfterRound + updateInvestmentRoundDto.newRoundShares;
            } else {
                investmentRound.totalSharesAfterRound = updateInvestmentRoundDto.newRoundShares;
            }

            if (updateInvestmentRoundDto.exportToNewCapTable) {
                investmentRound.roundClosingDate = new Date(updateInvestmentRoundDto.roundClosingDate);
                investmentRound.registrationDate = new Date(updateInvestmentRoundDto.registrationDate);
            }
            const updatedInvestmentRound = await transactionalEntityManager.save(investmentRound);

            if (!updateInvestmentRoundDto.investors) {
                if (!!investmentRound.roundClosingDate) {
                    throw new BadRequestException("Can not delete investors of a closed investment round");
                } else updateInvestmentRoundDto.investors = [];
            }

            // get current investors emails and updated dto emails to compare
            const currentRoundInvestorsEmails = investmentRound.investorInvestments.map((inv) => inv.investor.email);
            const updatedDtoEmails = updateInvestmentRoundDto.investors.map((inv) => inv.email);

            // get current investors with investments in other rounds, if any
            const allCurrentCompanyInvestors = await transactionalEntityManager.find(RoundInvestorEntity, {
                where: { email: In(updatedDtoEmails), company },
                relations: ["company"],
            });

            // filter and create new investments and investors (if new) from the update dto
            const newInvestments = updateInvestmentRoundDto.investors.filter(
                (inv) => !currentRoundInvestorsEmails.includes(inv.email),
            );
            const newInvestmentEntitiesPromises = newInvestments.map(async (investmentDto) => {
                // create new investor if not current company investor
                let companyInvestor = allCurrentCompanyInvestors.find(
                    (investorEntity) => investorEntity.email === investmentDto.email,
                );
                if (companyInvestor) {
                    companyInvestor.name = investmentDto.name;
                    companyInvestor.phone = investmentDto.phone;
                    companyInvestor.nationality = investmentDto.nationality;
                    companyInvestor.taxNo = investmentDto.taxNo;
                    companyInvestor = await transactionalEntityManager.save(companyInvestor);
                } else {
                    const newInvestor = transactionalEntityManager.create(RoundInvestorEntity);
                    newInvestor.name = investmentDto.name;
                    newInvestor.email = investmentDto.email;
                    newInvestor.phone = investmentDto.phone;
                    newInvestor.nationality = investmentDto.nationality;
                    newInvestor.taxNo = investmentDto.taxNo;
                    newInvestor.company = company;
                    companyInvestor = await transactionalEntityManager.save(newInvestor);
                }

                // create new round investment for the investor
                const newInvestment = transactionalEntityManager.create(RoundInvestorInvestmentEntity);
                newInvestment.investor = companyInvestor;
                newInvestment.investmentRound = updatedInvestmentRound;
                newInvestment.issuedSharesFrom = investmentDto.issuedSharesFrom;
                newInvestment.issuedSharesTo = investmentDto.issuedSharesTo;
                newInvestment.investedAmount = investmentDto.investedAmount;
                // newInvestment.shares = investmentDto.shares;
                // newInvestment.percentage = investmentDto.sharesPercentage;
                if (isFirstRound) {
                    newInvestment.shares = investmentDto.shares;
                    newInvestment.percentage = !!investmentRound.newShares
                        ? Number(((newInvestment.shares / investmentRound.newShares) * 100.0).toFixed(12))
                        : 0;
                } else {
                    if (!!investmentRound.postMoney) {
                        newInvestment.shares = Math.round(
                            (newInvestment.investedAmount / investmentRound.postMoney) *
                                (investmentRound.newShares + investmentRound.existingSharesLessESOP),
                        );
                    } else {
                        newInvestment.shares = investmentDto.shares;
                    }
                    let totalShares = 0;
                    if (investmentRound.newShares) totalShares += investmentRound.newShares;
                    if (investmentRound.existingSharesLessESOP) totalShares += investmentRound.existingSharesLessESOP;
                    newInvestment.percentage = !!totalShares
                        ? Number(((newInvestment.shares / totalShares) * 100.0).toFixed(12))
                        : 0;
                }
                newInvestment.premium = investmentDto.premium;
                newInvestment.nominalPrice = investmentDto.nominalPrice;
                newInvestment.notes = investmentDto.notes;
                const createdRoundInvestment = await transactionalEntityManager.save(newInvestment);

                return createdRoundInvestment;
            });

            // filter and update current investors and their investments in the db
            const updatedCurrentInvestorsEmails = updatedDtoEmails.filter((email) =>
                currentRoundInvestorsEmails.includes(email),
            );
            const investmentsToUpdate = await transactionalEntityManager.find(RoundInvestorInvestmentEntity, {
                where: {
                    investor: {
                        email: In(updatedCurrentInvestorsEmails),
                        company,
                    },
                    investmentRound: {
                        id: investmentRoundId,
                    },
                },
                relations: ["investor"],
            });

            const updatedInvestmentEntitiesPromises = investmentsToUpdate.map(async (invEntity) => {
                const updateDto = updateInvestmentRoundDto.investors.find(
                    (invDto) => invDto.email === invEntity.investor.email,
                );
                // update investor data
                invEntity.investor.name = updateDto.name;
                invEntity.investor.phone = updateDto.phone;
                invEntity.investor.nationality = updateDto.nationality;
                invEntity.investor.taxNo = updateDto.taxNo;
                // update investment data
                invEntity.issuedSharesFrom = updateDto.issuedSharesFrom;
                invEntity.issuedSharesTo = updateDto.issuedSharesTo;
                // if (updateDto.shares) invEntity.shares = updateDto.shares;
                invEntity.investedAmount = updateDto.investedAmount;
                // invEntity.percentage = updateDto.sharesPercentage;
                invEntity.premium = updateDto.premium;
                invEntity.nominalPrice = updateDto.nominalPrice;
                invEntity.notes = updateDto.notes;

                if (isFirstRound) {
                    invEntity.shares = updateDto.shares;
                    invEntity.percentage = !!investmentRound.newShares
                        ? Number(((invEntity.shares / investmentRound.newShares) * 100.0).toFixed(12))
                        : 0;
                } else {
                    if (!!investmentRound.postMoney) {
                        invEntity.shares = Math.round(
                            (invEntity.investedAmount / investmentRound.postMoney) *
                                (investmentRound.newShares + investmentRound.existingSharesLessESOP),
                        );
                    } else {
                        invEntity.shares = updateDto.shares;
                    }
                    let totalShares = 0;
                    if (investmentRound.newShares) totalShares += investmentRound.newShares;
                    if (investmentRound.existingSharesLessESOP) totalShares += investmentRound.existingSharesLessESOP;
                    invEntity.percentage = !!totalShares
                        ? Number(((invEntity.shares / totalShares) * 100.0).toFixed(12))
                        : 0;
                }

                const updatedEntity = await transactionalEntityManager.save(invEntity);
                return updatedEntity;
            });

            const investmentEntities = await Promise.all([
                ...newInvestmentEntitiesPromises,
                ...updatedInvestmentEntitiesPromises,
            ]);
            // check investors invested sum is equal to the round investment amount
            // before the round is closed and exported to captable
            if (updateInvestmentRoundDto.exportToNewCapTable) {
                const investorsInvestedAmountsSum = investmentEntities.reduce(
                    (acc, investment) => acc + investment.investedAmount,
                    0,
                );

                if (investorsInvestedAmountsSum !== updateInvestmentRoundDto.investmentAmount) {
                    throw new BadRequestException(
                        "The sum of the investors' investments must be equal to the round's invested amount",
                    );
                }
            }
            investmentRound.investorInvestments = investmentEntities;

            // filter and delete investments
            const deletedInvestorsEmails = currentRoundInvestorsEmails.filter(
                (email) => !updatedDtoEmails.includes(email),
            );
            const investmentsToDelete = await transactionalEntityManager.find(RoundInvestorInvestmentEntity, {
                where: {
                    investor: {
                        email: In(deletedInvestorsEmails),
                        company,
                    },
                    investmentRound: {
                        id: investmentRoundId,
                    },
                },
                relations: ["investor", "investmentRound"],
                select: ["id"],
            });
            if (investmentsToDelete.length > 0) {
                await transactionalEntityManager.delete(RoundInvestorInvestmentEntity, investmentsToDelete);
            }
            // filter and delete investors with no other round investments for this company
            const companyInvestors = await transactionalEntityManager.find(RoundInvestorEntity, {
                where: { company },
                relations: ["investments"],
            });
            const investorsToDelete = companyInvestors.filter((inv) => inv.investments.length === 0);
            if (investorsToDelete.length > 0) {
                await transactionalEntityManager.delete(RoundInvestorEntity, investorsToDelete);
            }

            return updatedInvestmentRound;
        });
    }

    public async deleteInvestmentRound(investmentRoundId: number, company: CompanyEntity) {
        return this.manager.transaction(async (transactionalEntityManager) => {
            const investmentRound = await transactionalEntityManager.findOne(InvestmentRoundEntity, investmentRoundId);
            if (investmentRound) {
                // delete investment round & investments by cascade
                await transactionalEntityManager.delete(InvestmentRoundEntity, investmentRoundId);

                // filter and delete investors with no other round investments for this company
                const companyInvestors = await transactionalEntityManager.find(RoundInvestorEntity, {
                    where: { company },
                    relations: ["investments"],
                });
                const investorsToDelete = companyInvestors.filter((inv) => inv.investments.length === 0);
                if (investorsToDelete.length > 0) {
                    await transactionalEntityManager.delete(RoundInvestorEntity, investorsToDelete);
                }
            }
        });
    }
}
