import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCountryStore } from "@/stores/country.store.js";
import { useUIStore } from "@/stores/ui.store.js";
import { Api } from "@/services/api/api-client.js";
import { ROUTES } from "@/constants/routes.js";
import { SUPPORTED_COUNTRIES } from "@/constants/countries.js";

export function useBusinessRegistration() {
  const navigate = useNavigate();
  const { country } = useCountryStore();
  const { addToast } = useUIStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countriesList, setCountriesList] = useState(SUPPORTED_COUNTRIES);

  const [formData, setFormData] = useState({
    // Step 1: Company & Address Details
    businessName: "",
    legalName: "",
    registrationNumber: "",
    taxId: "",
    countryCode: country?.code || "IN",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",

    // Step 2: Admin User Credentials
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
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
        // Keep default fallback list
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

  const validateStep1 = () => {
    if (
      !formData.businessName.trim() ||
      !formData.legalName.trim() ||
      !formData.addressLine1.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setErrorMessage("Please fill in all required company and address details before proceeding.");
      addToast({
        title: "Required Fields Missing",
        message: "Please fill in all required company and address details before proceeding.",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleNext = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setErrorMessage("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setErrorMessage("");

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage("Please provide administrator contact details and password.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const fullAddress = `${formData.addressLine1}${formData.addressLine2 ? `, ${formData.addressLine2}` : ""}, ${formData.city}, ${formData.state} - ${formData.postalCode}`;
      const contactPerson = `${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "Account Admin";

      const businessPayload = {
        businessName: formData.businessName.trim(),
        businessEmail: formData.email.trim().toLowerCase(),
        businessPhone: formData.phone.trim() || "—",
        taxRegistrationNumber: formData.taxId ? formData.taxId.trim() : null,
        registrationNumber: formData.registrationNumber ? formData.registrationNumber.trim() : null,
        countryCode: (formData.countryCode || country?.code || "IN").toUpperCase(),
        address: fullAddress,
        contactPersonName: contactPerson,
      };

      await Api.b2b.registerCompany({
        ...businessPayload,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      });

      addToast({
        title: "Application Submitted Successfully!",
        message: `${formData.businessName} has been submitted for wholesale B2B approval.`,
        type: "success",
      });

      navigate(ROUTES.REGISTER_BUSINESS_SUCCESS, {
        state: {
          businessName: formData.businessName,
          legalName: formData.legalName,
          adminEmail: formData.email,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to register company. Please check your credentials.";
      setErrorMessage(msg);
      addToast({
        title: "Business Registration Failed",
        message: msg,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    loading,
    errorMessage,
    countriesList,
    formData,
    handleChange,
    handleNext,
    handleBack,
    handleSubmit,
    validateStep1,
  };
}

export default useBusinessRegistration;
