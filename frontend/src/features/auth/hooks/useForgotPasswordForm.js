import { useState } from "react";
import { Api } from "@/services/api/api-client.js";
import { useUIStore } from "@/stores/ui.store.js";

export function useForgotPasswordForm() {
  const { addToast } = useUIStore();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      if (Api.auth.forgotPassword) {
        await Api.auth.forgotPassword({ email: email.trim().toLowerCase() });
      }
      setSubmitted(true);
      addToast({
        title: "Instructions Dispatched",
        message: `Password reset instructions sent to ${email}`,
        type: "success",
      });
    } catch (err) {
      // In production security, we generally display success or note dispatch
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    submitted,
    loading,
    errorMessage,
    handleSubmit,
  };
}

export default useForgotPasswordForm;
