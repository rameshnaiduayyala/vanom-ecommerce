import React from "react";
import { ProductCard } from "../ProductCard.jsx";

/**
 * Compact Product Card variant for high-density home & slider grids.
 * Reuses the refactored core ProductCard with variant="compact".
 */
export function ProductCardCompact(props) {
  return <ProductCard variant="compact" {...props} />;
}

export default ProductCardCompact;
