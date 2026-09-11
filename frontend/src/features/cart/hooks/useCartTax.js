import { useState, useEffect, useMemo } from "react";
import { Api } from "../../../services/api/api-client.js";

// Fallback rates when API is unavailable
const FALLBACK_RATES = {
  US: { rate: 0.0882, taxType: "SALES_TAX" },
  CA: { rate: 0.13,   taxType: "HST/GST"   },
};

export function useCartTax({ selectedCartItems, selectedSubtotal, destination }) {
  const [taxData, setTaxData]               = useState(null);
  const [isCalculatingTax, setIsCalculating] = useState(false);

  useEffect(() => {
    if (selectedCartItems.length === 0 || selectedSubtotal <= 0) {
      setTaxData(null);
      return;
    }

    let isMounted = true;

    const run = async () => {
      setIsCalculating(true);
      try {
        const payload = {
          countryCode: destination.countryCode || "US",
          regionCode:  destination.regionCode  || undefined,
          postalCode:  destination.postalCode  || undefined,
          items: selectedCartItems.map((item) => {
            const unitPrice = Number(item.price || item.unitPrice || 0);
            return {
              productId: item.productId || item.id,
              variantId: item.variantId || null,
              unitPrice,
              quantity: item.quantity,
              subtotal: unitPrice * item.quantity,
            };
          }),
        };

        const res  = await Api.tax.calculateTax(payload);
        const data = res?.data || res;

        if (isMounted && data && (data.totalTax !== undefined || data.effectiveRate !== undefined)) {
          setTaxData(data);
        }
      } catch {
        if (!isMounted) return;
        // Graceful fallback
        const cc      = destination.countryCode || "US";
        const fb      = FALLBACK_RATES[cc] || FALLBACK_RATES.US;
        const totalTax = Number((selectedSubtotal * fb.rate).toFixed(2));
        setTaxData({
          provider:      "FALLBACK_ENGINE",
          jurisdiction:  destination.regionCode || cc,
          taxType:       fb.taxType,
          effectiveRate: fb.rate,
          totalTax,
        });
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    };

    const timer = setTimeout(run, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    destination.countryCode,
    destination.regionCode,
    destination.postalCode,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectedCartItems,
    selectedSubtotal,
  ]);

  const estimatedTax = useMemo(
    () => (taxData?.totalTax ? Number(taxData.totalTax) : 0),
    [taxData]
  );

  return { taxData, isCalculatingTax, estimatedTax };
}
