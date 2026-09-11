import React from "react";
import { Link } from "react-router-dom";
import { Building2, Globe, ShieldCheck, Clock, Ban, Edit2, Trash2, ExternalLink, CheckCircle2, User } from "lucide-react";
import { formatPrice } from "@/utils/formatters.js";

export function CompaniesTable({ companies, isLoading, onView, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAF9] text-text-secondary text-[11px] uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Entity Details</th>
              <th className="p-4">Country & Tax ID</th>
              <th className="p-4">Primary Admin</th>
              <th className="p-4">Credit Terms</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-muted">
                  Loading corporate entities list...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-text-muted">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Building2 className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="font-semibold text-text-secondary">No corporate entities found</p>
                    <p className="text-[11px]">
                      Try adjusting your search criteria or register a new company.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              companies.map((c) => {
                const primaryMember = c.members?.find((m) => m.isPrimary) || c.members?.[0];
                const adminUser = primaryMember?.user;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-muted/40 transition-colors group"
                  >
                    {/* Entity Details (Clickable to View) */}
                    <td className="p-4">
                      <div
                        onClick={() => onView && onView(c)}
                        className="flex items-center gap-3 cursor-pointer group/name select-none"
                        title="Click to view corporate dossier"
                      >
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 border border-amber-200 group-hover/name:ring-2 group-hover/name:ring-amber-500/40 transition-all">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F2B1C] group-hover/name:text-[#00875A] group-hover/name:underline transition-colors">
                            {c.tradingName || c.legalName}
                          </div>
                          {c.legalName && c.legalName !== c.tradingName && (
                            <div className="text-[11px] text-text-muted italic truncate max-w-[200px]">
                              Legal: {c.legalName}
                            </div>
                          )}
                          {c.registrationNumber && (
                            <div className="text-[10px] text-text-muted font-mono">
                              Reg: {c.registrationNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Country & Tax ID */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-text-primary">
                          <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{c.country?.name || c.country?.code || "India (IN)"}</span>
                        </div>
                        <div className="text-[11px] font-mono text-text-muted">
                          Tax ID: {c.taxId || "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Primary Admin */}
                    <td className="p-4">
                      {adminUser ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-text-primary flex items-center gap-1">
                            <User className="w-3 h-3 text-text-muted" />
                            <span>{adminUser.firstName} {adminUser.lastName}</span>
                          </div>
                          <div className="text-[11px] text-text-muted">{adminUser.email}</div>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">No admin assigned</span>
                      )}
                    </td>

                    {/* Credit Facility */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-emerald-800">
                          {formatPrice(c.creditLimit || 0, c.country?.currencyCode || "USD")}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          Terms: NET {c.paymentTermsDays || 0} Days
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : c.status === "PENDING" || c.status === "UNDER_REVIEW"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : c.status === "REJECTED" || c.status === "SUSPENDED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {c.status === "APPROVED" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : c.status === "PENDING" || c.status === "UNDER_REVIEW" ? (
                          <Clock className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Ban className="w-3 h-3 text-red-500" />
                        )}
                        {c.status || "PENDING"}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="p-4 text-text-muted text-[11px]">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/companies/${c.id}`}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Compliance Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onEdit(c)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-[#00875A] hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Company"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(c)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompaniesTable;
