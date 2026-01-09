import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { logout } from "../api/axios";

const LogoutConfirm: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => navigate(-1)}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogOut size={32} className="text-red-500" />
          </div>

          <h3 className="text-xl font-black text-slate-800 mb-2">Logout?</h3>
          <p className="text-slate-500 text-sm mb-8">
            Are you sure you want to end your session? You'll need to log in
            again.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => logout()}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200"
            >
              Log Out
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-slate-50 text-slate-500 font-bold rounded-xl hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
