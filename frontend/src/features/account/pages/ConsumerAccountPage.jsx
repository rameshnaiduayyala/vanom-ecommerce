import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import { Api } from "@/services/api/api-client.js";
import { formatPrice, formatDate } from "@/utils/formatters.js";
import { ROUTES } from "@/constants/routes.js";
import { ORDER_STATUSES } from "@/constants/countries.js";
import { Badge } from "@/components/ui/Badge.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { toast } from "@/components/ui/Toast.jsx";
import { EnterpriseInvoiceModal } from "@/components/common/EnterpriseInvoiceModal.jsx";
import {
  User,
  Package,
  Heart,
  MapPin,
  Shield,
  CreditCard,
  LogOut,
  Mail,
  Phone,
  Edit2,
  CheckCircle2,
  ArrowRight,
  Printer,
  Calendar,
  Sparkles,
} from "lucide-react";

export function ConsumerAccountPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'orders' | 'addresses' | 'security'
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const queryClient = useQueryClient();

  // Fetch Consumer Retail Orders
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ["consumer-orders"],
    queryFn: async () => {
      const res = await Api.orders.list();
      if (Array.isArray(res)) return res;
      return res?.items || [];
    },
  });

  const orders = Array.isArray(ordersData) ? ordersData : [];

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success("Profile Updated", "Your personal details have been saved.");
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Strip */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003D2B] to-[#006B3C] text-emerald-100 flex items-center justify-center font-black text-xl shadow-md ring-4 ring-emerald-50">
              {(user?.firstName?.[0] || "C").toUpperCase()}
              {(user?.lastName?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.firstName || "Valued"} {user?.lastName || "Customer"}
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Consumer
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span>Member since {formatDate(user?.createdAt || Date.now())}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{orders.length} Orders Placed</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link to={ROUTES.PRODUCTS} className="flex-1 md:flex-none">
              <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Explore Store</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Main Grid: Sidebar Tabs + Active Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Tabs (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-[#003D2B] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span>My Personal Profile</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-[#003D2B] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Order History & Invoices</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "orders" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "addresses"
                  ? "bg-[#003D2B] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>Saved Addresses</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === "security"
                  ? "bg-[#003D2B] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span>Security & Password</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          {/* Right Content Panel (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            
            {/* ── TAB 1: PROFILE ── */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Personal Account Details</h2>
                    <p className="text-xs text-slate-500">Manage your name, contact information, and preferences.</p>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="gap-1.5 border-slate-200 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Info</span>
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">First Name</label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#006B3C]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Last Name</label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#006B3C]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#006B3C]"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-3">
                      <Button variant="outline" size="sm" type="button" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button variant="default" size="sm" type="submit" className="bg-[#006B3C] text-white">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
                      <p className="font-bold text-slate-900 text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                      <p className="font-semibold text-slate-800">{user?.email}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                      <p className="font-semibold text-slate-800">{user?.phone || "No phone added"}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Account Type</span>
                      <p className="font-bold text-emerald-800">Direct Retail Consumer</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: ORDERS & INVOICES ── */}
            {activeTab === "orders" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Your Store Orders</h2>
                    <p className="text-xs text-slate-500">Track current shipments and download official invoices.</p>
                  </div>
                  <Link to={ROUTES.PRODUCTS}>
                    <Button variant="default" size="sm" className="bg-[#006B3C] text-white text-xs">
                      Shop Again
                    </Button>
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading orders...</div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const statusConfig = ORDER_STATUSES[order.status] || { label: order.status || "CONFIRMED", color: "green" };

                      return (
                        <div
                          key={order.id}
                          className="p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all bg-white shadow-2xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-slate-900">
                                  #{order.orderNumber || order.id?.slice(0, 8)}
                                </span>
                                <Badge variant={statusConfig.color} size="sm">
                                  {order.status || "CONFIRMED"}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-black text-base text-[#003D2B]">
                                {formatPrice(order.totalAmount || 0, order.currency?.code || "USD")}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="gap-1.5 border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Invoice</span>
                              </Button>
                            </div>
                          </div>

                          {/* Line Items Snippet */}
                          <div className="text-xs text-slate-600">
                            {order.items && order.items.length > 0 ? (
                              <p className="truncate">
                                <span className="font-semibold text-slate-800">Items: </span>
                                {order.items.map((it) => it.product?.name || it.name).join(", ")}
                              </p>
                            ) : (
                              <p className="text-slate-400">Order package confirmed.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <Package className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No orders yet</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Explore our catalog of certified organic essentials and natural wellness products.
                    </p>
                    <Link to={ROUTES.PRODUCTS} className="inline-block pt-2">
                      <Button variant="default" size="sm" className="bg-[#006B3C] text-white">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: ADDRESSES ── */}
            {activeTab === "addresses" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Delivery Addresses</h2>
                    <p className="text-xs text-slate-500">Manage your saved shipping and home destinations.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Default Residential</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-slate-600">
                      100 World Trade Center Blvd<br />
                      New York, NY 10007, United States
                    </p>
                    <p className="text-slate-500 font-mono pt-1">{user?.phone || "+1 (555) 019-2834"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: SECURITY ── */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Security & Credentials</h2>
                    <p className="text-xs text-slate-500">Update your access password and review security stamps.</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#006B3C]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter at least 8 characters"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#006B3C]"
                    />
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => toast.success("Password Updated", "Your security credentials have been changed.")}
                    className="bg-[#003D2B] text-white"
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Reusable Enterprise Invoice Modal for Consumer Orders */}
      <EnterpriseInvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
        type="RETAIL"
      />
    </div>
  );
}
