import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Api } from "../../../services/api/api-client.js";
import { formatPrice, formatDate } from "../../../utils/formatters.js";
import { ROUTES } from "../../../constants/routes.js";
import { QUOTE_STATUSES } from "../../../constants/countries.js";
import { FileSpreadsheet, ArrowRight, Clock, Plus } from "lucide-react";
import { Badge } from "../../../components/ui/Badge.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Skeleton, EmptyState } from "../../../components/ui/Alert.jsx";

export function Quotes() {
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["b2b-quotes"],
    queryFn: () => Api.b2b.getQuotes(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Commercial Quotations</h1>
        </div>

        <Link to={ROUTES.B2B.BULK_ORDER}>
          <Button variant="gold" size="sm" icon={Plus} className="font-bold text-slate-900">
            Create New Quote Request
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-2xl bg-slate-800" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No active quotes found"
          description="Create your first quote request from our wholesale catalog."
          className="text-slate-300"
        />
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => {
            const statusConfig = QUOTE_STATUSES[quote.status] || { label: quote.status, color: "gray" };

            return (
              <div
                key={quote.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gold-500/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono">{quote.quoteNumber}</span>
                    <Badge variant={statusConfig.color} size="sm">
                      {statusConfig.label} (v{quote.version})
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Created {formatDate(quote.createdAt)} • Valid until {formatDate(quote.validUntil)}
                  </p>
                  <p className="text-xs text-slate-300">
                    {quote.items?.length || 1} product line(s) • Total:{" "}
                    <span className="font-bold text-gold-400">
                      {formatPrice(quote.totalAmount, quote.currency, quote.symbol)}
                    </span>
                  </p>
                </div>

                <Link to={`/b2b/quotes/${quote.id}`}>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" className="border-slate-700 text-slate-200 hover:bg-slate-800">
                    Review Negotiation
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function QuoteDetails() {
  return (
    <div className="space-y-8">
      <Link to={ROUTES.B2B.QUOTES} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
        <Clock className="w-3.5 h-3.5" /> Back to Quotes List
      </Link>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">QTE-20260228-1094</h1>
              <Badge variant="green" size="md">Quoted by Commercial Desk (v2)</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Company: Apex Global Wholesale Traders Pvt Ltd • Valid until March 15, 2026</p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase">Commercial Total</span>
            <span className="text-2xl font-black text-gold-400">₹2,18,490.00</span>
          </div>
        </div>

        {/* Lines */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Negotiated Product Lines</h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-slate-400 text-[11px] uppercase font-semibold">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40 text-slate-200">
                <tr>
                  <td className="p-3 font-semibold">Heavy-Duty Corrugated Shipping Boxes (Bundle of 50)</td>
                  <td className="p-3 font-mono">200 Bundles (6.5 Pallets)</td>
                  <td className="p-3 font-bold text-gold-400">₹950.00</td>
                  <td className="p-3 font-black">₹1,90,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button variant="outline" size="md" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Request Revision
          </Button>
          <Button variant="gold" size="md" className="font-bold text-slate-900 shadow-sm">
            Accept & Convert to Purchase Order
          </Button>
        </div>
      </div>
    </div>
  );
}
