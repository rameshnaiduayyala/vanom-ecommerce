import React from "react";
import { Link } from "react-router-dom";
import { Boxes, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Skeleton, EmptyState } from "@/components/ui/Alert.jsx";
import { formatPrice } from "@/utils/formatters.js";
import { resolveProductImageUrl, FALLBACK_PRODUCT_IMAGE } from "@/utils/image.js";
import { ROUTES } from "@/constants/routes.js";

function getProductWholesaleSummary(product, targetCountryCode) {
  const code = (targetCountryCode || "US").toUpperCase();
  const variants = Array.isArray(product?.variants)
    ? product.variants.filter((v) => v.isActive !== false)
    : [];

  const candidatePrices = [];
  const collectFromCountryPrices = (cpList) => {
    if (!Array.isArray(cpList) || cpList.length === 0) return null;
    const match = cpList.find((cp) => cp.countryCode?.toUpperCase() === code) || cpList[0];
    if (!match) return null;
    const tiers = match.tiers || [];
    if (tiers.length > 0) {
      tiers.forEach((t) => {
        const val = Number(t.price);
        if (!Number.isNaN(val) && val > 0) candidatePrices.push(val);
      });
    } else if (match.unitPrice !== undefined && Number(match.unitPrice) > 0) {
      candidatePrices.push(Number(match.unitPrice));
    }
    return match;
  };

  let primaryCp = null;
  if (variants.length > 0) {
    variants.forEach((v) => {
      const cp = collectFromCountryPrices(v.countryPrices);
      if (!primaryCp && cp) primaryCp = cp;
    });
  }
  if (!primaryCp) {
    primaryCp = collectFromCountryPrices(product?.countryPrices);
  }

  const lowestPrice =
    candidatePrices.length > 0
      ? Math.min(...candidatePrices)
      : product?.basePriceUSD > 0
      ? Number(product.basePriceUSD)
      : null;

  const moq =
    primaryCp?.moq ||
    product?.minOrderQuantity ||
    product?.moq ||
    variants.find((v) => v.minOrderQuantity || v.moq)?.minOrderQuantity ||
    variants.find((v) => v.minOrderQuantity || v.moq)?.moq ||
    null;

  return {
    lowestPrice,
    currencyCode: primaryCp?.currencyCode,
    moq,
    variantCount: variants.length,
  };
}

/**
 * Reusable wholesale commodities spotlight card for the B2B dashboard.
 */
export function B2BFeaturedProductsCard({
  products = [],
  isLoading = false,
  country = {},
}) {
  const targetCountryCode = (country?.code || "US").toUpperCase();

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Wholesale Commodities & Fast Reorder
          </h2>
        </div>
        <Link
          to={ROUTES.B2B.CATALOG}
          className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
        >
          Browse All Commodities <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No wholesale commodities cataloged"
          description="Active bulk catalog items will appear here once published."
          className="py-8 bg-slate-50 border border-slate-100 rounded-xl"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {products.map((product) => {
            const { lowestPrice, currencyCode, moq, variantCount } = getProductWholesaleSummary(
              product,
              targetCountryCode
            );
            const imgUrl = resolveProductImageUrl(product);
            const effectiveCurrency = currencyCode || country?.currency || "USD";
            const effectiveSymbol =
              effectiveCurrency === country?.currency ? country?.symbol : undefined;

            return (
              <div
                key={product.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-600/40 hover:shadow-xs transition-all flex items-start gap-3.5"
              >
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono flex-wrap">
                    {moq ? <span>MOQ: {moq}</span> : null}
                    {variantCount > 0 ? (
                      <>
                        {moq ? <span>•</span> : null}
                        <span>{variantCount} packs</span>
                      </>
                    ) : null}
                    {product.brand ? (
                      <>
                        {(moq || variantCount > 0) ? <span>•</span> : null}
                        <span className="truncate text-slate-700">{product.brand}</span>
                      </>
                    ) : null}
                  </p>
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <span className="text-xs font-black text-emerald-800 font-mono truncate">
                      {lowestPrice !== null
                        ? `From ${formatPrice(lowestPrice, effectiveCurrency, effectiveSymbol)}`
                        : "Request Quote"}
                    </span>
                    <Link to={`${ROUTES.B2B.CATALOG}/${product.slug || product.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[10px] py-1 px-2.5 h-auto font-bold shrink-0"
                      >
                        Configure
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
