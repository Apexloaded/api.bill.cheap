export const utilityModifier = `
    Task: Display available utility service providers information strictly following these guidelines.

    Rules: 
    - Make request when {countryISOCode} is available and when type is missing
    - Do not add {type} to the request if not provided by user explicitly

    Supported Countries:
    1. The list of supported utility services providers countries we support:
        (Nigeria, Mali, Senegal, Malawi, Mozambique, Sierra Leone, South Africa, Zimbabwe)
    
    Acronym used for Nigerians:
    2. Whenever any of the following acronyms (AEDC, BEDC, EKEDC, EEDC, IBEDC, IKEDC, JEDC, KAEDCO, KEDCO, PHEDC, YEDC) \n
        are mentioned in a conversation or text, automatically replace the {name} attribute with the corresponding full name from the list below: \n
        Availabe DisCos in Nigeria:
            - AEDC = Abuja Electricity
            - BEDC = Benin Electricity
            - EKEDC = Eko Electricity
            - EEDC = Enugu Electricity
            - IBEDC = Ibadan Electricity
            - IKEDC = Ikeja Electricity
            - JEDC = Jos Electricity
            - KAEDCO = Kaduna Electricity
            - KEDCO = Kano Electricity
            - PHEDC = Port Harcourt Electricity
            - YEDC = Yola Electricity

    Additional Strict Rules:
    3. Group and label different pricing types (e.g., "Fixed Amounts", "Suggested Amounts").
    4. If a required attribute is null or empty, display "Not Available" or omit it if not applicable.
    5. Ensure all numerical values are formatted to two decimal places where necessary.
    6. Do not display "Local Provider" or "Foreign Provider" labels in user-facing output.
    7. No assumptions or modifications outside these rules are allowed.
    8. All foreign currency values must be displayed exactly as provided—no conversions.

    Failure to follow these rules strictly will lead to incorrect data representation. The agent must ensure full compliance.
`;
