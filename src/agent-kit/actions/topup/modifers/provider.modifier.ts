export const providerModifier = `
Task: Display telecom service provider pricing information strictly following these guidelines. Do not include "Local Provider" or "Foreign Provider" labels in the user-facing output.

Provider Classification:
1. A provider is classified as:
   - "Local" if \`destinationCurrencyCode\` is "NGN".
   - "Foreign" if \`destinationCurrencyCode\` is anything else (e.g., "ZAR", "USD", "GBP").

Pricing Data Display Rules:
2. Always use the provider’s \`destinationCurrencyCode\` and \`destinationCurrencySymbol\` for all price displays. Never use \`senderCurrencyCode\` or \`senderCurrencySymbol\`.
3. For providers where \`destinationCurrencyCode = "NGN"\`:
   - Use these attributes for pricing:
     - \`minAmount\`
     - \`maxAmount\`
     - \`fixedAmounts\`
     - \`fixedAmountsDescriptions\`
     - \`suggestedAmounts\`
     - \`suggestedAmountsMap\`
   - These values are already in NGN. Do not attempt conversions.

4. For providers where \`destinationCurrencyCode ≠ "NGN"\`:
   - Strictly use only these attributes:
     - \`localMinAmount\`
     - \`localMaxAmount\`
     - \`localFixedAmounts\`
     - \`localFixedAmountsDescriptions\`
   - Never use: \`minAmount\`, \`maxAmount\`, \`fixedAmounts\`, \`fixedAmountsDescriptions\`, \`suggestedAmounts\`, or \`suggestedAmountsMap\` for these providers.

Price Formatting:
5. Always format numerical values with **comma separators for thousands**:
   - Example: 
     - 1000 → "1,000"
     - 1000000 → "1,000,000"
6. Always format prices as:
   "\${destinationCurrencySymbol}\${Amount} \${destinationCurrencyCode}"
   - Example:
     - "💰 *R1,000 ZAR*"
     - "💰 *₦5,000 NGN*"
     - "💰 *$10,500 USD*"

List Display Format:
7. For list displays:
   - Use \`fixedAmounts\` + \`fixedAmountsDescriptions\` if \`destinationCurrencyCode\` is "NGN".
   - Use \`localFixedAmounts\` + \`localFixedAmountsDescriptions\` otherwise.
   - Format: "\${Price} - \${Description}"
     - Example:
       - "💰 *R50 ZAR* - 1GB Data Bundle"
       - "💰 *₦1,000 NGN* - 2GB Monthly Plan"

Additional Strict Rules:
8. Group and label different pricing types (e.g., "Fixed Amounts", "Suggested Amounts").
9. If a required attribute is null or empty, display "Not Available" or omit it if not applicable.
10. Ensure all numerical values are formatted to two decimal places where necessary.
11. Do not display "Local Provider" or "Foreign Provider" labels in user-facing output.
12. No assumptions or modifications outside these rules are allowed.
13. All foreign currency values must be displayed exactly as provided—no conversions.

Failure to follow these rules strictly will lead to incorrect data representation. The agent must ensure full compliance.
`;