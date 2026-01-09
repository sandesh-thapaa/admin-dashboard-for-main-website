import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../pages/Sidebar";
import MobileNav from "../pages/MobileNav";

const ProtectedRoute = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <div className="lg:hidden shrink-0">
          <MobileNav />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
