import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCountryStore } from "../../../stores/country.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { formatPrice } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { Boxes, Plus, Trash2, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function BulkOrder() {
  const { country } = useCountryStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [rows, setRows] = useState([
    {
      id: "prod-1",
      name: "Royal Heritage Aged Basmati Rice (25 KG Sack)",
      sku: "FMCG-RICE-25KG",
      packaging: "25 KG Poly Sack",
      quantity: 100, // Tier 3
      unitPrice: 1750,
      moq: 20,
    },
    {
      id: "prod-2",
      name: "Heavy-Duty Corrugated Shipping Boxes (Bundle of 50)",
      sku: "PKG-BOX-50PK",
      packaging: "Bundle (50 pcs)",
      quantity: 80, // Tier 3
      unitPrice: 950,
      moq: 10,
    },
  ]);

  const handleQuantityChange = (index, qty) => {
    const newRows = [...rows];
    newRows[index].quantity = Math.max(1, qty);
    setRows(newRows);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const totalSubtotal = rows.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);

  const handleSubmitQuote = () => {
    addToast({
      title: "Bulk Order Quote Requested",
      message: `Your quote inquiry for ${rows.length} product lines has been submitted.`,
      type: "success",
    });
    navigate(ROUTES.B2B.QUOTES);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bulk Order Spreadsheet Interface</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to={ROUTES.B2B.CATALOG}>
            <Button variant="outline" size="sm" icon={Plus} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Add Products from Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-700">
              <tr>
                <th className="p-4">Product Line</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Packaging</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Tier Unit Price</th>
                <th className="p-4">Line Subtotal</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/40">
              {rows.map((row, idx) => {
                const isMoqMet = row.quantity >= row.moq;
                const lineTotal = row.unitPrice * row.quantity;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white max-w-xs">{row.name}</td>
                    <td className="p-4 font-mono text-slate-400">{row.sku}</td>
                    <td className="p-4 text-slate-300">{row.packaging}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 0)}
                          className="w-20 p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white font-bold text-center focus:border-gold-500 focus:outline-none"
                        />
                        {!isMoqMet && (
                          <span className="text-[10px] text-red-400 font-semibold">
                            MOQ: {row.moq}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gold-400">
                      {formatPrice(row.unitPrice, country.currency, country.symbol)}
                    </td>
                    <td className="p-4 font-black text-white">
                      {formatPrice(lineTotal, country.currency, country.symbol)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Total Lines: <strong className="text-white">{rows.length}</strong></span> •{" "}
            <span>Total Units: <strong className="text-white">{rows.reduce((sum, r) => sum + r.quantity, 0)}</strong></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block uppercase">Wholesale Subtotal</span>
              <span className="text-xl font-black text-gold-400">
                {formatPrice(totalSubtotal, country.currency, country.symbol)}
              </span>
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={handleSubmitQuote}
              className="font-bold text-slate-900 shadow-sm"
              icon={FileSpreadsheet}
            >
              Submit for Quote Approval
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
