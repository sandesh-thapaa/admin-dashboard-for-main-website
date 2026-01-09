import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Tv,
  Briefcase,
  Search,
  LayoutGrid,
  FolderOpen,
  LogOut,
  User,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

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
    <aside className="hidden w-64 h-screen bg-primary-dark lg:flex flex-col shrink-0 sticky top-0 shadow-xl z-20">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-4 border-b   border-white/5">
        <div className="flex items-center gap-3">
          <img
            src="/Logo2.png"
            alt="Logo"
            className="h-8 w-8 block"
          />{" "}
          <h1 className="text-white text-sm font-bold tracking-tight">
            Leafclutch Technologies
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1 custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.url}
              end={item.exact}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-[#3AE39E]/10 text-[#3AE39E] border-r-4 border-[#3AE39E]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto bg-black/10">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="text-white font-bold truncate">Admin</p>
              <p className="text-[#3AE39E] text-[10px] font-bold uppercase tracking-tighter">
                Online
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/logout")}
            title="Logout"
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 group"
          >
            <LogOut
              size={18}
              className="transition-transform group-hover:scale-110"
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
