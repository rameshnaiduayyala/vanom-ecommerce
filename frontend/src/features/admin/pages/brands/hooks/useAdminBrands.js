import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

export function useAdminBrands() {
  const queryClient = useQueryClient();

  const brandsQuery = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => Api.brands.getBrands({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (newBrand) => Api.brands.createBrand(newBrand),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      const created = res?.data || res;
      toast.success(
        "Brand Created",
        `Brand "${created.name || "New Brand"}" created successfully.`
      );
    },
    onError: (err) => {
      toast.error("Creation Failed", err.response?.data?.message || err.message || "Failed to create brand");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Api.brands.updateBrand(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      const updated = res?.data || res;
      toast.success(
        "Brand Updated",
        `Brand "${updated.name || "Brand"}" updated successfully.`
      );
    },
    onError: (err) => {
      toast.error("Update Failed", err.response?.data?.message || err.message || "Failed to update brand");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Api.brands.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand Deleted", "Brand removed successfully.");
    },
    onError: (err) => {
      toast.error("Deletion Failed", err.response?.data?.message || err.message || "Failed to delete brand");
    },
  });

  const brands = Array.isArray(brandsQuery.data)
    ? brandsQuery.data
    : Array.isArray(brandsQuery.data?.items)
    ? brandsQuery.data.items
    : [];

  return {
    brands,
    isLoading: brandsQuery.isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
