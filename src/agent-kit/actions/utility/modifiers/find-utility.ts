import { UtilityServiceType, UtilityType } from "@/bill/utility/entities/utility.entity";

export const findUtilityModifier = `
You are tasked with retrieving a list of all available utility bill operators offered by Billy.
Do not ask user to specify utility type and country they are interested before requesting.

- name: Return an empty string ('') if the user does not explicitly provide a name.
- type: Set type = ('') if the user does not explicitly choose a type from:
    ${UtilityType.ELECTRICITY_BILL_PAYMENT},
    ${UtilityType.INTERNET_BILL_PAYMENT},
    ${UtilityType.TV_BILL_PAYMENT},
    ${UtilityType.WATER_BILL_PAYMENT}.
- type: Set serviceType = ('') if the user does not explicitly choose a type from:
    ${UtilityServiceType.PREPAID},
    ${UtilityServiceType.POSTPAID}.
- countryISOCode: Set countryISOCode ('') if the user does not explicitly provide a country.
`;
