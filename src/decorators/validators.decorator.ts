import {
    registerDecorator,
    validate,
    validateSync,
    ValidationArguments,
    ValidationError,
    ValidationOptions,
} from "class-validator";
import { LanguageCodeDto } from "../common/dto/language-code.dto";
import { CreateFinancialItemDto } from "src/modules/financial/dto/request/create_financial_item.dto";
import { BudgetCategory } from "src/modules/budget/budget-category/types/budget_category.enum";
import {
    FinancialDirectCostsCurrentValueCalculation,
    FinancialDirectCostsItemDto,
    FinancialDirectCostsManualCurrentValue,
} from "../modules/financial/dto/request/direct_cost_data.dto";
import { FinancialRevenueItemDto } from "../modules/financial/dto/request/revenue_data.dto";
import { FinancialOtherItemsDto } from "src/modules/financial/dto/request/other_data.dto";
import { plainToClass } from "class-transformer";
import { BudgetRevenueCurrentValueCalculation, BudgetRevenueItemDto, BudgetRevenueManualCurrentValue } from "src/modules/budget/budget-item/dto/request/revenue_data.dto";
import { BadRequestException } from "@nestjs/common";

export function IsUniqueArrayTranslation(validationOptions?: ValidationOptions): PropertyDecorator {
    return (object: any, propertyName: string) => {
        registerDecorator({
            propertyName,
            name: "IsUniqueArrayTranslation",
            target: object.constructor,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: LanguageCodeDto[], _args: ValidationArguments) {
                    let isValid = true;
                    if (value) {
                        const codeCountMap = {};
                        for (let i = 0; i < value.length; i++) {
                            if (codeCountMap[value[i].languageCode] === 1) {
                                isValid = false;
                                break;
                            }
                            codeCountMap[value[i].languageCode] = 1;
                        }
                    }
                    return isValid;
                },
            },
        });
    };
}


export function IsValidRevenueItemCurrentValue(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidData',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    const itemDto = args.object as BudgetRevenueItemDto;
                    const validationErrors: ValidationError[] = [];

                    if (itemDto.isManualInput) {
                        // Validation for Manual Input (expects an object)
                        console.log(`ff ${typeof value} &&& ${typeof value !== 'object'} ${Array.isArray(value)}`);
                        if (typeof value !== 'object' || Array.isArray(value)) {
                            validationErrors.push({
                                property: propertyName,
                                constraints: {
                                    "type": `${propertyName} must be an object.`
                                }
                            });
                        } else {
                            const currentValue = value as BudgetRevenueManualCurrentValue;
                            const dtoInstance = plainToClass(BudgetRevenueManualCurrentValue, currentValue);
                            const errors = await validate(dtoInstance);
                            errors.forEach(error => {
                                for (const [key, value] of Object.entries(error.constraints)) {
                                    error.constraints[key] = `${propertyName}.${value}`;
                                }
                            });
                            if (errors.length > 0) {
                                validationErrors.push(...errors);
                            }
                        }
                    } else {
                        // Validation for Calculation (expects an array)
                        if (!Array.isArray(value)) {
                            validationErrors.push({
                                property: propertyName,
                                constraints: {
                                    "type": `${propertyName} must be an array.`
                                }
                            });
                        } else if (value.length === 0) {
                            validationErrors.push({
                                property: propertyName,
                                constraints: {
                                    "type": `${propertyName} can't be empty.`
                                }
                            });
                        } else {
                            const currentValues = value as BudgetRevenueCurrentValueCalculation[];
                            let index = 0;
                            for (const currentValue of currentValues) {
                                const dtoInstance = plainToClass(BudgetRevenueCurrentValueCalculation, currentValue);
                                const errors = await validate(dtoInstance);
                                errors.forEach(error => {
                                    for (const [key, value] of Object.entries(error.constraints)) {
                                        error.constraints[key] = `${propertyName}.${index}.${value}`;
                                    }
                                });
                                if (errors.length > 0) {
                                    validationErrors.push(...errors);
                                }
                                index++;
                            }
                        }
                    }

                    if (validationErrors.length > 0) {
                        const errors: string[] = [];
                        validationErrors.forEach(error => {
                            if (error.property && error.constraints) {
                                for (const [key, value] of Object.entries(error.constraints)) {
                                    errors.push(`${value}`);
                                }
                            }
                        })
                        throw new BadRequestException({ message: 'Validation Error', errors: errors });
                    }

                    return validationErrors.length === 0;
                },
            },
        });
    };
}

// export function IsValidFinancialItem(validationOptions?: ValidationOptions) {
//     return function (object: Object, propertyName: string) {
//         registerDecorator({
//             name: "isValidData",
//             target: object.constructor,
//             propertyName: propertyName,
//             constraints: [],
//             options: validationOptions,
//             validator: {
//                 async validate(value: any, args: ValidationArguments) {
//                     console.log("***************************");
//                     console.log("args: ", args);
//                     console.log("***************************");
//                     console.log("value: ", value);
//                     console.log("***************************");
//                     const itemDto = args.object as CreateFinancialItemDto;

//                     if (itemDto.budgetCategoryType === BudgetCategory.DIRECT_COSTS) {
//                         const dtoInstance = plainToClass(DirectCostsItemDto, object);
//                         const errors: ValidationError[] = validateSync(dtoInstance);
//                         console.log(errors);

//                         const dataDto = value as DirectCostsItemDto;
//                         let currentValue;
//                         if (dataDto.isManualInput) {
//                             currentValue = dataDto.currentValue as DirectCostsManualCurrentValue;
//                         } else {
//                             currentValue = dataDto.currentValue as DirectCostsCurrentValueCalculation;
//                         }
//                         console.log(validateSync(dataDto))
//                         let cc = await validate("DirectCostsItemDto", value);
//                         console.log(cc);
//                         cc = await validate(dataDto);
//                         console.log(cc);
//                         const validationErrors = [];
//                         // validationErrors.push(...validateSync(dataDto));
//                         // validationErrors.push(...validateSync(currentValue));
//                         return validationErrors.length === 0;
//                     }

//                     if (itemDto.budgetCategoryType === BudgetCategory.REVENUE) {
//                         const dataDto = value as RevenueItemDto;
//                         let cc = await validate(dataDto);
//                         console.log(cc);
//                         const validationErrors = validateSync(dataDto);
//                         return validationErrors.length === 0;
//                     }

//                     if (
//                         [BudgetCategory.OPERATING_EXPENSES, BudgetCategory.PERSONNEL_COSTS].includes(
//                             itemDto.budgetCategoryType,
//                         )
//                     ) {
//                         const dataDto = value as OtherItemsDto;
//                         let cc = await validate(dataDto);
//                         console.log(cc);
//                         const validationErrors = validateSync(dataDto);
//                         return validationErrors.length === 0;
//                     }

//                     // Unknown type, validation fails
//                     return false;
//                 },
//             },
//         });
//     };
// }
