import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserCard from "./UserCard";
import AddUserCard from "./AddUserCard";
import AddUserModal from "./AddUserModal";
// import DeleteConfirmModal from "../DeleteConfirmModal";
import type { User } from "../../types/user";
import { userService } from "../../services/userService";
import {
  ChevronRight,
  Search,
  Filter,
  Plus,
  // Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface EntityPageProps {
  type: "interns" | "teams";
}

const UserPage: React.FC<EntityPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeamMode = type === "teams";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // const [deleteId, setDeleteId] = useState<string | null>(null);
  // const [isDeleting, setIsDeleting] = useState(false);
  // const [userToDelete, setUserToDelete] = useState<string>("");

  const isNewPath = location.pathname.endsWith("/new");
  const isEditPath = location.pathname.includes("/edit/");
  const isModalOpen = isNewPath || isEditPath;

  const editingId = useMemo(() => {
    if (isEditPath) {
      const parts = location.pathname.split("/");
      return parts[parts.length - 1];
    }
    return null;
  }, [location.pathname, isEditPath]);

  const editingUser = useMemo(
    () => users.find((u) => u.id === editingId) || null,
    [editingId, users]
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const allMembers = await userService.getAll();

      // 1. Filter by role
      const filteredData = allMembers.filter((u) => {
        if (isTeamMode) {
          return u.role === "TEAM";
        } else {
          return u.role === "INTERN";
        }
      });

      const sortedData = filteredData.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setUsers(sortedData);
    } catch (error) {
      toast.error(`Failed to load ${type}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isTeamMode, type]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenAddModal = () => navigate("new");
  const handleEditClick = (user: User) => navigate(`edit/${user.id}`);
  const handleCloseModal = () =>
    navigate(`/dashboard/${type}`, { replace: true });

  // const openDeleteModal = (user: User) => {
  //   setDeleteId(user.id);
  //   setUserToDelete(user.name);
  // };

  // const handleConfirmDelete = async () => {
  //   if (!deleteId) return;

  //   setIsDeleting(true);
  //   const originalUsers = [...users];
  //   setUsers((prev) => prev.filter((u) => u.id !== deleteId));

  //   try {
  //     await userService.delete(deleteId);

  //     toast.success(`${isTeamMode ? "Member" : "Intern"} removed.`, {
  //       icon: <Trash2 size={18} className="text-white" />,
  //       style: { background: "#EF4444", color: "#fff", border: "none" },
  //     });
  //     setDeleteId(null);
  //   } catch {
  //     setUsers(originalUsers);
  //     toast.error("Failed to remove user");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    // 1. Optimistic Update: Change UI immediately
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_visible: !currentStatus } : u))
    );

    try {
      // 2. API Call
      await userService.update(id, { is_visible: !currentStatus });
      toast.success(
        !currentStatus ? "Visible on website" : "Hidden from website"
      );
    } catch {
      // 3. Revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_visible: currentStatus } : u))
      );
      toast.error("Failed to update visibility. Reverting change...");
    }
  };

  const handleRefresh = () => {
    loadUsers();
    handleCloseModal();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
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
              <span className="text-[#102359] capitalize">{type}</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#102359] tracking-tight">
              {isTeamMode ? "Team Management" : "Intern Management"}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-[#3AE39E] shadow-sm transition-all"
                placeholder={`Search ${type}...`}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
                <Filter size={18} /> Filter
              </button>
              <button
                onClick={handleOpenAddModal}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#3AE39E] text-[#081E67] rounded-xl text-sm font-extrabold shadow-md hover:brightness-105 transition-all"
              >
                <Plus size={18} strokeWidth={3} /> Add New{" "}
                {isTeamMode ? "Member" : "Intern"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-8 pb-12">
        <div className="max-w-[1400px] mx-auto w-full">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
              <Loader2 className="animate-spin h-10 w-10 text-[#3AE39E]" />
              <span className="font-bold text-[#102359]">
                Loading {type}...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  // onDelete={() => openDeleteModal(user)}
                  onEdit={() => handleEditClick(user)}
                  onToggleVisibility={() =>
                    handleToggleVisibility(user.id, user.is_visible)
                  }
                />
              ))}
              <AddUserCard type={type} onClick={handleOpenAddModal} />
            </div>
          )}
        </div>
      </div>

      <AddUserModal
        key={editingId || "new"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleRefresh}
        initialData={editingUser}
        type={type}
      />
      {/* 
      <DeleteConfirmModal
        isOpen={!!deleteId}
        isDeleting={isDeleting}
        itemName={userToDelete}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      /> */}
    </div>
  );
};

export default UserPage;
