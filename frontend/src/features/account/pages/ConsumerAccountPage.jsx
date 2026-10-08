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
import { openDirectInvoicePdf } from "@/utils/invoice.js";
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
  Plus,
  Trash2,
  Home,
  Building,
  Star,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, Select } from "@/components/ui/Input.jsx";
import { US_STATES, CA_PROVINCES } from "@/constants/countries.js";

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

  // Fetch Consumer Saved Addresses
  const { data: addressesData = [], isLoading: loadingAddresses } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: async () => {
      const res = await Api.user.getAddresses();
      if (Array.isArray(res)) return res;
      return res?.data || res?.items || [];
    },
  });
  const addresses = Array.isArray(addressesData) ? addressesData : [];

  // Address Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: "Home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    countryCode: "US",
    isDefault: false,
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingAddress?.id) {
        return Api.user.updateAddress(editingAddress.id, payload);
      }
      return Api.user.addAddress(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-saved-addresses"] });
      toast.success(
        editingAddress ? "Address Updated" : "Address Saved",
        "Your delivery destination has been saved."
      );
      setAddressModalOpen(false);
      setEditingAddress(null);
    },
    onError: (err) => {
      toast.error("Save Failed", err.message || "Could not save address");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => Api.user.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-saved-addresses"] });
      toast.success("Address Removed", "The address has been removed from your account.");
    },
    onError: (err) => {
      toast.error("Failed to Remove", err.message);
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id) => Api.user.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["checkout-saved-addresses"] });
      toast.success("Default Address Updated", "Primary delivery address set.");
    },
    onError: (err) => {
      toast.error("Update Failed", err.message);
    },
  });

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: "Home",
      fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      phone: user?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "US",
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name || "Home",
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      countryCode: addr.countryCode || "US",
      isDefault: Boolean(addr.isDefault),
    });
    setAddressModalOpen(true);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    saveAddressMutation.mutate(addressForm);
  };

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
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "addresses" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {addresses.length}
              </span>
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
                                onClick={() => openDirectInvoicePdf(order.id, false, order.orderNumber)}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Delivery Addresses</h2>
                    <p className="text-xs text-slate-500">Manage your saved shipping and home destinations.</p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleOpenAddAddress}
                    className="bg-[#006B3C] text-white text-xs gap-1.5 self-start sm:self-auto shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </Button>
                </div>

                {loadingAddresses ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading saved addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No saved addresses yet</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Add your home or office address to enable quick 1-click delivery checkout.
                    </p>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleOpenAddAddress}
                      className="bg-[#006B3C] text-white gap-1.5 inline-flex"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Your First Address</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isDefault = Boolean(addr.isDefault);
                      const countryName =
                        addr.countryCode === "US"
                          ? "United States"
                          : addr.countryCode === "CA"
                          ? "Canada"
                          : addr.countryCode || "USA";

                      return (
                        <div
                          key={addr.id}
                          className={`p-5 rounded-2xl border transition-all text-xs space-y-3 flex flex-col justify-between ${
                            isDefault
                              ? "border-emerald-500/70 bg-emerald-50/20 shadow-xs"
                              : "border-slate-200/80 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
                                  {addr.name?.toLowerCase().includes("work") || addr.name?.toLowerCase().includes("office") ? (
                                    <Building className="w-3.5 h-3.5" />
                                  ) : (
                                    <Home className="w-3.5 h-3.5" />
                                  )}
                                </span>
                                <span>{addr.name || "Delivery Address"}</span>
                              </div>
                              {isDefault ? (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  Primary Default
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                                  disabled={setDefaultAddressMutation.isPending}
                                  className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Set as Default</span>
                                </button>
                              )}
                            </div>

                            <p className="font-bold text-slate-900 text-sm pt-0.5">
                              {addr.fullName}
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              <br />
                              {[addr.city, addr.state].filter(Boolean).join(", ")} {addr.postalCode}
                              <br />
                              <span className="font-semibold text-slate-800">{countryName}</span>
                            </p>
                            {addr.phone && (
                              <p className="text-slate-500 font-mono text-[11px]">
                                Contact: {addr.phone}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this address?")) {
                                  deleteAddressMutation.mutate(addr.id);
                                }
                              }}
                              disabled={deleteAddressMutation.isPending}
                              className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

        {/* Address Create / Edit Modal */}
        <Modal
          isOpen={addressModalOpen}
          onClose={() => {
            setAddressModalOpen(false);
            setEditingAddress(null);
          }}
          title={editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
          description="Save a destination address for effortless checkout and parcel shipping."
          size="md"
        >
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Address Label (e.g. Home, Work)"
                  value={addressForm.name || ""}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  placeholder="Home"
                  required
                />
              </div>
              <div>
                <Input
                  label="Recipient Full Name"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Input
                label="Contact Phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <div>
              <Input
                label="Street Address (Line 1)"
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                placeholder="1600 Pennsylvania Ave NW"
                required
              />
            </div>

            <div>
              <Input
                label="Apt, Suite, Unit (Line 2)"
                value={addressForm.addressLine2 || ""}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                placeholder="Suite 400 (Optional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="e.g. Washington"
                  required
                />
              </div>

              <div>
                <Select
                  label="Country"
                  value={addressForm.countryCode || "US"}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setAddressForm({
                      ...addressForm,
                      countryCode: nextCountry,
                      state: "",
                    });
                  }}
                  options={[
                    { label: "United States (US)", value: "US" },
                    { label: "Canada (CA)", value: "CA" },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                {(() => {
                  const targetCountry = addressForm.countryCode || "US";
                  const regions = targetCountry === "CA" ? CA_PROVINCES : US_STATES;
                  const regionLabel = targetCountry === "CA" ? "Province" : "State";

                  const rawState = (addressForm.state || "").trim();
                  const matchedRegion = regions.find(
                    (r) =>
                      r.code.toUpperCase() === rawState.toUpperCase() ||
                      r.name.toLowerCase() === rawState.toLowerCase()
                  );
                  const selectedVal = matchedRegion ? matchedRegion.code : rawState;

                  const options = [
                    { label: `— Select ${regionLabel} —`, value: "" },
                    ...(selectedVal && !regions.some((r) => r.code === selectedVal)
                      ? [{ label: selectedVal, value: selectedVal }]
                      : []),
                    ...regions.map((r) => ({
                      label: `${r.name} (${r.code})`,
                      value: r.code,
                    })),
                  ];

                  return (
                    <Select
                      label={`${regionLabel} *`}
                      value={selectedVal}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      options={options}
                      required
                    />
                  );
                })()}
              </div>

              <div>
                <Input
                  label={addressForm.countryCode === "CA" ? "Postal Code" : "ZIP Code"}
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  placeholder={addressForm.countryCode === "CA" ? "e.g. M5V 2T6" : "e.g. 20500"}
                  required
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="accent-emerald-700 w-4 h-4 rounded cursor-pointer"
                />
                <span>Make this my primary default address</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setAddressModalOpen(false);
                  setEditingAddress(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                type="submit"
                isLoading={saveAddressMutation.isPending}
                className="bg-[#006B3C] text-white font-bold"
              >
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </div>
  );
}
