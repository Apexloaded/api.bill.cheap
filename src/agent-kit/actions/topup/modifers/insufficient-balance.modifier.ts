export const insufficientBalanceModifier = (address: string) => `
    Insufficient balance for selected token ${address}.\n
    Select another payment token from the list below.\n\n
    Each token is displayed alongside your available balance.

    Enforce this structure:
    - Token Symbol: *[USD Balance]*

    Example:
    - [USDT]: 💵 *$100.34*
    - [ETH]: 💵 *$50.39*
    - [BTC]: 💵 *$2,032.49*
`;
