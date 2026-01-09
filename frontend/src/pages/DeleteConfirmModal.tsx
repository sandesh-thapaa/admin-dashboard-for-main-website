import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting?: boolean; // Optional: won't break other pages
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false, // Defaults to false for other pages
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#102359]/40 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-black text-[#102359] mb-2">
            Delete Item?
          </h3>
          <p className="text-slate-500 font-medium text-sm px-4">
            Are you sure you want to remove{" "}
            <span className="font-bold text-red-500">"{itemName}"</span>? This
            action cannot be undone.
          </p>
        </div>

        <div className="px-8 pb-8 flex gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-[1.5] py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
