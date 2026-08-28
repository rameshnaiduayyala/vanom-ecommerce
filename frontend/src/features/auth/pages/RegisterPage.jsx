import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "../../../services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { Building2, User, Lock, Mail } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [customerType, setCustomerType] = useState("B2C");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await Api.auth.register({
        ...formData,
        customerType,
      });

      login(data.user, data.tokens);
      addToast({
        title: "Account Created!",
        message: `Welcome to Vanom, ${data.user.firstName}!`,
        type: "success",
      });

      if (customerType === "B2B") {
        navigate(ROUTES.B2B.COMPANY_PROFILE);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      addToast({
        title: "Registration Failed",
        message: err.message || "Failed to create account",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-text-primary">Create your Vanom Account</h2>
          <p className="text-xs text-text-muted">Choose your purchasing model to get started</p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCustomerType("B2C")}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
              customerType === "B2C"
                ? "border-brand-500 bg-brand-50/50 shadow-xs"
                : "border-border bg-white hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
              <User className="w-4 h-4 text-brand-600" />
              <span>B2C Retail Buyer</span>
            </div>
            <span className="text-[10px] text-text-muted">Personal gardens, pots & foliage</span>
          </button>

          <button
            type="button"
            onClick={() => setCustomerType("B2B")}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
              customerType === "B2B"
                ? "border-gold-500 bg-gold-50/50 shadow-xs"
                : "border-border bg-white hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
              <Building2 className="w-4 h-4 text-gold-600" />
              <span>B2B Wholesale</span>
            </div>
            <span className="text-[10px] text-text-muted">Pallets, invoices & credit terms</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-border space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
            required
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimum 8 characters"
            required
          />

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-xs" isLoading={loading}>
            Create {customerType === "B2B" ? "Wholesale" : "Retail"} Account
          </Button>

          <p className="text-center text-xs text-text-muted pt-2">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-6 rounded-2xl bg-white border border-border space-y-5 text-center shadow-sm">
        <h2 className="text-xl font-bold text-text-primary">Reset Password</h2>
        <p className="text-xs text-text-muted">Enter your registered email address to receive recovery instructions.</p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            Password reset link has been dispatched to <strong>{email}</strong>.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              Send Reset Link
            </Button>
          </form>
        )}

        <Link to={ROUTES.LOGIN} className="block text-xs text-brand-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
