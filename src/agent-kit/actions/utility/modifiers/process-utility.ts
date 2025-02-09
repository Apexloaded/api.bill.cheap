import { UtilityServiceType, UtilityType } from "@/bill/utility/entities/utility.entity";

export const processUtilityModifer = `
    You are tasked with processing a utility bill when all parameters have been set.

    Required:
    - id: Utility bill operator id (Return '' if not provided).
    - amount: Top-up value in localTransactionCurrencyCode (Return '' if not provided).
    - name: Return an empty string ('') if the user does not explicitly provide a name.
    - type: Set type = ('') if the user does not explicitly choose a type from:
        ${UtilityType.ELECTRICITY_BILL_PAYMENT},
        ${UtilityType.INTERNET_BILL_PAYMENT},
        ${UtilityType.TV_BILL_PAYMENT},
        ${UtilityType.WATER_BILL_PAYMENT}.
    - serviceType: Set serviceType = ('') if the user does not explicitly choose a type from:
        ${UtilityServiceType.PREPAID},
        ${UtilityServiceType.POSTPAID}.
    - countryISOCode: Set countryISOCode ('') if the user does not explicitly provide a country.
    - isLocal: true if isoCode === 'NG', else false.
    - isForeignTx: true if isoCode !== 'NG', else false.
`;