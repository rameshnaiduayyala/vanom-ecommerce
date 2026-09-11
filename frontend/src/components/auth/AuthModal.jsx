import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store.js";
import { useUIStore } from "../../stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "../../constants/routes.js";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button.jsx";

export function AuthModal({ isOpen, onClose, onSuccess, initialRole = "B2C" }) {
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("customer@vanom.com");
  const [password, setPassword] = useState("Password123!");
  const [firstName, setFirstName] = useState("Ramesh");
  const [lastName, setLastName] = useState("Sharma");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleQuickDemo = (demoType) => {
    setSelectedRole(demoType);
    setErrorMessage("");
    if (demoType === "ADMIN") {
      setEmail("admin@vanom.com");
      setPassword("Password123!");
    } else if (demoType === "B2B") {
      setEmail("buyer@agrowholesale.in");
      setPassword("Password123!");
    } else {
      setEmail("customer@vanom.com");
      setPassword("Password123!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      let data;
      if (isSignUp) {
        data = await Api.auth.register({
          email,
          password,
          firstName,
          lastName,
          phone,
          customerType: selectedRole === "B2B" ? "B2B" : "B2C",
        });
      } else {
        data = await Api.auth.login({ email, password });
      }

      const user = data?.user || data;
      const tokens = data?.tokens;

      if (!user) {
        throw new Error("Invalid response from server. User payload missing.");
      }

      login(user, tokens);
      addToast({
        title: isSignUp ? "Account Created" : "Welcome Back",
        message: `Logged in as ${user?.firstName || user?.email || "User"}`,
        type: "success",
      });

      if (onSuccess) {
        onSuccess(user);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err.message || (isSignUp ? "Failed to create account." : "Invalid email or password.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-border/80 bg-gradient-to-b from-[#F0FDF4] to-white">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Vanom" className="h-8 w-auto object-contain" />
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {isSignUp ? "Create Your Vanom Account" : "Sign In to Complete Order"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isSignUp
                  ? "Join Vanom to order, track shipments, and earn rewards"
                  : "Sign in to securely process and track your checkout"}
              </p>
            </div>
          </div>

          {/* Quick Demo Selector */}
          {!isSignUp && (
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Demo Login:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("B2C")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    selectedRole === "B2C"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-white text-text-secondary border border-border hover:bg-surface-muted"
                  }`}
                >
                  Consumer (B2C)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("B2B")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    selectedRole === "B2B"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-white text-text-secondary border border-border hover:bg-surface-muted"
                  }`}
                >
                  Wholesale (B2B)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSignUp && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-primary">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:border-brand-500 focus:outline-none"
                    placeholder="Ramesh"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-primary">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:border-brand-500 focus:outline-none"
                    placeholder="Sharma"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:border-brand-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-primary">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border focus:border-brand-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-primary">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-border focus:border-brand-500 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold shadow-sm mt-2"
            isLoading={loading}
          >
            {isSignUp ? "Create Account & Continue" : "Sign In & Continue Checkout"}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage("");
              }}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "New to Vanom? Create an account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
