import { Injectable } from "@nestjs/common";

@Injectable()
export class HelperService {
    removeEmptyKeys(object: any): void {
        Object.keys(object).forEach((key) => (object[key] === undefined ? delete object[key] : {}));
    }

    // UTC milliseconds
    getCurrentTimeInUTC = (): number => {
        return new Date(Date.now() + new Date().getTimezoneOffset() * 60000).getTime();
    }

    // UTC milliseconds
    getCurrentDateInUTCAfterAddingMonths = (months: number): Date => {
        const currentDate = new Date(Date.now() + new Date().getTimezoneOffset() * 60000)
        const d = currentDate.getDate();
        currentDate.setMonth(currentDate.getMonth() + months);
        if (currentDate.getDate() !== d) {
            currentDate.setDate(0);
        }
        return currentDate;
    }

    // UTC milliseconds
    getCurrentDateInUTCAfterAddingOneDay = (): Date => {
        const currentDate = new Date(Date.now() + new Date().getTimezoneOffset() * 60000)
        currentDate.setDate(currentDate.getDate() + 1);
        return currentDate;
    }

    // UTC milliseconds
    getCurrentDateInUTCAfterAddingOneYear = (): Date => {
        const currentDate = new Date(Date.now() + new Date().getTimezoneOffset() * 60000)
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        return currentDate;
    }

    /**
     * returns a custom length random number
     * @param {number} length
     * @returns {number} the random number
     */
    getCustomLengthRandomNumber = (length: number): string => {
        if (length > 10) {
            length = 10;
        }
        let randomNumber = 0;
        for (let i = 0; i < length; i += 1) {
            let randomDigit = Math.floor(Math.random() * 10);
            // prevent first digit from being a zero except when length is one
            while (!i && !randomDigit && length) {
                randomDigit = Math.floor(Math.random() * 10);
            }
            randomNumber = randomNumber * 10 + randomDigit;
        }
        return String(randomNumber);
    };

    getMonthDiff = (startDate: Date, endDate: Date): number => {
        let months = 0;
        months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
        months -= startDate.getMonth();
        months += endDate.getMonth();
        return months <= 0 ? 0 : months;
    }

    getMonthsIntersection = (quarterDate, startDate, endDate): number => {
        // Convert date strings to Date objects
        const quarterStartDate: Date = new Date(quarterDate);
        const quarterEndDate: Date = new Date(quarterStartDate);
        quarterStartDate.setMonth(quarterStartDate.getMonth() - 2); // Adding 3 months for the end of the quarter

        // Set start date to the smallest possible date if null
        const rangeStartDate: Date = startDate ? new Date(startDate) : new Date(-8640000000000000); // Smallest date
        // Set end date to the largest possible date if null
        const rangeEndDate: Date = endDate ? new Date(endDate) : new Date(8640000000000000); // Largest date

        // Check if there is an intersection between the quarter and the range
        const intersectStartDate = new Date(Math.max(quarterStartDate.getTime(), rangeStartDate.getTime()));
        const intersectEndDate = new Date(Math.min(quarterEndDate.getTime(), rangeEndDate.getTime()));

        // Check if there is a valid intersection
        if (intersectStartDate <= intersectEndDate) {
            // Calculate the difference in months
            const monthsDifference = (intersectEndDate.getFullYear() - intersectStartDate.getFullYear()) * 12 +
                (intersectEndDate.getMonth() - intersectStartDate.getMonth() + 1);

            return monthsDifference;
        } else {
            return 0; // No intersection
        }
    }
}
