import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import TrainingList from "./TrainingList";
import TrainingDetails from "./TrainingDetails";
import AddProgram from "./TrainingForm";
import { ChevronRight, Search, Filter, Plus } from "lucide-react";

const Training: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const isListView =
    location.pathname === "/dashboard/trainings" ||
    location.pathname === "/dashboard/trainings/";

  return (
    <div className="bg-[#F8FAFC] text-[#102359] font-sans antialiased overflow-hidden h-screen flex flex-col">
      {isListView && (
        <header className="shrink-0 px-4 md:px-8 pt-8 pb-6 bg-[#F8FAFC] sticky top-0 z-10">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                <Link
                  className="hover:text-[#3AE39E] transition-colors"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
                <ChevronRight size={14} />
                <span className="text-[#102359]">Trainings</span>
              </nav>
              <h1 className="text-3xl font-extrabold text-[#102359] tracking-tight">
                Training Management
              </h1>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search
                    size={18}
                    className="text-slate-400 group-focus-within:text-[#3AE39E] transition-colors"
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-[#3AE39E] outline-none shadow-sm transition-all"
                  placeholder="Search programs..."
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                  <Filter size={18} /> Filter
                </button>
                <Link
                  to="new"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#3AE39E] text-[#081E67] rounded-xl text-sm font-extrabold hover:brightness-105 transition-all shadow-md"
                >
                  <Plus size={18} strokeWidth={3} /> Add New Program
                </Link>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden relative">
        <Routes>
          <Route index element={<TrainingList searchQuery={searchQuery} />} />
          <Route path="new" element={<AddProgram />} />

          <Route path=":id" element={<TrainingDetails />} />

          <Route path=":id/edit" element={<AddProgram />} />

          <Route
            path="*"
            element={
              <div className="p-10 text-center">
                <h1 className="text-3xl font-bold text-slate-300">
                  Program Not Found
                </h1>
                <Link
                  to="/dashboard/trainings"
                  className="text-[#3AE39E] hover:underline mt-4 inline-block"
                >
                  Back to Trainings
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default Training;
