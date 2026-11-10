import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatDate } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { DataTable } from "@/components/ui/DataTable.jsx";
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  Globe,
  Laptop,
  Smartphone,
  MapPin,
} from "lucide-react";

export function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [inspectingLog, setInspectingLog] = useState(null);

  const { data: logsData = [], isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => Api.admin.getAuditLogs({ limit: 100 }),
  });

  const rawLogs = Array.isArray(logsData)
    ? logsData
    : Array.isArray(logsData?.items)
      ? logsData.items
      : Array.isArray(logsData?.data)
        ? logsData.data
        : [];

  // Helper formatting for readable descriptions
  const getActionBadgeVariant = (action = "") => {
    const act = String(action).toUpperCase();
    if (
      act.includes("CREATE") ||
      act.includes("APPROVE") ||
      act.includes("REGISTER")
    )
      return "green";
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("PATCH"))
      return "brand";
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

  const parseDevice = (log) => {
    if (log.device) return log.device;
    if (log.metadata?.device) return log.metadata.device;
    const ua = log.userAgent;
    if (!ua) return "—";

    let os = "OS";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/iphone/i.test(ua)) os = "iOS (iPhone)";
    else if (/ipad/i.test(ua)) os = "iPadOS";
    else if (/macintosh|mac os/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/linux/i.test(ua)) os = "Linux";

    let browser = "Browser";
    if (/edg\//i.test(ua)) browser = "Edge";
    else if (/opr\/|opera/i.test(ua)) browser = "Opera";
    else if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";

    return `${browser} on ${os}`;
  };

  // Normalise logs with convenient flat fields for search & sorting
  const formattedLogs = useMemo(() => {
    return rawLogs.map((log) => {
      const actorEmail =
        log.actor?.email || log.actorEmail || log.actorId || "System Daemon";
      const actorName = log.actor?.firstName
        ? `${log.actor.firstName} ${log.actor.lastName || ""}`.trim()
        : "";
      const computedDescription =
        log.description || formatActionDescription(log);
      const deviceStr = parseDevice(log);
      const locationStr = log.location || log.metadata?.location || "—";
      const ipStr = log.ipAddress || log.metadata?.ipAddress || "127.0.0.1";

      return {
        ...log,
        actorEmail,
        actorName,
        deviceStr,
        locationStr,
        ipStr,
        searchableActor: `${actorName} ${actorEmail}`.trim(),
        computedDescription,
      };
    });
  }, [rawLogs]);

  // Unique actions and entities for filter dropdowns
  const uniqueActions = useMemo(
    () =>
      Array.from(
        new Set(rawLogs.map((l) => (l.action || "").toUpperCase())),
      ).filter(Boolean),
    [rawLogs],
  );
  const uniqueEntities = useMemo(
    () =>
      Array.from(
        new Set(rawLogs.map((l) => (l.entityType || "").toUpperCase())),
      ).filter(Boolean),
    [rawLogs],
  );

  // Apply Action and Entity filters before passing to DataTable
  const filteredData = useMemo(() => {
    return formattedLogs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" ||
        (log.action || "").toUpperCase() === actionFilter.toUpperCase();

      const matchesEntity =
        entityFilter === "ALL" ||
        (log.entityType || "").toUpperCase() === entityFilter.toUpperCase();

      return matchesAction && matchesEntity;
    });
  }, [formattedLogs, actionFilter, entityFilter]);

  // Reusable DataTable Column Definitions
  const columns = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Timestamp",
        sortable: true,
        className: "whitespace-nowrap font-mono text-text-muted text-xs",
        render: (row) => formatDate(row.createdAt || new Date(), true),
      },
      {
        key: "actorEmail",
        header: "Actor (User)",
        sortable: true,
        render: (row) => {
          const actorEmail = row.actorEmail;
          const actorName = row.actorName;
          const initial = (
            actorName?.[0] ||
            actorEmail?.[0] ||
            "U"
          ).toUpperCase();

          return (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                {actorName && (
                  <p className="font-bold text-text-primary leading-tight truncate">
                    {actorName}
                  </p>
                )}
                <p className="text-[11px] text-text-muted truncate max-w-[180px]">
                  {actorEmail}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "action",
        header: "Action Event",
        sortable: true,
        render: (row) => (
          <Badge variant={getActionBadgeVariant(row.action)} size="sm">
            {row.action || "SYSTEM_EVENT"}
          </Badge>
        ),
      },
      {
        key: "computedDescription",
        header: "Activity Description",
        sortable: true,
        render: (row) => (
          <span className="font-medium text-slate-800 line-clamp-2">
            {row.computedDescription}
          </span>
        ),
      },
      {
        key: "entityType",
        header: "Entity",
        sortable: true,
        render: (row) => (
          <span className="bg-surface-muted px-2 py-0.5 rounded border border-border/60 text-[10px] font-mono">
            {row.entityType || "Resource"}
          </span>
        ),
      },
      {
        key: "ipAddress",
        header: "IP Address",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{row.ipStr}</span>
          </div>
        ),
      },
      {
        key: "deviceStr",
        header: "Device / Browser",
        sortable: true,
        render: (row) => {
          const isMobile = /mobile|iphone|android|tablet|ipad/i.test(row.deviceStr || "");
          const Icon = isMobile ? Smartphone : Laptop;
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-800 max-w-[190px]">
              <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate font-medium" title={row.deviceStr}>
                {row.deviceStr}
              </span>
            </div>
          );
        },
      },
      {
        key: "locationStr",
        header: "Location",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 max-w-[160px]">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate font-medium" title={row.locationStr}>
              {row.locationStr}
            </span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Details",
        align: "right",
        sortable: false,
        render: (row) => (
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setInspectingLog(row)}
            className="text-xs font-semibold cursor-pointer"
          >
            Inspect
          </Button>
        ),
      },
    ],
    [],
  );

  // Filter actions integrated into DataTable toolbar
  const filterToolbarActions = (
    <div className="flex items-center gap-2">
      <select
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        aria-label="Filter by action"
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-[#006B3C] cursor-pointer"
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
        aria-label="Filter by entity"
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-[#006B3C] cursor-pointer"
      >
        <option value="ALL">All Entities</option>
        {uniqueEntities.map((ent) => (
          <option key={ent} value={ent}>
            {ent}
          </option>
        ))}
      </select>
    </div>
  );

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
            Complete transparency of who performed which actions across
            products, orders, verification workflows, and users.
          </p>
        </div>
      </div>

      {/* ── Reusable DataTable Component ── */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchable={true}
        searchPlaceholder="Search actor, action, entity, IP..."
        searchKeys={[
          "actorEmail",
          "actorName",
          "action",
          "entityType",
          "entityId",
          "computedDescription",
          "ipStr",
          "deviceStr",
          "locationStr",
        ]}
        actions={filterToolbarActions}
        pagination={true}
        pageSize={15}
        pageSizeOptions={[10, 15, 25, 50, 100]}
        emptyMessage="No activity logs match the selected filter."
        emptyIcon={ShieldAlert}
        className="shadow-2xs"
      />

      {/* ── Modal: Detailed Payload Inspection ── */}
      <Modal
        isOpen={Boolean(inspectingLog)}
        onClose={() => setInspectingLog(null)}
        title="Audit Log Event Dossier"
        maxWidth="max-w-4xl"
      >
        {inspectingLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-muted border border-border">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  Actor
                </span>
                <span className="font-bold text-text-primary">
                  {inspectingLog.actor?.email || inspectingLog.actorEmail || inspectingLog.actorId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  Action
                </span>
                <Badge
                  variant={getActionBadgeVariant(inspectingLog.action)}
                  size="sm"
                >
                  {inspectingLog.action}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  Entity Target
                </span>
                <span className="font-mono">
                  {inspectingLog.entityType} ({inspectingLog.entityId || "N/A"})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  IP Address
                </span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{inspectingLog.ipStr || inspectingLog.ipAddress || "127.0.0.1"}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  Device / Browser
                </span>
                <span className="font-medium text-slate-800" title={inspectingLog.deviceStr}>
                  {inspectingLog.deviceStr || inspectingLog.device || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  Location
                </span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-medium">{inspectingLog.locationStr || inspectingLog.location || "—"}</span>
                </div>
              </div>
              <div className="sm:col-span-3">
                <span className="text-[10px] text-text-muted font-bold uppercase block">
                  Timestamp
                </span>
                <span className="font-medium text-slate-700">
                  {new Date(inspectingLog.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {inspectingLog.beforeData && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">
                  State Before Change:
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectingLog.beforeData, null, 2)}
                </pre>
              </div>
            )}

            {inspectingLog.afterData && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">
                  State After Change:
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectingLog.afterData, null, 2)}
                </pre>
              </div>
            )}

            {inspectingLog.metadata && (
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">
                  Event Metadata:
                </span>
                <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectingLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectingLog(null)}
              >
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
