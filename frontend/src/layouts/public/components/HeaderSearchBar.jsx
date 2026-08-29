import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ROUTES } from "../../../constants/routes.js";

export function HeaderSearchBar({ className = "" }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH || "/products"}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex items-center w-full transition-all duration-200 ${className}`}
    >
      <div
        className={`flex items-center w-full bg-surface-muted rounded-2xl border transition-all duration-200 overflow-hidden ${
          searchFocused
            ? "border-brand-500 bg-white ring-4 ring-brand-100/70 shadow-sm"
            : "border-border hover:border-slate-300"
        }`}
      >
        <div className="pl-4 text-text-muted flex items-center pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search 10,000+ products, categories, SKUs..."
          className="w-full py-2.5 pl-3 pr-10 text-xs sm:text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-12 text-text-muted hover:text-text-primary p-1"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default HeaderSearchBar;
