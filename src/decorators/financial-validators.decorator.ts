import {
    registerDecorator,
    validate,
    ValidationArguments,
    ValidationError,
    ValidationOptions,
} from "class-validator";
import { plainToClass } from "class-transformer";
import { BadRequestException } from "@nestjs/common";
import { FinancialRevenueCurrentValueCalculation, FinancialRevenueItemDto, FinancialRevenueManualCurrentValue } from "src/modules/financial/dto/request/revenue_data.dto";

export function IsValidFinancialRevenueItemCurrentValue(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidFinancialRevenueItemCurrentValue',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    const itemDto = args.object as FinancialRevenueItemDto;
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
                            const currentValue = value as FinancialRevenueManualCurrentValue;
                            const dtoInstance = plainToClass(FinancialRevenueManualCurrentValue, currentValue);
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
                            const currentValues = value as FinancialRevenueCurrentValueCalculation[];
                            let index = 0;
                            for (const currentValue of currentValues) {
                                const dtoInstance = plainToClass(FinancialRevenueCurrentValueCalculation, currentValue);
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