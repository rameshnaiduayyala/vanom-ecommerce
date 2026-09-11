import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { toast } from "@/components/ui/Toast.jsx";

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => Api.admin.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (newCat) => Api.admin.createCategory(newCat),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      toast.success(
        "Category Created",
        `Category "${created.name || created.data?.name || "New Category"}" created successfully.`
      );
    },
    onError: (err) => {
      toast.error("Creation Failed", err.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateCategory(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      toast.success(
        "Category Updated",
        `Category "${updated.name || updated.data?.name || "Category"}" updated successfully.`
      );
    },
    onError: (err) => {
      toast.error("Update Failed", err.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["home-categories"] });
      toast.success("Category Deleted", "Category removed successfully.");
    },
    onError: (err) => {
      toast.error("Deletion Failed", err.message || "Failed to delete category");
    },
  });

  const categories = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : Array.isArray(categoriesQuery.data?.items)
    ? categoriesQuery.data.items
    : [];

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
