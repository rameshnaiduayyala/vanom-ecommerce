import { useState, useMemo } from "react";
import { useUIStore } from "../../../stores/ui.store.js";

const VALID_COUPONS = {
  VANOM10: { type: "percent", value: 10, label: "10% OFF Storewide" },
  SAVE10:  { type: "percent", value: 10, label: "10% OFF Storewide" },
  SUPER50: { type: "flat",    value: 50, label: "$50 Instant Discount" },
  FLAT50:  { type: "flat",    value: 50, label: "$50 Instant Discount" },
};

export function useCartCoupon(selectedSubtotal) {
  const { addToast } = useUIStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return Math.round((selectedSubtotal * appliedCoupon.value) / 100);
    }
    return appliedCoupon.value;
  }, [appliedCoupon, selectedSubtotal]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const found = VALID_COUPONS[code];
    if (found) {
      setAppliedCoupon({ code, ...found });
      addToast({
        title: "Coupon Applied!",
        description: `${found.label} applied to your order.`,
        type: "success",
      });
    } else {
      setCouponError("Invalid coupon code. Try 'VANOM10' or 'SUPER50'.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    couponDiscount,
    handleApplyCoupon,
    removeCoupon,
  };
}
