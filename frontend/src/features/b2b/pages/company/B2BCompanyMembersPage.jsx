import React, { useState, useMemo } from "react";
import { Users, UserPlus, Shield, Mail, CheckCircle2, UserCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { toast } from "@/components/ui/Toast.jsx";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCompanyProfile } from "./hooks/useCompanyProfile.js";

export function B2BCompanyMembersPage() {
  const { user } = useAuthStore();
  const { company, isLoading } = useCompanyProfile();
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "COMPANY_BUYER",
  });

  const members = useMemo(() => {
    const list = [];

    // Primary Account Owner from authenticated user session
    if (user) {
      const ownerName =
        user.name ||
        user.contactPersonName ||
        company?.contactPersonName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "Primary Account Owner";

      const ownerEmail = user.email || company?.businessEmail || "owner@business.com";

      list.push({
        id: user._id || user.id || "primary-owner",
        name: ownerName,
        email: ownerEmail,
        role: "COMPANY_ADMIN",
        roleLabel: "Primary Account Owner",
        status: "ACTIVE",
        isPrimary: true,
        addedAt: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Registered Owner",
      });
    }

    // Existing team members from company entity
    const team = company?.members || company?.users || [];
    if (Array.isArray(team)) {
      team.forEach((m, idx) => {
        if (!m || (user && (m.email === user.email || m._id === user._id))) return;
        list.push({
          id: m._id || m.id || `member-${idx}`,
          name: m.name || m.contactPersonName || "Corporate Agent",
          email: m.email || "N/A",
          role: m.role || "COMPANY_BUYER",
          roleLabel:
            m.roleLabel ||
            (m.role === "COMPANY_ADMIN"
              ? "Company Admin"
              : m.role === "FINANCE_APPROVER"
              ? "Finance Approver"
              : "Senior Procurement Officer"),
          status: m.status || "ACTIVE",
          isPrimary: Boolean(m.isPrimary),
          addedAt: m.createdAt
            ? new Date(m.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Authorized",
        });
      });
    }

    // Newly invited members
    invitedMembers.forEach((inv) => list.push(inv));

    return list;
  }, [user, company, invitedMembers]);

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      toast.error("Missing Fields", "Please provide a valid name and business email.");
      return;
    }

    const roleMap = {
      COMPANY_ADMIN: "Company Admin",
      COMPANY_BUYER: "Senior Procurement Officer",
      FINANCE_APPROVER: "Invoice & Payment Approver",
    };

    const newMember = {
      id: `mem-${Date.now()}`,
      name: inviteForm.name.trim(),
      email: inviteForm.email.trim().toLowerCase(),
      role: inviteForm.role,
      roleLabel: roleMap[inviteForm.role] || "Procurement Buyer",
      status: "INVITED",
      isPrimary: false,
      addedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setInvitedMembers((prev) => [...prev, newMember]);
    toast.success("Invitation Sent", `Wholesale procurement access invitation dispatched to ${inviteForm.email}.`);
    setIsInviteOpen(false);
    setInviteForm({ name: "", email: "", role: "COMPANY_BUYER" });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Top Header ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#358B5B]" />
            <span>Authorized Procurement Agents & Team Members</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize corporate agents to draft RFQs, place pallet purchase orders, and access commercial Net 30 credit.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={UserPlus}
          onClick={() => setIsInviteOpen(true)}
          className="font-bold shadow-xs bg-[#204B38] hover:bg-[#18392B] cursor-pointer shrink-0"
        >
          Invite Team Member
        </Button>
      </div>

      {/* ── Members Table or Empty State ── */}
      {members.length > 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden text-xs text-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Corporate Email</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Access Granted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {members.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#003D2B] text-emerald-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(mem.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{mem.name}</span>
                          {mem.isPrimary && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                              Primary
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">{mem.roleLabel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{mem.email}</td>
                  <td className="p-4">
                    <Badge variant="default" size="sm" className="font-mono text-[10px]">
                      {mem.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {mem.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <Badge variant="yellow" size="sm">
                        Pending Invite
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{mem.addedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#358B5B] flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Corporate Members Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Authorize team members or procurement managers to manage wholesale orders and quotes on behalf of your company.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="font-bold mt-2 bg-[#204B38] hover:bg-[#18392B]"
          >
            Invite First Member
          </Button>
        </div>
      )}

      {/* ── Invite Modal ── */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Corporate Procurement Representative"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Representative Full Name"
            value={inviteForm.name}
            onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
            placeholder="e.g. Ramesh Naidu"
            required
          />

          <Input
            label="Corporate Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="e.g. ramesh@company.com"
            required
          />

          <Select
            label="Procurement Role & Permission Level"
            value={inviteForm.role}
            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            options={[
              { label: "Company Admin (Full Credit & Order Approval)", value: "COMPANY_ADMIN" },
              { label: "Senior Procurement Officer (Draft RFQs & POs)", value: "COMPANY_BUYER" },
              { label: "Finance Approver (Invoices & Credit Statements)", value: "FINANCE_APPROVER" },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" className="font-bold bg-[#204B38] hover:bg-[#18392B]">
              Dispatch Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default B2BCompanyMembersPage;
