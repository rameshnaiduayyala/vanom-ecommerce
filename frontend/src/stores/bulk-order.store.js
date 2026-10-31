import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * useBulkOrderStore — Zustand store with localStorage persistence for B2B wholesale order sheet.
 * Preserves all selected items, quantities, and notes across page refreshes and navigation.
 */
export const useBulkOrderStore = create(
  persist(
    (set, get) => ({
      rows: [],
      notes: "",

      setRows: (updater) => {
        set((state) => ({
          rows: typeof updater === "function" ? updater(state.rows) : updater,
        }));
      },

      setNotes: (notes) => set({ notes }),

      addRow: (item) => {
        set((state) => {
          const rowKey = item.rowKey || `${item.productId}_${item.variantId || "default"}`;
          const existingIdx = state.rows.findIndex((r) => r.rowKey === rowKey);

          if (existingIdx >= 0) {
            const nextRows = [...state.rows];
            nextRows[existingIdx] = {
              ...nextRows[existingIdx],
              quantity: nextRows[existingIdx].quantity + (item.quantity || 10),
              unitPrice: item.unitPrice ?? nextRows[existingIdx].unitPrice,
            };
            return { rows: nextRows };
          }

          return { rows: [...state.rows, { ...item, rowKey }] };
        });
      },

      insertRowAt: (item, index) => {
        set((state) => {
          const rowKey = item.rowKey || `${item.productId}_${item.variantId || "default"}`;
          const existingIdx = state.rows.findIndex((r) => r.rowKey === rowKey);

          if (existingIdx >= 0) {
            const nextRows = [...state.rows];
            nextRows[existingIdx] = {
              ...nextRows[existingIdx],
              quantity: nextRows[existingIdx].quantity + (item.quantity || 10),
            };
            return { rows: nextRows };
          }

          const nextRows = [...state.rows];
          const insertIdx = Math.max(0, Math.min(index, nextRows.length));
          nextRows.splice(insertIdx, 0, { ...item, rowKey });
          return { rows: nextRows };
        });
      },

      updateRowQuantity: (index, quantity) => {
        set((state) => {
          const nextRows = [...state.rows];
          if (!nextRows[index]) return state;
          nextRows[index] = {
            ...nextRows[index],
            quantity: Math.max(1, parseInt(quantity, 10) || 1),
          };
          return { rows: nextRows };
        });
      },

      removeRow: (index) => {
        set((state) => ({
          rows: state.rows.filter((_, i) => i !== index),
        }));
      },

      clearOrderSheet: () => {
        set({ rows: [], notes: "" });
      },
    }),
    {
      name: "vanom_b2b_bulk_order_sheet",
      partialize: (state) => ({ rows: state.rows, notes: state.notes }),
    }
  )
);

