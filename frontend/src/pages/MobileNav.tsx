import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  GraduationCap,
  Tv,
  Briefcase,
  Search,
  LayoutGrid,
  FolderOpen,
  X,
} from "lucide-react";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // To check which link is active

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      url: "/dashboard",
      exact: true,
    },
    { id: "teams", label: "Team", icon: Users, url: "/dashboard/teams" },
    { id: "mentors", label: "Mentors", icon: Users, url: "/dashboard/mentors" },
    {
      id: "interns-list",
      label: "Interns",
      icon: GraduationCap,
      url: "/dashboard/interns",
    },
    {
      id: "trainings",
      label: "Training",
      icon: Tv,
      url: "/dashboard/trainings",
    },
    {
      id: "internships-posts",
      label: "Internships",
      icon: Briefcase,
      url: "/dashboard/internships",
    },
    { id: "jobs-posts", label: "Jobs", icon: Search, url: "/dashboard/jobs" },
    {
      id: "services",
      label: "Services",
      icon: LayoutGrid,
      url: "/dashboard/services",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      url: "/dashboard/projects",
    },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-primary-dark border-b border-white/10 relative z-[100]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            src="/Logo2.png"
            alt="Logo"
            className="w-full h-auto object-contain"
          />
        </div>
        <span className="font-extrabold text-white tracking-tight text-base sm:text-lg">
          LeafClutch Technologies
        </span>
      </div>

      {/* Menu Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-xl transition-all active:scale-95 ${
            isOpen ? "bg-[#3AE39E] text-[#081E67]" : "bg-white/10 text-white"
          }`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-slate-400 uppercase px-4 py-2 tracking-widest">
                  Main Menu
                </p>

                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;

                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#3AE39E]/10 text-[#081E67]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#3AE39E]"
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="h-px bg-slate-100 my-2 mx-2" />

                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
