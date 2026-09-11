import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/services/api/api-client.js";
import { useUIStore } from "@/stores/ui.store.js";

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => Api.admin.getUsers(),
  });

  const companiesQuery = useQuery({
    queryKey: ["admin-companies-list"],
    queryFn: () => Api.admin.getCompanies(),
  });

  const createMutation = useMutation({
    mutationFn: (newUserData) => Api.admin.createUser(newUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-companies-list"] });
      addToast({
        title: "User Created",
        message: "New user account created successfully.",
        type: "success",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => Api.admin.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      addToast({
        title: "User Updated",
        message: "User account details updated successfully.",
        type: "success",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Api.admin.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      addToast({
        title: "User Deleted",
        message: "User account removed from database.",
        type: "success",
      });
    },
    onError: (err) => {
      addToast({
        title: "Delete Failed",
        message: err.message || "Could not delete user account.",
        type: "error",
      });
    },
  });

  const users = Array.isArray(usersQuery.data)
    ? usersQuery.data
    : Array.isArray(usersQuery.data?.items)
    ? usersQuery.data.items
    : [];

  const companies = Array.isArray(companiesQuery.data)
    ? companiesQuery.data
    : Array.isArray(companiesQuery.data?.items)
    ? companiesQuery.data.items
    : [];

  return {
    users,
    companies,
    isLoading: usersQuery.isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
