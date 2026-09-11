import React from "react";
import { User, Building2, Mail, Phone, Edit2, Trash2, CheckCircle2, Clock, Ban } from "lucide-react";

export function UsersTable({ users, isLoading, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAF9] text-text-secondary text-[11px] uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">User Details</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Customer Type</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-text-muted">
                  Loading users list...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-text-muted">
                  <div className="max-w-xs mx-auto space-y-2">
                    <User className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="font-semibold text-text-secondary">No users found</p>
                    <p className="text-[11px]">
                      Try adjusting your search criteria or add a new user.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const roles = Array.isArray(u.roles) ? u.roles : [u.roles || "CUSTOMER"];
                const isB2B = u.customerType === "B2B" || roles.includes("COMPANY_ADMIN");

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-muted/40 transition-colors group"
                  >
                    {/* Name & Avatar */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#00875A] font-bold flex items-center justify-center shrink-0 border border-emerald-200">
                          {(u.firstName?.[0] || u.email?.[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#0F2B1C]">
                            {u.firstName || u.lastName
                              ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                              : "Unnamed User"}
                          </div>
                          {u.company && (
                            <div className="text-[11px] text-[#5E7D67] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-[#00875A]" />
                              <span className="font-medium truncate max-w-[180px]">
                                {u.company.tradingName || u.company.legalName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-text-primary font-medium">
                          <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Customer Type */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isB2B
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {isB2B ? "B2B Wholesale" : "B2C Retail"}
                      </span>
                    </td>

                    {/* Role Badges */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {roles.map((r, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              r === "SUPER_ADMIN"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : r === "ADMIN"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : r === "COMPANY_ADMIN"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : u.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : u.status === "SUSPENDED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {u.status === "ACTIVE" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : u.status === "PENDING" ? (
                          <Clock className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Ban className="w-3 h-3 text-red-500" />
                        )}
                        {u.status || "ACTIVE"}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="p-4 text-text-muted text-[11px]">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-IN", {
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
                          onClick={() => onEdit(u)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-[#00875A] hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(u)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete User"
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

export default UsersTable;
