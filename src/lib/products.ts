export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  regularPriceCents: number;
  discountLabel: string;
  currency: string;
}

export const PRODUCTS: Record<string, Product> = {
  business_audit: {
    id: "business_audit",
    name: "Business Audit",
    description:
      "A personalized audit of your business, built from your Opportunity Finder answers.",
    priceCents: 5000,
    regularPriceCents: 30000,
    discountLabel: "Founding client rate",
    currency: "USD",
  },
};

export function getProduct(id: string): Product | null {
  return PRODUCTS[id] ?? null;
}
