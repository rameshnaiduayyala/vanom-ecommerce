import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { formatDate } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { DataTable } from "@/components/ui/DataTable.jsx";
import { DateRangePicker } from "@/components/common/DateRangePicker.jsx";
import {
  ShieldCheck,
  ShieldAlert,
  Eye,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  MapPin,
  Copy,
  Check,
  User,
  Calendar,
  Layers,
  Terminal,
  Activity,
} from "lucide-react";

export function AdminAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [inspectingLog, setInspectingLog] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [dateRange, setDateRange] = useState({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(typeof text === "object" ? JSON.stringify(text, null, 2) : String(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const { data: logsData = [], isLoading } = useQuery({
    queryKey: ["admin-audit-logs", dateRange],
    queryFn: () =>
      Api.admin.getAuditLogs({
        limit: 100,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        timeRange:
          dateRange.preset !== "custom" && dateRange.preset !== "all"
            ? dateRange.preset
            : undefined,
      }),
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

  /**
   * Clearly extracts form factor (Desktop, Mobile, Tablet),
   * Operating System, and Browser details.
   */
  const parseDeviceInfo = (log) => {
    const rawDevice = log.device || log.metadata?.device || "";
    const ua = log.userAgent || log.metadata?.userAgent || "";

    // 1. Detect Form Factor: Desktop, Mobile, Tablet
    let formFactor = "Desktop";
    if (
      /tablet|ipad|playbook|silk/i.test(ua) ||
      /tablet/i.test(rawDevice) ||
      (/android/i.test(ua) && !/mobile/i.test(ua))
    ) {
      formFactor = "Tablet";
    } else if (
      /mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua) ||
      /mobile/i.test(rawDevice)
    ) {
      formFactor = "Mobile";
    } else if (/desktop/i.test(rawDevice)) {
      formFactor = "Desktop";
    }

    // 2. Extract OS
    let os = "";
    if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
    else if (/windows nt 6\.3/i.test(ua)) os = "Windows 8.1";
    else if (/windows nt 6\.1/i.test(ua)) os = "Windows 7";
    else if (/windows/i.test(ua)) os = "Windows";
    else if (/iphone/i.test(ua)) os = "iOS (iPhone)";
    else if (/ipad/i.test(ua)) os = "iPadOS";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/cros/i.test(ua)) os = "ChromeOS";
    else if (/linux/i.test(ua)) os = "Linux";

    // 3. Extract Browser
    let browser = "";
    if (/edg\//i.test(ua)) browser = "Microsoft Edge";
    else if (/opr\/|opera/i.test(ua)) browser = "Opera";
    else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) browser = "Google Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Apple Safari";

    let browserOs = [browser, os].filter(Boolean).join(" • ");
    if (!browserOs) {
      if (rawDevice) {
        browserOs = rawDevice.replace(/\s*\((desktop|mobile|tablet)\)/i, "").trim();
      } else {
        browserOs = "Standard Browser";
      }
    }

    return {
      formFactor, // "Desktop" | "Mobile" | "Tablet"
      browser: browser || "Browser",
      os: os || "OS",
      browserOs,
      summary: `${browserOs} (${formFactor})`,
      raw: rawDevice || ua || "—",
      userAgent: ua || null,
    };
  };

  // Normalise logs with convenient flat fields for search & sorting
  const formattedLogs = useMemo(() => {
    return rawLogs.map((log) => {
      const actorEmail =
        log.actor?.email || log.actorEmail || log.actorId || "System Daemon";
      const actorName = log.actor?.firstName
        ? `${log.actor.firstName} ${log.actor.lastName || ""}`.trim()
        : "";
      const actorRole = log.actor?.role || log.actorRole || "SYSTEM";
      const computedDescription =
        log.description || formatActionDescription(log);
      const deviceInfo = parseDeviceInfo(log);
      let locationStr = log.location || log.metadata?.location || "—";
      const ipStr = log.ipAddress || log.metadata?.ipAddress || "127.0.0.1";

      // Sanitize legacy "US" location entries from localhost
      if (
        locationStr === "US" &&
        (!ipStr || ipStr === "127.0.0.1" || ipStr === "::1" || ipStr.startsWith("192.168.") || ipStr.startsWith("10."))
      ) {
        locationStr = "India (Localhost)";
      }

      return {
        ...log,
        actorEmail,
        actorName,
        actorRole,
        deviceInfo,
        formFactor: deviceInfo.formFactor,
        browserOs: deviceInfo.browserOs,
        deviceStr: deviceInfo.summary,
        locationStr,
        ipStr,
        searchableActor: `${actorName} ${actorEmail} ${actorRole}`.trim(),
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

  // Apply Action, Entity, and Date filters before passing to DataTable
  const filteredData = useMemo(() => {
    return formattedLogs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" ||
        (log.action || "").toUpperCase() === actionFilter.toUpperCase();

      const matchesEntity =
        entityFilter === "ALL" ||
        (log.entityType || "").toUpperCase() === entityFilter.toUpperCase();

      // Client-side date filtering safety (handles cached/preset/custom ranges)
      let matchesDate = true;
      if (dateRange.startDate || dateRange.endDate) {
        const logDate = new Date(log.createdAt);
        if (dateRange.startDate && !isNaN(logDate.getTime())) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) matchesDate = false;
        }
        if (dateRange.endDate && !isNaN(logDate.getTime())) {
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) matchesDate = false;
        }
      } else if (dateRange.preset && dateRange.preset !== "all") {
        const logDate = new Date(log.createdAt);
        const now = new Date();
        if (dateRange.preset === "today") {
          const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          if (logDate < startOfToday) matchesDate = false;
        } else if (dateRange.preset === "7d") {
          const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < past7) matchesDate = false;
        } else if (dateRange.preset === "30d") {
          const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (logDate < past30) matchesDate = false;
        }
      }

      return matchesAction && matchesEntity && matchesDate;
    });
  }, [formattedLogs, actionFilter, entityFilter, dateRange]);

  // DataTable Column Definitions: Timestamp, Actor, Event, IP, Device (Desktop/Mobile/Tablet), Location, View
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
        header: "Actor",
        sortable: true,
        render: (row) => {
          const actorEmail = row.actorEmail;
          const actorName = row.actorName;
          const actorRole = row.actorRole;
          const initial = (
            actorName?.[0] ||
            actorEmail?.[0] ||
            "U"
          ).toUpperCase();

          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                {actorName ? (
                  <p className="font-bold text-text-primary leading-tight truncate">
                    {actorName}
                  </p>
                ) : null}
                <p className="text-[11px] text-text-muted truncate max-w-[170px]" title={actorEmail}>
                  {actorEmail}
                </p>
                {actorRole && (
                  <span className="inline-block text-[9px] font-mono font-semibold uppercase text-slate-500">
                    {actorRole}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "action",
        header: "Event",
        sortable: true,
        render: (row) => (
          <div className="flex flex-col gap-0.5 max-w-[210px]">
            <Badge variant={getActionBadgeVariant(row.action)} size="sm">
              {row.action || "SYSTEM_EVENT"}
            </Badge>
            <span
              className="text-[11px] text-slate-500 line-clamp-1 truncate font-normal"
              title={row.computedDescription}
            >
              {row.computedDescription}
            </span>
          </div>
        ),
      },
      {
        key: "ipAddress",
        header: "IP Address",
        sortable: true,
        render: (row) => (
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-md">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{row.ipStr}</span>
          </div>
        ),
      },
      {
        key: "device",
        header: "Device",
        sortable: true,
        render: (row) => {
          const { formFactor, browserOs } = row.deviceInfo || {};
          const isTablet = formFactor === "Tablet";
          const isMobile = formFactor === "Mobile";
          const Icon = isTablet ? Tablet : isMobile ? Smartphone : Laptop;
          const badgeClass = isTablet
            ? "bg-purple-50 text-purple-700 border-purple-200"
            : isMobile
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-blue-50 text-blue-700 border-blue-200";

          return (
            <div className="flex flex-col gap-1 py-0.5 min-w-[130px]">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeClass}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {formFactor || "Desktop"}
                </span>
              </div>
              <span
                className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]"
                title={browserOs}
              >
                {browserOs || "Standard Browser"}
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
        header: "View",
        align: "right",
        sortable: false,
        render: (row) => (
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => setInspectingLog(row)}
            className="text-xs font-semibold cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );

  // Filter actions integrated into DataTable toolbar
  const filterToolbarActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <DateRangePicker
        preset={dateRange.preset}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={(newRange) => setDateRange(newRange)}
        showInlinePills={true}
      />

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
          "formFactor",
          "browserOs",
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

      {/* ── View Modal: Comprehensive Audit Log Event Dossier ── */}
      <Modal
        isOpen={Boolean(inspectingLog)}
        onClose={() => setInspectingLog(null)}
        title="Audit Log Event Dossier"
        maxWidth="max-w-4xl"
      >
        {inspectingLog && (
          <div className="space-y-5 text-xs">
            {/* 1. Header Banner & Action Summary */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getActionBadgeVariant(inspectingLog.action)} size="sm">
                    {inspectingLog.action || "SYSTEM_EVENT"}
                  </Badge>
                  <span className="font-mono text-[10px] text-slate-300">
                    ID: #{String(inspectingLog.id || "").slice(-12)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {inspectingLog.computedDescription || inspectingLog.description || "Activity Event"}
                </h3>
              </div>
              <div className="flex items-center gap-2 sm:self-center">
                <button
                  type="button"
                  onClick={() => copyToClipboard(inspectingLog.id, "logId")}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy full Event ID"
                >
                  {copiedKey === "logId" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Structured Detail Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Actor Profile Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Actor / User</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate" title={inspectingLog.actorName || inspectingLog.actorEmail}>
                    {inspectingLog.actorName || "Unassigned Name"}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate font-mono" title={inspectingLog.actorEmail}>
                    {inspectingLog.actorEmail}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                      {inspectingLog.actorRole || inspectingLog.actor?.role || "USER"}
                    </span>
                    {inspectingLog.actorId ? (
                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[90px]" title={inspectingLog.actorId}>
                        #{inspectingLog.actorId.slice(0, 8)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* IP & Geolocation Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Network & Location</span>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {inspectingLog.ipStr || inspectingLog.ipAddress || "127.0.0.1"}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectingLog.ipStr, "ip")}
                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      title="Copy IP"
                    >
                      {copiedKey === "ip" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-700 mt-1">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="font-medium truncate" title={inspectingLog.locationStr}>
                      {inspectingLog.locationStr || "Location Unspecified"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {inspectingLog.metadata?.clientTimezone ? `TZ: ${inspectingLog.metadata.clientTimezone}` : "Client Geolocation"}
                  </p>
                </div>
              </div>

              {/* Device & Client Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-purple-600" />
                  <span>Device & Client</span>
                </div>
                <div>
                  <div className="mb-1">
                    {(() => {
                      const formFactor = inspectingLog.deviceInfo?.formFactor || "Desktop";
                      const isTablet = formFactor === "Tablet";
                      const isMobile = formFactor === "Mobile";
                      const Icon = isTablet ? Tablet : isMobile ? Smartphone : Laptop;
                      const badgeClass = isTablet
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : isMobile
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-blue-100 text-blue-800 border-blue-200";

                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                          <Icon className="w-3 h-3" />
                          {formFactor}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="font-semibold text-slate-800 text-[11px] truncate" title={inspectingLog.deviceInfo?.browserOs}>
                    {inspectingLog.deviceInfo?.browserOs || inspectingLog.deviceStr || "Standard Client"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {inspectingLog.deviceInfo?.os || "Operating System"}
                  </p>
                </div>
              </div>

              {/* Target Entity Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Entity Target</span>
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-200/80 border border-slate-300 font-mono text-[10px] font-bold text-slate-800">
                    {inspectingLog.entityType || "Resource"}
                  </span>
                  <p className="font-mono text-slate-700 text-[11px] mt-1.5 truncate" title={inspectingLog.entityId || "N/A"}>
                    ID: {inspectingLog.entityId || "None / System-Wide"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(inspectingLog.createdAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Raw User Agent String */}
            {inspectingLog.userAgent || inspectingLog.deviceInfo?.userAgent ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    Raw User-Agent Header
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        inspectingLog.userAgent || inspectingLog.deviceInfo?.userAgent,
                        "ua",
                      )
                    }
                    className="text-xs text-[#00875A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "ua" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy User Agent</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-200/80 break-all select-all">
                  {inspectingLog.userAgent || inspectingLog.deviceInfo?.userAgent}
                </div>
              </div>
            ) : null}

            {/* 4. State Changes (Before vs After) */}
            {(inspectingLog.beforeData || inspectingLog.afterData) && (
              <div className="space-y-2 pt-1 border-t border-slate-200/80">
                <span className="font-bold text-slate-800 text-xs block">
                  State Mutation Evidence (Before vs After)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inspectingLog.beforeData && (
                    <div className="space-y-1">
                      <span className="font-semibold text-rose-700 text-[11px] block">
                        State Before Modification:
                      </span>
                      <pre className="p-3 bg-slate-900 text-rose-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                        {JSON.stringify(inspectingLog.beforeData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {inspectingLog.afterData && (
                    <div className="space-y-1">
                      <span className="font-semibold text-emerald-700 text-[11px] block">
                        State After Modification:
                      </span>
                      <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                        {JSON.stringify(inspectingLog.afterData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Complete Event Metadata */}
            {inspectingLog.metadata && (
              <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    Event Metadata & Additional Payload
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(inspectingLog.metadata, "meta")}
                    className="text-xs text-[#00875A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "meta" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56 border border-slate-800">
                  {JSON.stringify(inspectingLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* 6. Modal Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Vanom Audit Trail Ledger • Cryptographically Timestamped
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setInspectingLog(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminAuditLogsPage;
