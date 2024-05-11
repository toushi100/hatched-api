import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { BudgetCategoryRepository } from "./repositories/budget-category.repository";
import { BudgetCategoryEntity } from "./entities/budget-category.entity";
import { BudgetCategory } from "./types/budget_category.enum";
import { CreatedBudgetCategoryDto } from "./dto/response/created_budget_category.dto";
import { CreatedBudgetCategoryMapper } from "./mapper/created_budget_category.mapper";

@Injectable()
export class BudgetCategoryService {
    constructor(
        public readonly budgetCategoryRepository: BudgetCategoryRepository,
        public readonly createdBudgetCategoryMapper: CreatedBudgetCategoryMapper,
    ) {}

    public async getBudgetCategories(): Promise<CreatedBudgetCategoryDto[]> {
        const dbBudgetCategories = await this.budgetCategoryRepository.find();
        const budgetCategories: CreatedBudgetCategoryDto[] = [];
        dbBudgetCategories.forEach((bCategory) =>
            budgetCategories.push(
                this.createdBudgetCategoryMapper.fromEntityToDTO(CreatedBudgetCategoryDto, bCategory),
            ),
        );
        return budgetCategories;
    }

    public async getBudgetCategoryById(budgetCategoryId: number): Promise<CreatedBudgetCategoryDto> {
        const budgetCategory = await this.budgetCategoryRepository.findOne(budgetCategoryId);

        if (!budgetCategory) {
            throw new HttpException({ message: "Couldn't find budget category" }, HttpStatus.NOT_FOUND);
        }

        return this.createdBudgetCategoryMapper.fromEntityToDTO(CreatedBudgetCategoryDto, budgetCategory);
    }

    public async getBudgetCategoryByType(budgetCategoryType: BudgetCategory): Promise<BudgetCategoryEntity> {
        const budgetCategory = await this.budgetCategoryRepository.findOne({ where: { type: budgetCategoryType } });

        if (!budgetCategory) {
            throw new HttpException({ message: "Couldn't find budget category" }, HttpStatus.NOT_FOUND);
        }

        return budgetCategory;
    }
}
