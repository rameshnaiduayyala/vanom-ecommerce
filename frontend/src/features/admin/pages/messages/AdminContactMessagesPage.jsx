import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Eye,
  Trash2,
  RefreshCw,
  Clock,
  User,
  Phone,
  Calendar,
  Sparkles,
  Inbox,
} from "lucide-react";
import { contactService } from "@/services/api/contact.service.js";
import { toast } from "@/stores/ui.store.js";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Textarea } from "@/components/ui/Input.jsx";
import { DataTable } from "@/components/ui/DataTable.jsx";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Messages" },
  { value: "PENDING", label: "Pending / New", color: "bg-amber-100 text-amber-800" },
  { value: "READ", label: "Read", color: "bg-blue-100 text-blue-800" },
  { value: "REPLIED", label: "Replied", color: "bg-emerald-100 text-emerald-800" },
  { value: "ARCHIVED", label: "Archived", color: "bg-slate-100 text-slate-800" },
];

export function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await contactService.getContactMessages(params);
      const data = Array.isArray(res) ? res : res?.items || res?.data || [];
      setMessages(data);
    } catch (err) {
      toast.error("Failed to load messages", err?.message || "Error fetching contact inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (msg) => {
    setSelectedMessage(msg);
    setAdminNotes(msg.adminNotes || "");

    // Auto mark as READ if currently PENDING
    if (msg.status === "PENDING") {
      try {
        await contactService.updateContactMessage(msg.id, { status: "READ" });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: "READ" } : m))
        );
        setSelectedMessage((prev) => (prev ? { ...prev, status: "READ" } : null));
      } catch (err) {
        console.error("Auto mark read failed", err);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedMessage) return;
    try {
      setUpdating(true);
      const updated = await contactService.updateContactMessage(selectedMessage.id, {
        status: newStatus,
        adminNotes,
      });

      setSelectedMessage((prev) => ({ ...prev, ...updated }));
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, ...updated } : m))
      );
      toast.success("Status Updated", `Message marked as ${newStatus}`);
    } catch (err) {
      toast.error("Update Failed", err?.message || "Could not update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    try {
      setUpdating(true);
      const updated = await contactService.updateContactMessage(selectedMessage.id, {
        adminNotes,
      });
      setSelectedMessage((prev) => ({ ...prev, ...updated }));
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, ...updated } : m))
      );
      toast.success("Notes Saved", "Internal admin notes updated.");
    } catch (err) {
      toast.error("Save Failed", err?.message || "Could not save notes");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactService.deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      toast.success("Message Deleted", "Inquiry removed permanently.");
    } catch (err) {
      toast.error("Delete Failed", err?.message || "Could not delete message");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-800 font-semibold text-[11px]">Pending</Badge>;
      case "READ":
        return <Badge className="bg-blue-100 text-blue-800 font-semibold text-[11px]">Read</Badge>;
      case "REPLIED":
        return <Badge className="bg-emerald-100 text-emerald-800 font-semibold text-[11px]">Replied</Badge>;
      case "ARCHIVED":
        return <Badge className="bg-slate-100 text-slate-700 font-semibold text-[11px]">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // ── Reusable DataTable Column Definitions ──
  const columns = useMemo(
    () => [
      {
        key: "customer",
        header: "Customer",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              {row.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">{row.name}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">{row.email}</p>
              {row.phone && (
                <p className="text-[10px] text-slate-400 font-mono truncate">{row.phone}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "subject",
        header: "Subject & Message",
        sortable: true,
        render: (row) => (
          <div className="max-w-md space-y-0.5">
            <p className="font-semibold text-slate-900 text-xs truncate">
              {row.subject}
            </p>
            <p className="text-xs text-slate-500 line-clamp-1">
              {row.message}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        render: (row) => getStatusBadge(row.status),
      },
      {
        key: "createdAt",
        header: "Date",
        sortable: true,
        render: (row) => (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {new Date(row.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenDetail(row)}
              className="text-xs px-2.5 py-1 text-slate-700 hover:bg-slate-50"
              title="View Inquiry Details"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(row.id)}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
              title="Delete Inquiry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Inquiries</h1>
              <Badge variant="outline" className="text-slate-600 text-[11px]">
                {messages.length} Total
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage, review, and track customer contact messages and support inquiries.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchMessages}
          className="text-xs px-3 py-2 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* ─── Reusable Table with built-in search, sorting, pagination ─── */}
      <div className="space-y-4">
        {/* Status Filter Header Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {STATUS_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reusable DataTable Component */}
        <DataTable
          columns={columns}
          data={messages}
          isLoading={loading}
          searchable={true}
          searchPlaceholder="Search by customer name, email, subject, or message..."
          searchKeys={["name", "email", "subject", "message"]}
          pagination={true}
          pageSize={10}
          emptyMessage="No customer inquiries found."
          emptyIcon={Inbox}
          onRowClick={(row) => handleOpenDetail(row)}
          className="shadow-sm"
        />
      </div>

      {/* ─── Detail Drawer / Modal ─── */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  {selectedMessage.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMessage.name}</h3>
                  <p className="text-xs text-slate-500">{selectedMessage.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedMessage.status)}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Meta Info Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Subject</span>
                <span className="font-semibold text-slate-900">{selectedMessage.subject}</span>
              </div>
              {selectedMessage.phone && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-900">{selectedMessage.phone}</span>
                </div>
              )}
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Submitted At</span>
                <span className="font-medium text-slate-800">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer Message Body */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Message
              </label>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Internal Admin Notes
              </label>
              <Textarea
                rows={2}
                placeholder="Add private notes for your team (e.g. Call scheduled, refund processed, etc.)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                disabled={updating}
                className="text-xs"
              >
                Save Notes
              </Button>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              {/* Quick Status Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
                <button
                  type="button"
                  onClick={() => handleStatusChange("PENDING")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                    selectedMessage.status === "PENDING"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("REPLIED")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                    selectedMessage.status === "REPLIED"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Replied
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("ARCHIVED")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                    selectedMessage.status === "ARCHIVED"
                      ? "bg-slate-600 text-white border-slate-600"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Archive
                </button>
              </div>

              {/* Actions: Delete & Close */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMessage(null)}
                  className="text-slate-600 text-xs px-3"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContactMessagesPage;
