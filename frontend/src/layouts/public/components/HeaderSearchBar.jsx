import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { ROUTES } from "../../../constants/routes.js";

export function HeaderSearchBar({ className = "" }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH || "/products"}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`flex items-center w-full ${className}`}
    >
      <div className="flex items-center w-full bg-white rounded-none overflow-hidden h-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products, brands, SKUs..."
          className="w-full h-full px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="px-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="h-full px-5 bg-[#FFE000] hover:bg-[#FFD100] text-[#003876] font-black text-sm transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}

export default HeaderSearchBar;
