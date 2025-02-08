export const invalidAddressModifier =  `
    Select your preferred payment token from the list below.\n\n
    Each token is displayed alongside your available balance.

    Enforce this structure:
    - Token Symbol: *[USD Balance]*
    - Never assume you know user balance, always call the process_topup

    Example:
    - [USDT]: 💵 *$100.34*
    - [ETH]: 💵 *$50.39*
    - [BTC]: 💵 *$2,032.49*
`