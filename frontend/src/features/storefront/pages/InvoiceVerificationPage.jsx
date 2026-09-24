import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "@/services/api/axios.js";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Building, Calendar, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";

export function InvoiceVerificationPage() {
  const { invoiceNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceNumber) return;
    setLoading(true);
    setError(null);

    apiClient
      .get(`/invoices/verify/${encodeURIComponent(invoiceNumber)}`)
      .then((res) => {
        const payload = res.data?.data || res.data || res;
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Invoice could not be verified or does not exist.");
        setLoading(false);
      });
  }, [invoiceNumber]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-emerald-800 hover:text-emerald-700">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Link>
          <span className="text-xs text-slate-500 font-mono tracking-wider">OFFICIAL AUDIT GATEWAY</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h1 className="text-xl font-bold tracking-tight text-white">Invoice Authentication</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">Cryptographic & Financial Integrity Audit</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              Live Verified
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {loading && (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-600 font-medium">Verifying invoice against ledger snapshot...</p>
              </div>
            )}

            {error && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Verification Failed</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
                <div className="mt-6">
                  <Button variant="outline" onClick={() => window.location.reload()}>Retry Verification</Button>
                </div>
              </div>
            )}

            {!loading && !error && data && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-900">Genuine Invoice Verified</h4>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      This official tax invoice is authentic and accurately reflects the financial order snapshot recorded at issuance.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase">Invoice Number</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block font-mono">{data.invoiceNumber}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase">Order Reference</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block font-mono">{data.orderNumber || "Direct Reference"}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase">Total Amount</span>
                    <span className="text-lg font-bold text-emerald-800 mt-1 block">
                      {formatPrice(data.totalAmount, data.currency || "USD")}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase">Payment Status</span>
                    <span className="text-sm font-semibold text-slate-900 mt-1 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-md">
                      {data.paymentStatus}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase">Issued Date</span>
                    <span className="text-sm font-semibold text-slate-900 mt-1 block">
                      {formatDate(data.invoiceDate)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-medium text-slate-400 block uppercase">Issuing Legal Entity</span>
                    <span className="text-sm font-semibold text-slate-900 mt-1 block truncate">
                      {data.issuingCompany || data.brandName}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Audit Timestamp: {formatDate(data.auditTimestamp, "MMM d, yyyy • h:mm a")}</span>
                  <span className="font-mono text-emerald-800">Status: {data.invoiceStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
