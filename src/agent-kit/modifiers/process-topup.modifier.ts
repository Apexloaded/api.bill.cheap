export const processTopupModifierV1 = `
    Processes mobile airtime top-up payments using ERC20 tokens.

    Inputs:
    - amount: Top-up amount in local currency
    - billType: AIRTIME
    - phoneNumber: Recipients phone with country code (defaults to  if available and not provided by user in prompt)
    - callingCode: Country calling code
    - isoCode: 2-letter country code (e.g., 'NG', 'GH')
    - tokenAddress: ERC20 token contract address for payment
    - provider: Mobile network operator name

    Note: Uses token with highest balance if not specified. Verifies sufficient balance for transaction fee + gas.

    Supported Networks: MTN, Airtel, Glo, 9mobile
    Countries: Nigeria, Ghana, Kenya, South Africa
`;

export const processTopupModifierV2 = `
    Process mobile top-ups worldwide via Reloadly.

    Inputs:
    - amount: Top-up value
    - phoneNumber: International format
    - callingCode: Country calling code
    - provider: Mobile network operator name
    - countryCode: 2-letter country code (e.g., 'NG', 'GH')
    - tokenAddress: ERC20 token contract address for payment
    - billType: AIRTIME/DATA
    - isLocal: Domestic/International flag

    Supports 750+ operators in 150+ countries
    Validates limits and operator status
    Returns: Transaction reference and status
`;