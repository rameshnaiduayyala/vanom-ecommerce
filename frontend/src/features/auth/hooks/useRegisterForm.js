import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.js";
import { useCountryStore } from "@/stores/country.store.js";
import { useUIStore } from "@/stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "@/constants/routes.js";
import { SUPPORTED_COUNTRIES } from "@/constants/countries.js";

export function useRegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countriesList, setCountriesList] = useState(SUPPORTED_COUNTRIES);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    countryCode: country?.code || "IN",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadCountries() {
      try {
        const data = await Api.geography.getCountries();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCountriesList(data);
        }
      } catch {
        // Fallback list is already set
      }
    }
    loadCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await Api.auth.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        countryCode: formData.countryCode,
        customerType: "B2C",
      });

      const user = data?.user || data?.data?.user || data;
      const tokens = data?.tokens || data?.data?.tokens;

      if (user) {
        login(user, tokens);
      }

      addToast({
        title: "Account Created!",
        message: `Welcome to Vanom, ${formData.firstName || formData.email}!`,
        type: "success",
      });

      navigate(ROUTES.HOME);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create account. Please check your details and try again.";
      setErrorMessage(msg);
      addToast({
        title: "Registration Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    countriesList,
    loading,
    errorMessage,
    handleChange,
    handleSubmit,
  };
}

export default useRegisterForm;
