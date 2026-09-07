import React, { useState, useMemo } from "react";
import { cn } from "../../utils/cn.js";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  Loader2,
  Inbox,
} from "lucide-react";

/**
 * @typedef {Object} Column
 * @property {string} key - Unique key corresponding to data accessor
 * @property {string|React.ReactNode} header - Header label
 * @property {Function} [render] - Custom cell renderer (row, index) => ReactNode
 * @property {boolean} [sortable] - Enables click-to-sort on this column
 * @property {string} [align] - 'left' | 'center' | 'right'
 * @property {string} [width] - Custom width class or style (e.g. 'w-48')
 * @property {string} [className] - Column specific CSS class
 */

/**
 * DataTable Component
 * Fully reusable, enterprise-grade data table with built-in search, sorting, pagination,
 * selectable rows, loading state, and custom empty states.
 */
export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  searchable = false,
  searchPlaceholder = "Search records...",
  searchKeys = [],
  selectable = false,
  selectedRows = [],
  onSelectRows,
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage = "No records found.",
  emptyIcon: EmptyIcon = Inbox,
  actions,
  className,
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(pageSize);

  // 1. Search Filter
  const filteredData = useMemo(() => {
    if (!search || search.trim() === "") return data;
    const query = search.toLowerCase().trim();

    return data.filter((row) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = row[k];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
      }
      return Object.values(row).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, search, searchKeys]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / limit) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * limit;
    return sortedData.slice(startIndex, startIndex + limit);
  }, [sortedData, currentPage, limit, pagination]);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (e) => {
    if (!onSelectRows) return;
    if (e.target.checked) {
      onSelectRows(paginatedData.map((row) => row.id || row));
    } else {
      onSelectRows([]);
    }
  };

  const handleSelectRow = (id) => {
    if (!onSelectRows) return;
    if (selectedRows.includes(id)) {
      onSelectRows(selectedRows.filter((r) => r !== id));
    } else {
      onSelectRows([...selectedRows, id]);
    }
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(row.id || row));

  return (
    <div className={cn("w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", className)}>
      {/* ── Table Top Toolbar (Search, Filter, Actions) ── */}
      {(searchable || actions) && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#006B3C] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          )}

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* ── Table Container ── */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 select-none">
            <tr>
              {selectable && (
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={cn(
                      "p-4 font-bold transition-colors",
                      col.sortable && "cursor-pointer hover:text-slate-900 hover:bg-slate-100/60",
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left",
                      col.width,
                      col.className
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "right" && "justify-end w-full",
                        col.align === "center" && "justify-center w-full"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#006B3C]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#006B3C]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-7 h-7 animate-spin text-[#006B3C]" />
                    <span className="text-xs font-medium">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-14 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <EmptyIcon className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">{emptyMessage}</p>
                    {search && (
                      <p className="text-[11px] text-slate-400">
                        No matches found for "{search}". Try searching for something else.
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id || idx;
                const isSelected = selectedRows.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "hover:bg-slate-50/70 transition-colors",
                      isSelected && "bg-emerald-50/40"
                    )}
                  >
                    {selectable && (
                      <td className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="accent-[#006B3C] w-4 h-4 rounded cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "p-4",
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left",
                          col.className
                        )}
                      >
                        {col.render ? col.render(row, idx) : row[col.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Bottom Pagination ── */}
      {pagination && sortedData.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-slate-800 font-semibold">
                {Math.min((currentPage - 1) * limit + 1, sortedData.length)}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800 font-semibold">
                {Math.min(currentPage * limit, sortedData.length)}
              </strong>{" "}
              of <strong className="text-slate-800 font-semibold">{sortedData.length}</strong> entries
            </span>

            {pageSizeOptions && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span>Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-medium outline-none cursor-pointer"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-[#003D2B] text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
