import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../../i18n/languageCodes";
import { LanguageInterceptor } from "../../../interceptors/language.interceptor";
import { CreatedBudgetCategoryDto } from "./dto/response/created_budget_category.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { BudgetCategoryService } from "./budget-category.service";

@Controller("budget-categories")
@ApiTags("Budget Category")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class BudgetCategoryController {
    constructor(public readonly budgetCategoryService: BudgetCategoryService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get budget categories list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved budget categories list successfully",
        type: [CreatedBudgetCategoryDto],
    })
    @ApiBearerAuth()
    getBudgetCategoriesList(): Promise<CreatedBudgetCategoryDto[]> {
        return this.budgetCategoryService.getBudgetCategories();
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get budget category by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved budget category by id successfully",
        type: CreatedBudgetCategoryDto,
    })
    @ApiBearerAuth()
    getBudgetCategoryById(@Param("id", ParseIntPipe) budgetCategoryId: number): Promise<CreatedBudgetCategoryDto> {
        return this.budgetCategoryService.getBudgetCategoryById(budgetCategoryId);
    }
}
