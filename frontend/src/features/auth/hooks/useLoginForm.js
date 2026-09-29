import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.js";
import { useUIStore } from "@/stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "@/constants/routes.js";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const executeLogin = async (loginEmail, loginPassword) => {
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await Api.auth.login({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      const user = data?.user || data;
      const token = data?.token || data?.tokens?.accessToken || data?.accessToken;
      const tokens = typeof data?.tokens === "object" ? data.tokens : { accessToken: token };

      if (!user) {
        throw new Error("Invalid response from server. User payload missing.");
      }

      login(user, tokens);

      addToast({
        title: "Welcome Back",
        message: `Logged in as ${user?.firstName || user?.name || user?.email || "User"}`,
        type: "success",
      });

      const role = user?.role;
      const roles = Array.isArray(user?.roles) ? user.roles : [];
      const isAdmin =
        role === "SUPERADMIN" ||
        role === "ADMIN" ||
        roles.includes("ADMIN") ||
        roles.includes("SUPER_ADMIN") ||
        roles.includes("SUPERADMIN");

      if (isAdmin) {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else if (user?.customerType === "B2B" || user?.bulkBusiness) {
        navigate(ROUTES.B2B.DASHBOARD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password. Please verify your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }
    await executeLogin(email, password);
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    await executeLogin(quickEmail, quickPassword);
  };

  const handleFillCredentials = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setErrorMessage("");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    errorMessage,
    setErrorMessage,
    handleSubmit,
    handleQuickLogin,
    handleFillCredentials,
  };
}

export default useLoginForm;
