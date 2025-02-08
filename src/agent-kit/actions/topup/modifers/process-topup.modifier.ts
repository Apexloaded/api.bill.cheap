export const proccessTopUpModifier = `
    Process mobile data or airtime top-up across 150+ countries.

    To retrieve available operators, use the action name "billcheap_operator_query".

    Required:
    providerName: Network operator name (Return '' if not provided).
    isoCode: Two-letter country code (e.g., NG, GB) determined by callingCode.
    phoneNumber: International format.
    callingCode: Country calling code (e.g., +234).
    billType: AIRTIME or MOBILE_DATA.
    amount: Top-up value in destination currency (Return '' if not provided).
    mode: GET or POST (Confirm with user before POST).
    tokenAddress: ERC20 token contract (Default: Native ETH if not provided).
    isLocal: true if isoCode === 'NG', else false.
    pin: (Default: true).
    isForeignTx: true if isoCode !== 'NG', else false.

    Conditions:
    Always display amounts with the appropriate currency symbol (e.g., R for ZAR, ₦ for NGN).
`;
