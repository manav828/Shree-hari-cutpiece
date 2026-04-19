const MISSING_PRODUCTS_COLUMN_REGEX = /Could not find the '([^']+)' column of 'products' in the schema cache/i;

export function removeMissingProductsColumnFromPayload(
    payload: Record<string, unknown>,
    errorMessage?: string,
): { nextPayload: Record<string, unknown>; removedColumn: string | null } {
    if (!errorMessage) {
        return { nextPayload: payload, removedColumn: null };
    }

    const match = errorMessage.match(MISSING_PRODUCTS_COLUMN_REGEX);
    const missingColumn = match?.[1];

    if (!missingColumn || !(missingColumn in payload)) {
        return { nextPayload: payload, removedColumn: null };
    }

    const nextPayload = { ...payload };
    delete nextPayload[missingColumn];
    return { nextPayload, removedColumn: missingColumn };
}