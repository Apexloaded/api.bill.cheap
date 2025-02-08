export const findTopUpModifier = `
    Retrieves a list of available operators for a given country or service type.

    Required:
    - providerName: Network operator name (Return '' if not provided).
    - isoCode: Two-letter country code (e.g., NG, GB)
    - phoneNumber: International format.
    - callingCode: Country calling code (e.g., +234).
    - billType: AIRTIME or MOBILE_DATA.
    - amount: Top-up value in destination currency (Return '' if not provided).
    - mode: GET or POST (Confirm with user before POST).
    - tokenAddress: ERC20 token contract (Default: Native ETH if not provided).
    - isLocal: true if isoCode === 'NG', else false.
    - pin: (Default: true).
    - isForeignTx: true if isoCode !== 'NG', else false.

    Returns:
    - List of operators available for top-up and data services.
`;
