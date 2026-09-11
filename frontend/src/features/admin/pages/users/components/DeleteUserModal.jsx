import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../../../../../components/ui/Button.jsx";

export function DeleteUserModal({ user, isOpen, onClose, onConfirm, isPending }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-border shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-bold text-base text-[#0F2B1C]">Delete User Account?</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-text-primary">
              {user.firstName} {user.lastName} ({user.email})
            </strong>
            ? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="text-xs w-1/2">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(user.id)}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs w-1/2 shadow-sm"
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
