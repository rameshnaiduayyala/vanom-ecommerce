import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Api } from "@/services/api/api-client.js";
import { useUIStore } from "@/stores/ui.store.js";

export function useResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();
  const { addToast } = useUIStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (!token || token.length < 20) {
      setErrorMessage("Invalid or missing password reset token. Please request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await Api.auth.resetPassword(token, password);
      setSuccess(true);
      addToast({
        title: "Password Updated",
        message: "Your password has been reset. You can now sign in.",
        type: "success",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Reset link is invalid or expired. Please request a new one.";
      setErrorMessage(msg);
      addToast({
        title: "Reset Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    errorMessage,
    success,
    handleSubmit,
  };
}

export default useResetPasswordForm;
