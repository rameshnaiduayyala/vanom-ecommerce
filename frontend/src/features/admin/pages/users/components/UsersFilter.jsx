import React from "react";
import { Search, Filter, ShieldCheck, Activity } from "lucide-react";

export function UsersFilter({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="relative w-full md:w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, company, or country..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-surface-muted/50 border border-border rounded-xl text-text-primary focus:bg-white focus:outline-none focus:border-[#00875A] transition-all"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" /> Role:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles / Types</option>
            <option value="SUPERADMIN">Super Admin (SUPERADMIN)</option>
            <option value="USER">Retail User (USER)</option>
            <option value="B2B">B2B Wholesale Buyer</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-muted font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#00875A]" /> Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-surface-muted border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default UsersFilter;
