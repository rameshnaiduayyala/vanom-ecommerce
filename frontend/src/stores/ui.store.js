import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  toasts: [],

  addToast: ({ title, message, type = "info", duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, title, message, type };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    return id;
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // Modal / Confirm state
  modal: null,
  openModal: (modalConfig) => set({ modal: modalConfig }),
  closeModal: () => set({ modal: null }),
}));
