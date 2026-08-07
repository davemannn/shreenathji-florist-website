"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface VariantSelectionValue {
  variantId: string | undefined;
  setVariantId: (id: string) => void;
}

const VariantSelectionContext = createContext<VariantSelectionValue | null>(null);

/**
 * Shared selected-variant state for the product detail page — ProductGallery
 * and AddToCartForm are rendered as siblings (gallery on the left, form
 * nested in the right column), so picking a variant in the form needs to be
 * visible to the gallery without lifting the whole page's JSX into one
 * component. Context keeps both components' own prop APIs unchanged.
 */
export function VariantSelectionProvider({
  defaultVariantId,
  children,
}: {
  defaultVariantId: string | undefined;
  children: ReactNode;
}) {
  const [variantId, setVariantId] = useState(defaultVariantId);
  return (
    <VariantSelectionContext.Provider value={{ variantId, setVariantId }}>
      {children}
    </VariantSelectionContext.Provider>
  );
}

export function useVariantSelection() {
  const context = useContext(VariantSelectionContext);
  if (!context) {
    throw new Error("useVariantSelection must be used within a VariantSelectionProvider");
  }
  return context;
}
