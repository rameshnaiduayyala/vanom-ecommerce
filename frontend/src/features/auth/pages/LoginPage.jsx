import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/auth.store.js";
import { useUIStore } from "../../../stores/ui.store.js";
import { Api } from "../../../services/api/api-client.js";
import { ROUTES } from "../../../constants/routes.js";
import { Building2, ShieldCheck, User, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Badge } from "../../../components/ui/Badge.jsx";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await Api.auth.login({ email, password });
      login(data.user, data.tokens);
      addToast({
        title: "Welcome Back",
        message: `Logged in as ${data.user.firstName || data.user.email}`,
        type: "success",
      });

      if (data.user.roles?.includes("ADMIN") || data.user.roles?.includes("SUPER_ADMIN")) {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else if (data.user.customerType === "B2B") {
        navigate(ROUTES.B2B.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      addToast({
        title: "Authentication Failed",
        message: err.message || "Invalid credentials",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoType) => {
    if (demoType === "ADMIN") {
      setEmail("admin@vanom.com");
      setPassword("AdminPassword123!");
    } else if (demoType === "B2B") {
      setEmail("buyer@agrowholesale.in");
      setPassword("WholesalePass123!");
    } else {
      setEmail("customer@example.com");
      setPassword("CustomerPass123!");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Vanom"
            className="h-12 w-auto object-contain mx-auto mb-2"
          />
          <h2 className="text-2xl font-bold text-text-primary">Sign in to Vanom</h2>
          <p className="text-xs text-text-muted">Enter your credentials or choose a quick demo role</p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2.5">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            ⚡ Quick Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("B2C")}
              className="p-2 rounded-lg bg-white border border-border hover:border-brand-400 text-xs font-semibold text-text-primary flex flex-col items-center gap-1 shadow-2xs transition-all"
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>B2C Retail</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("B2B")}
              className="p-2 rounded-lg bg-white border border-border hover:border-gold-400 text-xs font-semibold text-text-primary flex flex-col items-center gap-1 shadow-2xs transition-all"
            >
              <Building2 className="w-4 h-4 text-gold-600" />
              <span>B2B Wholesale</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("ADMIN")}
              className="p-2 rounded-lg bg-white border border-border hover:border-red-400 text-xs font-semibold text-text-primary flex flex-col items-center gap-1 shadow-2xs transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Admin Plane</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-border space-y-4 shadow-sm">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-text-secondary">Password</label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-brand-600 hover:underline">
                Forgot?
              </Link>
            </div>
            <Input
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-xs" isLoading={loading}>
            Sign In
          </Button>

          <p className="text-center text-xs text-text-muted pt-2">
            Don't have an account?{" "}
            <Link to={ROUTES.REGISTER} className="text-brand-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
