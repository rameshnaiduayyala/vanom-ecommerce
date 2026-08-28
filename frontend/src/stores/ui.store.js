import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  toasts: [],

  addToast: (toastInput) => {
    // Support both object { title, message, type } or direct string args
    const isObj = typeof toastInput === "object" && toastInput !== null;
    const title = isObj ? toastInput.title : toastInput;
    const message = isObj ? toastInput.message : "";
    const type = isObj ? toastInput.type || "info" : "info";
    const duration = isObj ? (toastInput.duration ?? 4500) : 4500;
    const action = isObj ? toastInput.action : null;

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const createdAt = new Date();

    const newToast = {
      id,
      title,
      message,
      type,
      duration,
      action,
      createdAt,
    };

    set((state) => ({
      // Keep maximum 4 active toasts on screen
      toasts: [newToast, ...state.toasts.slice(0, 3)],
    }));

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

  clearAllToasts: () => set({ toasts: [] }),

  // Modal state
  modal: null,
  openModal: (modalConfig) => set({ modal: modalConfig }),
  closeModal: () => set({ modal: null }),
}));

// Ergonomic helper callable from anywhere
export const toast = {
  success: (title, message, options = {}) =>
    useUIStore.getState().addToast({ title, message, type: "success", ...options }),
  error: (title, message, options = {}) =>
    useUIStore.getState().addToast({ title, message, type: "error", ...options }),
  warning: (title, message, options = {}) =>
    useUIStore.getState().addToast({ title, message, type: "warning", ...options }),
  info: (title, message, options = {}) =>
    useUIStore.getState().addToast({ title, message, type: "info", ...options }),
  dismiss: (id) => useUIStore.getState().removeToast(id),
};
