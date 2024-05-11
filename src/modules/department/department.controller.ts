import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { DepartmentService } from "./department.service";
import { I18nLang } from "nestjs-i18n";
import { CreatedDepartmentDto } from "./dto/response/created_department.dto";
import { CreateDepartmentDto } from "./dto/request/create_department.dto";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { UpdateDepartmentDto } from "./dto/request/update_department.dto";
import { DepartmentsListDto } from "./dto/response/departments_list.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { AccountTypes } from "src/decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";

@Controller("departments")
@ApiTags("Department")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class DepartmentController {
    constructor(public readonly departmentService: DepartmentService) {}

    @Post()
    // @Roles(UserRole.ADMIN)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Create a new department" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Created department successfully",
        type: CreatedDepartmentDto,
    })
    @ApiBearerAuth()
    createDepartment(
        @Request() req,
        @Body() createDepartmentDto: CreateDepartmentDto,
        @I18nLang() lang: string,
    ): Promise<CreatedDepartmentDto> {
        return this.departmentService.createDepartment(req.user, createDepartmentDto, lang);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get departments list" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved departments list successfully",
        type: DepartmentsListDto,
    })
    @ApiBearerAuth()
    getDepartments(@Request() req, @Query(ValidationPipe) paginationDto: PaginationDto): Promise<DepartmentsListDto> {
        return this.departmentService.getDepartments(req.user, paginationDto);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get department by id" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Retrieved department by id successfully",
        type: CreatedDepartmentDto,
    })
    @ApiBearerAuth()
    getDepartmentById(
        @Param("id", ParseIntPipe) departmentId: number,
        @I18nLang() lang: string,
    ): Promise<CreatedDepartmentDto> {
        return this.departmentService.getDepartmentById(departmentId, lang);
    }

    @Put(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update department" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Updated department successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateDepartment(
        @Request() req,
        @Param("id", ParseIntPipe) departmentId: number,
        @Body() updateDepartmentDto: UpdateDepartmentDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.departmentService.updateDepartment(req.user, departmentId, updateDepartmentDto, lang);
    }

    @Delete(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete department" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Deleted department successfully",
        type: BasicOperationsResponse,
    })
    deleteDepartment(
        @Request() req,
        @Param("id", ParseIntPipe) departmentId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.departmentService.deleteDepartment(req.user, departmentId, lang);
    }
}
