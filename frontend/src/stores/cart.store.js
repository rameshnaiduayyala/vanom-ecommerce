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

      syncCartFromApi: (data) => {
        if (!data) return;
        const rawItems = data.items || [];
        const items = rawItems.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          productId: item.productId,
          name: item.name || item.productName || item.variantName || item.product?.name || "Product",
          slug: item.slug || item.product?.slug || "",
          price: Number(item.price || item.unitPrice || item.product?.basePrice || 0),
          quantity: item.quantity || 1,
          maxStock: item.availableStock !== undefined ? item.availableStock : (item.maxStock ?? 100),
          image: item.image || item.imageUrl || item.product?.images?.[0]?.url || null,
          sku: item.sku || item.variant?.sku || item.product?.sku || null,
        }));
        const subtotal = Number(data.subtotal || items.reduce((sum, i) => sum + i.price * i.quantity, 0));
        const itemCount = Number(data.itemCount || items.reduce((sum, i) => sum + i.quantity, 0));

        set({
          cart: {
            id: data.id,
            items,
            itemCount,
            subtotal,
          },
        });
      },

      // Fetch cart directly from API (if logged in)
      fetchCart: async () => {
        const token = TokenStorage.getAccessToken();
        if (!token) return;

        try {
          set({ isLoading: true });
          const res = await Api.cart.getCart();
          const data = res?.data || res;
          if (data) {
            get().syncCartFromApi(data);
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

        const productId = item.productId || item.id;
        const variantId = (item.variantId && item.variantId !== productId) ? item.variantId : null;
        const cleanItem = {
          ...item,
          productId,
          variantId,
          id: item.id || productId,
          quantity: item.quantity || 1,
        };

        // 1. Optimistic UI update
        const existingIndex = cart.items.findIndex(
          (i) => i.id === cleanItem.id || (variantId && i.variantId === variantId) || (i.productId === productId && !variantId)
        );

        let updatedItems = [];
        if (existingIndex > -1) {
          updatedItems = cart.items.map((it, idx) =>
            idx === existingIndex
              ? { ...it, quantity: it.quantity + cleanItem.quantity }
              : it
          );
        } else {
          updatedItems = [...cart.items, cleanItem];
        }

        const subtotal = updatedItems.reduce(
          (sum, it) => sum + (Number(it.price || it.unitPrice || 0) * it.quantity),
          0
        );
        const itemCount = updatedItems.reduce((sum, it) => sum + it.quantity, 0);

        set({
          cart: {
            ...cart,
            items: updatedItems,
            itemCount,
            subtotal,
          },
        });

        // 2. Sync to Backend API if user is authenticated
        if (token) {
          try {
            const res = await Api.cart.addItem({
              productId,
              variantId,
              quantity: cleanItem.quantity,
            });
            const data = res?.data || res;
            if (data?.items) {
              get().syncCartFromApi(data);
            }
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
            ...cart,
            items: updatedItems,
            itemCount,
            subtotal,
          },
        });

        if (token) {
          try {
            const res = await Api.cart.updateItem(id, { quantity });
            const data = res?.data || res;
            if (data?.items) {
              get().syncCartFromApi(data);
            }
          } catch (err) {
            console.warn("Backend cart update error:", err.message);
          }
        }
      },

      // Remove Item with local persist + API sync
      removeItem: async (id) => {
        const token = TokenStorage.getAccessToken();
        const { cart } = get();
        const updatedItems = cart.items.filter((it) => it.id !== id && it.productId !== id);
        const subtotal = updatedItems.reduce(
          (sum, it) => sum + (Number(it.price || it.unitPrice || 0) * it.quantity),
          0
        );
        const itemCount = updatedItems.reduce((sum, it) => sum + it.quantity, 0);

        set({
          cart: {
            ...cart,
            items: updatedItems,
            itemCount,
            subtotal,
          },
        });

        if (token) {
          try {
            const res = await Api.cart.removeItem(id);
            const data = res?.data || res;
            if (data?.items) {
              get().syncCartFromApi(data);
            }
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
