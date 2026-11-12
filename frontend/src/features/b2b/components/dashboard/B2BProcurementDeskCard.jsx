import React from "react";
import { Link } from "react-router-dom";
import { Boxes, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { ROUTES } from "@/constants/routes.js";

/**
 * Reusable quick wholesale procurement desk card with live bulk cart indicator.
 */
export function B2BProcurementDeskCard({
  cartItemsCount = 0,
  cartLineItemsCount = 0,
  catalogCount = 0,
}) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#00281C] text-white shadow-md space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Boxes className="w-4 h-4" />
          <span>Commercial Procurement Desk</span>
        </div>
        {cartItemsCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono">
            <ShoppingCart className="w-3 h-3" />
            {cartItemsCount} units ({cartLineItemsCount} SKUs)
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {catalogCount > 0
          ? `Order across ${catalogCount} active wholesale commodities with volume tier pricing and consolidated freight.`
          : "Order wholesale commodities with volume tier pricing and consolidated freight."}
      </p>

      <div className="pt-2 flex flex-col gap-2">
        <Link to={ROUTES.B2B.BULK_ORDER}>
          <Button
            variant="primary"
            size="sm"
            icon={Boxes}
            className="w-full justify-center font-bold bg-emerald-600 hover:bg-emerald-500 border-0"
          >
            {cartItemsCount > 0 ? "Resume Bulk Order Matrix" : "Open Bulk Order Matrix"}
          </Button>
        </Link>
        <Link to={ROUTES.B2B.CATALOG}>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center text-xs font-semibold border-slate-700 text-slate-200 hover:bg-white/10"
          >
            Wholesale Commodities Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
