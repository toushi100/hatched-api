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
    UseGuards,
    UseInterceptors,
    ValidationPipe,
    Request,
} from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AvailableLanguageCodes } from "../../i18n/languageCodes";
import { LanguageInterceptor } from "../../interceptors/language.interceptor";
import { EmployeeService } from "./employee.service";
import { I18nLang } from "nestjs-i18n";
import { CreatedEmployeeDto } from "./dto/response/created_employee.dto";
import { CreateEmployeeDto } from "./dto/request/create_employee.dot";
import { BasicOperationsResponse } from "src/common/dto/basic-operations-response.dto";
import { UpdateEmployeeDto } from "./dto/request/update_employee.dot";
import { EmployeeListDto } from "./dto/response/employee_list_item.dto copy";
import { EmployeeListFilterDto } from "./dto/request/employee_list_filter.dto";
import { AccountTypes } from "../../decorators/account-types.decorator";
import { AccountType } from "../core/user/account-type.enum";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AccountTypeGuard } from "../../guards/account-types.guard";
import { UpdateEmployeeESOPDto } from "./dto/request/update_employee_esop.dto";
import { EmployeeVestingItemDto } from "./dto/response/employee_vesting_item.dto";

@Controller("employees")
@ApiTags("Employee")
@ApiHeader({
    name: "Accept-Language",
    enum: AvailableLanguageCodes,
})
@UseInterceptors(LanguageInterceptor)
export class EmployeeController {
    constructor(public readonly employeeService: EmployeeService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Get Employees List" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Employees List",
        type: EmployeeListDto,
    })
    @ApiBearerAuth()
    getEmployees(
        @Request() req,
        @Query(ValidationPipe) employeeListFilterDto: EmployeeListFilterDto,
    ): Promise<EmployeeListDto> {
        return this.employeeService.getEmployees(req.user, employeeListFilterDto);
    }

    @Get("esop-vesting")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get List of employees with ESOP vesting shares" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Employees list with ESOP vesting shares",
        type: [EmployeeVestingItemDto],
    })
    @ApiBearerAuth()
    getESOPVestingEmployees(@Request() req, @I18nLang() lang: string): Promise<EmployeeVestingItemDto[]> {
        return this.employeeService.getESOPVestingEmployees(req.user, lang);
    }

    @Post()
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Create a new employee" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Created employee",
        type: CreatedEmployeeDto,
    })
    @ApiBearerAuth()
    createEmployee(
        @Request() req,
        @Body() createEmployeeDto: CreateEmployeeDto,
        @I18nLang() lang: string,
    ): Promise<CreatedEmployeeDto> {
        console.log(createEmployeeDto);
        return this.employeeService.createEmployee(req.user, createEmployeeDto, lang);
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Employee" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Employee",
        type: CreatedEmployeeDto,
    })
    @ApiBearerAuth()
    getEmployee(@Param("id", ParseIntPipe) employeeId: number, @I18nLang() lang: string): Promise<CreatedEmployeeDto> {
        return this.employeeService.getEmployee(employeeId, lang);
    }

    @Put(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update employee" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "The employee updated successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateEmployee(
        @Request() req,
        @Param("id", ParseIntPipe) employeeId: number,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.employeeService.updateEmployee(req.user, employeeId, updateEmployeeDto, lang);
    }

    @Put(":id/esop")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Update employee ESOP" })
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Employee's ESOP updated successfully",
        type: BasicOperationsResponse,
    })
    @ApiBearerAuth()
    updateEmployeeESOP(
        @Request() req,
        @Param("id", ParseIntPipe) employeeId: number,
        @Body() updateEmployeeESOPDto: UpdateEmployeeESOPDto,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.employeeService.updateEmployeeESOP(req.user, employeeId, updateEmployeeESOPDto, lang);
    }

    @Delete(":id")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete employee" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "The employee deleted successfully",
        type: BasicOperationsResponse,
    })
    deleteEmployee(
        @Request() req,
        @Param("id", ParseIntPipe) employeeId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.employeeService.deleteEmployee(req.user, employeeId, lang);
    }

    @Delete(":id/esop")
    @AccountTypes(AccountType.STARTUP)
    @UseGuards(JwtAuthGuard, AccountTypeGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Delete employee esop" })
    @ApiBearerAuth()
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Employee's ESOP deleted successfully",
        type: BasicOperationsResponse,
    })
    deleteEmployeeESOP(
        @Request() req,
        @Param("id", ParseIntPipe) employeeId: number,
        @I18nLang() lang: string,
    ): Promise<BasicOperationsResponse> {
        return this.employeeService.deleteEmployeeESOP(req.user, employeeId, lang);
    }
}
