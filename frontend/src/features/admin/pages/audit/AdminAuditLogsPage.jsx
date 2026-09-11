import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatDate } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import {
  ShieldCheck,
  Search,
  User,
  Activity,
  Globe,
  FileText,
  Eye,
  ChevronRight,
  ArrowRight,
  Filter,
} from "lucide-react";

export function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [inspectingLog, setInspectingLog] = useState(null);

  const { data: logsData = [], isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => Api.admin.getAuditLogs(),
  });

  const rawLogs = Array.isArray(logsData)
    ? logsData
    : Array.isArray(logsData?.items)
    ? logsData.items
    : [];

  // Helper formatting for readable descriptions
  const getActionBadgeVariant = (action = "") => {
    const act = String(action).toUpperCase();
    if (act.includes("CREATE") || act.includes("APPROVE") || act.includes("REGISTER")) return "green";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PATCH")) return "brand";
    if (act.includes("DELETE") || act.includes("REJECT")) return "danger";
    if (act.includes("LOGIN") || act.includes("AUTH")) return "gold";
    return "default";
  };

  const formatActionDescription = (log) => {
    const action = (log.action || "ACTIVITY").toUpperCase();
    const entity = log.entityType || "Resource";
    const entityId = log.entityId ? `#${log.entityId.slice(0, 8)}` : "";

    switch (action) {
      case "PRODUCT_CREATED":
      case "CREATE":
        return `Created new ${entity} record ${entityId}`;
      case "COMPANY_APPROVED":
      case "APPROVE":
        return `Approved verification for company ${entityId}`;
      case "COMPANY_REJECTED":
      case "REJECT":
        return `Rejected verification application for company ${entityId}`;
      case "PRICE_TIER_UPDATED":
        return `Updated wholesale pricing tier configuration`;
      case "ORDER_STATUS_UPDATED":
        return `Updated order status for order ${entityId}`;
      case "USER_REGISTERED":
        return `Registered new user account`;
      case "USER_UPDATED":
        return `Modified user profile & role permissions`;
      case "USER_DELETED":
        return `Deleted user account from system`;
      default:
        return `Executed ${action.replace(/_/g, " ")} on ${entity} ${entityId}`;
    }
  };

  const filteredLogs = rawLogs.filter((log) => {
    const actor = (log.actor?.email || log.actorId || "").toLowerCase();
    const actorName = `${log.actor?.firstName || ""} ${log.actor?.lastName || ""}`.toLowerCase();
    const action = (log.action || "").toLowerCase();
    const entity = (log.entityType || "").toLowerCase();
    const entityId = (log.entityId || "").toLowerCase();

    const matchesSearch =
      !searchTerm ||
      actor.includes(searchTerm.toLowerCase()) ||
      actorName.includes(searchTerm.toLowerCase()) ||
      action.includes(searchTerm.toLowerCase()) ||
      entity.includes(searchTerm.toLowerCase()) ||
      entityId.includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === "ALL" ||
      (log.action || "").toUpperCase() === actionFilter.toUpperCase();

    const matchesEntity =
      entityFilter === "ALL" ||
      (log.entityType || "").toUpperCase() === entityFilter.toUpperCase();

    return matchesSearch && matchesAction && matchesEntity;
  });

  const uniqueActions = Array.from(new Set(rawLogs.map((l) => (l.action || "").toUpperCase()))).filter(Boolean);
  const uniqueEntities = Array.from(new Set(rawLogs.map((l) => (l.entityType || "").toUpperCase()))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#00875A]" />
            System Audit Trail & Activity Logs
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Complete transparency of who performed which actions across products, orders, verification workflows, and users.
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor email, action, entity ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 rounded-xl border border-border bg-white text-xs text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Actions ({rawLogs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="p-2 rounded-xl border border-border bg-white text-xs text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Entities</option>
            {uniqueEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Audit Logs Table ── */}
      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead className="bg-surface-muted text-text-secondary text-[11px] uppercase font-semibold border-b border-border">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor (User)</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Activity Description</th>
                <th className="p-4">Entity</th>
                <th className="p-4">IP / Client</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted">
                    Loading system audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-text-muted">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const actorEmail = log.actor?.email || log.actorId || "System Daemon";
                  const actorName = log.actor?.firstName
                    ? `${log.actor.firstName} ${log.actor.lastName || ""}`
                    : null;

                  return (
                    <tr key={log.id || idx} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-text-muted font-mono">
                        {formatDate(log.createdAt || new Date())}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {(actorName?.[0] || actorEmail[0] || "U").toUpperCase()}
                          </div>
                          <div>
                            {actorName && <p className="font-bold text-text-primary leading-tight">{actorName}</p>}
                            <p className="text-[11px] text-text-muted truncate max-w-[180px]">{actorEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                          {log.action || "SYSTEM_EVENT"}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800">
                          {formatActionDescription(log)}
                        </span>
                      </td>

                      <td className="p-4 font-mono">
                        <span className="bg-surface-muted px-2 py-0.5 rounded border border-border/60 text-[10px]">
                          {log.entityType || "Resource"}
                        </span>
                      </td>

                      <td className="p-4 text-text-muted font-mono text-[11px]">
                        {log.ipAddress || "127.0.0.1"}
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setInspectingLog(log)}
                          className="text-xs font-semibold cursor-pointer"
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Detailed Payload Inspection ── */}
      <Modal
        isOpen={Boolean(inspectingLog)}
        onClose={() => setInspectingLog(null)}
        title="Audit Log Event Dossier"
        maxWidth="max-w-4xl"
      >
        {inspectingLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-surface-muted border border-border">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">Actor</span>
                <span className="font-bold text-text-primary">{inspectingLog.actor?.email || inspectingLog.actorId}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">Action</span>
                <Badge variant={getActionBadgeVariant(inspectingLog.action)} size="sm">
                  {inspectingLog.action}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">Entity Target</span>
                <span className="font-mono">{inspectingLog.entityType} ({inspectingLog.entityId || "N/A"})</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">Timestamp</span>
                <span>{new Date(inspectingLog.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {inspectingLog.beforeData && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">State Before Change:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectingLog.beforeData, null, 2)}
                </pre>
              </div>
            )}

            {inspectingLog.afterData && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">State After Change:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectingLog.afterData, null, 2)}
                </pre>
              </div>
            )}

            {inspectingLog.metadata && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Event Metadata:</span>
                <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectingLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setInspectingLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminAuditLogsPage;
