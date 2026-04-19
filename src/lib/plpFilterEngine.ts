export type PlpSortBy = "featured" | "price-low" | "price-high" | "name";

type FilterableProduct = {
    name: string;
    price: number;
    featured?: boolean;
    category?: string | null;
    categorySlug?: string | null;
};

function normalizeValue(value: string | null | undefined): string {
    return (value || "").trim().toLowerCase();
}

export function isAllCategory(selectedCategory: string): boolean {
    return normalizeValue(selectedCategory) === "all";
}

export function applyPlpFiltersAndSort<T extends FilterableProduct>(
    products: T[],
    selectedCategory: string,
    sortBy: PlpSortBy
): T[] {
    const normalizedCategory = normalizeValue(selectedCategory);

    const filtered = isAllCategory(normalizedCategory)
        ? [...products]
        : products.filter((product) => {
            const slugMatch = normalizeValue(product.categorySlug) === normalizedCategory;
            const nameMatch = normalizeValue(product.category) === normalizedCategory;
            return slugMatch || nameMatch;
        });

    switch (sortBy) {
        case "price-low":
            return filtered.sort((a, b) => a.price - b.price);
        case "price-high":
            return filtered.sort((a, b) => b.price - a.price);
        case "name":
            return filtered.sort((a, b) => a.name.localeCompare(b.name));
        case "featured":
        default:
            return filtered.sort((a, b) => {
                const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
                if (featuredDelta !== 0) return featuredDelta;
                return a.name.localeCompare(b.name);
            });
    }
}