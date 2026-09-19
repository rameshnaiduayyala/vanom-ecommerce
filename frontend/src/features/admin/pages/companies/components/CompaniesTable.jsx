import React from "react";
import { Link } from "react-router-dom";
import { Building2, Globe, Clock, Ban, Edit2, Trash2, CheckCircle2, User, Phone, Mail } from "lucide-react";

export function CompaniesTable({ companies, isLoading, onView, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAF9] text-text-secondary text-[11px] uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Business Entity</th>
              <th className="p-4">Contact Info</th>
              <th className="p-4">Country & Tax ID</th>
              <th className="p-4">Linked User / Admin</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-muted">
                  Loading business entities list...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-text-muted">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Building2 className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="font-semibold text-text-secondary">No wholesale businesses found</p>
                    <p className="text-[11px]">
                      Try adjusting your search criteria or register a new business.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              companies.map((c) => {
                const adminUser = c.user;
                const businessName = c.businessName || c.legalName || "Unnamed Business";
                const phone = c.businessPhone || c.phone;
                const email = c.businessEmail || c.email;
                const taxId = c.taxRegistrationNumber || c.taxId;
                const regNo = c.registrationNumber;
                const countryCode = c.countryCode || c.country?.code || "US";

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
                        title="Click to view business dossier"
                      >
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 border border-amber-200 group-hover/name:ring-2 group-hover/name:ring-amber-500/40 transition-all">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#0F2B1C] group-hover/name:text-[#00875A] group-hover/name:underline transition-colors">
                            {businessName}
                          </div>
                          {c.contactPersonName && (
                            <div className="text-[11px] text-text-muted truncate max-w-[200px]">
                              Contact: {c.contactPersonName}
                            </div>
                          )}
                          {regNo && (
                            <div className="text-[10px] text-text-muted font-mono">
                              Reg: {regNo}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {email && (
                          <div className="flex items-center gap-1.5 text-text-primary font-medium">
                            <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                            <span className="truncate max-w-[180px]">{email}</span>
                          </div>
                        )}
                        {phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Country & Tax ID */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-text-primary">
                          <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span className="font-bold">{countryCode}</span>
                        </div>
                        <div className="text-[11px] font-mono text-text-muted">
                          Tax ID: {taxId || "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Linked User / Admin */}
                    <td className="p-4">
                      {adminUser ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-text-primary flex items-center gap-1">
                            <User className="w-3 h-3 text-text-muted" />
                            <span>{adminUser.firstName || adminUser.lastName ? `${adminUser.firstName || ""} ${adminUser.lastName || ""}`.trim() : "Linked User"}</span>
                          </div>
                          <div className="text-[11px] text-text-muted">{adminUser.email}</div>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">Unassigned User</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : c.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {c.status === "APPROVED" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : c.status === "PENDING" ? (
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
                        <button
                          onClick={() => onEdit(c)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-[#00875A] hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Business"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(c)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Business"
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
