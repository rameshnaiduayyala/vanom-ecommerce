import { create } from "zustand";
import { SUPPORTED_COUNTRIES } from "../constants/countries.js";

const DEFAULT_COUNTRY = SUPPORTED_COUNTRIES[0]; // India (IN / INR)

export const useCountryStore = create((set) => ({
  country: DEFAULT_COUNTRY,
  setCountryByCode: (code) => {
    const matched = SUPPORTED_COUNTRIES.find((c) => c.code === code) || DEFAULT_COUNTRY;
    set({ country: matched });
  },
  setCountry: (country) => set({ country }),
}));
