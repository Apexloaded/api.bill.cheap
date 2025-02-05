export const proccessTopUpModifier = `
    Get all the details you need to process mobile data or airtime topup accross the 150+ countries

    Required:
    - providerName: Network operator name. Return '' if not explicity provided by user
    - isoCode: ISO code (e.g. NG, GH, GB)
    - phoneNumber: International format
    - callingCode: Country calling code
    - billType: AIRTIME/MOBILE_DATA
    - amount: Top-up value. Return '' if not explicity provided by user
    - mode: GET/POST Determine the mode type base on users prompt
    - tokenAddress: ERC20 token contract address for payment use default Native ETH address if not specified by user
    - isLocal: if isoCode is NG then isLocal=true else isLocal=false

    Supports 750+ operators in 150+ countries
    Validates limits and operator status

    Note: Always confirm from user before processing POST requests mode
    `;
