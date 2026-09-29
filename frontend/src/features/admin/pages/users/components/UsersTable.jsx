import React from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Globe,
  ShieldAlert,
} from "lucide-react";

export function UsersTable({ users, isLoading, onView, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAF9] text-text-secondary text-[11px] uppercase font-bold tracking-wider border-b border-border">
            <tr>
              <th className="p-4">User Details</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Account Type</th>
              <th className="p-4">Country</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Registered</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-text-muted">
                  Loading users list...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-12 text-center text-text-muted">
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
                const isSuperAdmin = u.role === "SUPERADMIN";
                const isB2B = Boolean(u.bulkBusiness);
                const isActive = u.isActive ?? true;
                const companyName = u.bulkBusiness?.businessName || u.bulkBusiness?.companyName || u.company?.legalName || u.company?.tradingName;
                const phone = u.phone || u.bulkBusiness?.businessPhone;
                const countryDisplay = u.country?.name || u.country?.code || u.bulkBusiness?.countryCode || "—";
                const ordersCount = u._count?.orders ?? 0;

                const displayName =
                  u.firstName || u.lastName
                    ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                    : u.email?.split("@")[0] || "User";

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-muted/40 transition-colors group"
                  >
                    {/* Name & Avatar (Clickable to View) */}
                    <td className="p-4">
                      <div
                        onClick={() => onView && onView(u)}
                        className="flex items-center gap-3 cursor-pointer group/name select-none"
                        title="Click to view user dossier"
                      >
                        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 border transition-all ${
                          isSuperAdmin
                            ? "bg-purple-100 text-purple-800 border-purple-200 group-hover/name:ring-2 group-hover/name:ring-purple-400"
                            : isB2B
                            ? "bg-amber-100 text-amber-800 border-amber-200 group-hover/name:ring-2 group-hover/name:ring-amber-400"
                            : "bg-emerald-100 text-[#00875A] border-emerald-200 group-hover/name:ring-2 group-hover/name:ring-[#00875A]/40"
                        }`}>
                          {(displayName[0] || "U").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#0F2B1C] group-hover/name:text-[#00875A] group-hover/name:underline transition-colors flex items-center gap-1.5">
                            <span>{displayName}</span>
                            {isSuperAdmin && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                                ROOT
                              </span>
                            )}
                          </div>
                          {companyName && (
                            <div className="text-[11px] text-[#5E7D67] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-amber-700 shrink-0" />
                              <span className="font-semibold truncate max-w-[180px]">
                                {companyName}
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
                          <span className="truncate max-w-[200px]" title={u.email}>{u.email}</span>
                        </div>
                        {phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Account Type */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isB2B
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {isB2B ? (
                          <>
                            <Building2 className="w-3 h-3 text-amber-600" />
                            <span>B2B Wholesale</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-blue-600" />
                            <span>Retail Customer</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-text-secondary font-medium">
                        <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span>{countryDisplay}</span>
                        {u.country?.currency && (
                          <span className="text-[10px] text-text-muted font-mono">
                            ({u.country.currency.code})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Role Badges */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isSuperAdmin
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : u.role === "B2B_USER"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {u.role || "USER"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-500" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>

                    {/* Orders Count */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <ShoppingBag className="w-3.5 h-3.5 text-text-muted" />
                        <span className="font-bold text-text-primary">{ordersCount}</span>
                      </div>
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
                        {isSuperAdmin ? (
                          <span
                            className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed inline-flex items-center justify-center"
                            title="Superadmin account cannot be deleted"
                          >
                            <Trash2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <button
                            onClick={() => onDelete(u)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
