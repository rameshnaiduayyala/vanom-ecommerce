import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Api } from "@/services/api/api-client.js";
import { TokenStorage } from "@/services/storage/token.storage.js";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        itemCount: 0,
        subtotal: 0,
      },
      isOpen: false,
      isLoading: false,

      setCart: (cartData) => {
        const items = cartData?.items || [];
        const subtotal =
          cartData?.subtotal !== undefined
            ? Number(cartData.subtotal)
            : items.reduce((sum, item) => sum + Number(item.price || item.unitPrice || 0) * (item.quantity || 1), 0);
        const itemCount =
          cartData?.itemCount !== undefined
            ? Number(cartData.itemCount)
            : items.reduce((sum, item) => sum + (item.quantity || 1), 0);

        set({
          cart: {
            items,
            itemCount,
            subtotal,
            ...cartData,
          },
        });
      },

      // Fetch cart directly from API (if logged in)
      fetchCart: async () => {
        const token = TokenStorage.getAccessToken();
        if (!token) return;

        try {
          set({ isLoading: true });
          const data = await Api.cart.getCart();
          if (data) {
            const rawItems = data.items || [];
            const items = rawItems.map((item) => ({
              id: item.id,
              variantId: item.variantId,
              productId: item.productId,
              name: item.productName || item.variantName || item.name,
              slug: item.slug,
              price: Number(item.unitPrice || item.price || 0),
              quantity: item.quantity,
              maxStock: item.availableStock !== undefined ? item.availableStock : (item.maxStock ?? 100),
              image: item.image || item.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80",
              sku: item.sku,
            }));
            const subtotal = Number(data.subtotal || items.reduce((sum, i) => sum + i.price * i.quantity, 0));
            const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

            set({
              cart: {
                id: data.id,
                items,
                itemCount,
                subtotal,
              },
            });
          }
        } catch (err) {
          console.warn("Could not fetch backend cart:", err.message);
        } finally {
          set({ isLoading: false });
        }
      },

      // Add Item with local persist + API sync
      addItem: async (item) => {
        const { cart } = get();
        const token = TokenStorage.getAccessToken();

        // 1. Optimistic UI update
        const existingIndex = cart.items.findIndex(
          (i) => i.id === item.id || (item.variantId && i.variantId === item.variantId)
        );

        let updatedItems = [];
        if (existingIndex > -1) {
          updatedItems = cart.items.map((it, idx) =>
            idx === existingIndex
              ? { ...it, quantity: it.quantity + (item.quantity || 1) }
              : it
          );
        } else {
          updatedItems = [...cart.items, { ...item, quantity: item.quantity || 1 }];
        }

        const subtotal = updatedItems.reduce(
          (sum, it) => sum + (Number(it.price || it.unitPrice || 0) * it.quantity),
          0
        );
        const itemCount = updatedItems.reduce((sum, it) => sum + it.quantity, 0);

        set({
          cart: {
            items: updatedItems,
            itemCount,
            subtotal,
          },
        });

        // 2. Sync to Backend API if user is authenticated
        if (token) {
          try {
            await Api.cart.addItem({
              variantId: item.variantId || item.id,
              productId: item.productId,
              quantity: item.quantity || 1,
            });
          } catch (err) {
            console.warn("Backend cart add error:", err.message);
          }
        }
      },

      // Update Item Quantity with local persist + API sync
      updateItemQuantity: async (id, quantity) => {
        const token = TokenStorage.getAccessToken();
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const { cart } = get();
        const updatedItems = cart.items.map((it) =>
          it.id === id ? { ...it, quantity } : it
        );
        const subtotal = updatedItems.reduce(
          (sum, it) => sum + (Number(it.price || it.unitPrice || 0) * it.quantity),
          0
        );
        const itemCount = updatedItems.reduce((sum, it) => sum + it.quantity, 0);

        set({
          cart: {
            items: updatedItems,
            itemCount,
            subtotal,
          },
        });

        if (token) {
          try {
            await Api.cart.updateItem(id, { quantity });
          } catch (err) {
            console.warn("Backend cart update error:", err.message);
          }
        }
      },

      // Remove Item with local persist + API sync
      removeItem: async (id) => {
        const token = TokenStorage.getAccessToken();
        const { cart } = get();
        const updatedItems = cart.items.filter((it) => it.id !== id);
        const subtotal = updatedItems.reduce(
          (sum, it) => sum + (Number(it.price || it.unitPrice || 0) * it.quantity),
          0
        );
        const itemCount = updatedItems.reduce((sum, it) => sum + it.quantity, 0);

        set({
          cart: {
            items: updatedItems,
            itemCount,
            subtotal,
          },
        });

        if (token) {
          try {
            await Api.cart.removeItem(id);
          } catch (err) {
            console.warn("Backend cart remove error:", err.message);
          }
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      clearLocalCart: async () => {
        const token = TokenStorage.getAccessToken();
        set({
          cart: {
            items: [],
            itemCount: 0,
            subtotal: 0,
          },
        });

        if (token) {
          try {
            await Api.cart.clearCart();
          } catch (err) {}
        }
      },
    }),
    {
      name: "vanom_cart_store",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
