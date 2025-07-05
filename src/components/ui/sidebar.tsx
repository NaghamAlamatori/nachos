// src/components/ui/Sidebar.tsx
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Film,
  UsersRound,
  LogOut,
  StickyNote,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Users", icon: User, path: "/dashboard/users" },
  { name: "Groups", icon: UsersRound, path: "/dashboard/groups" },
  { name: "Movies", icon: Film, path: "/dashboard/movies" },
  { name: "Posts", icon: StickyNote, path: "/dashboard/posts" },
  { name: "Create User", icon: UserPlus, path: "/dashboard/usercreation" },

];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

 const handleLogout = async () => {
  const refreshToken = localStorage.getItem("refresh_token"); 
  if (!refreshToken) {
    console.error("No refresh token found");
    alert("You are not logged in.");
    return;
  }

  setLoading(true);
  try {
    await axios.post(
      "https://nachos-backend-production.up.railway.app/api/v1/auth/logout/",
      { refresh: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    localStorage.removeItem("access_token");  
    localStorage.removeItem("refresh_token"); 
    localStorage.removeItem("username");      

    navigate("/login");
  } catch (err) {
    console.error("Logout failed:", err);
    alert("Logout failed. Try again?");
  } finally {
    setLoading(false);
  }
};

  return (
    <aside className="w-64 h-full bg-[#ffffff] shadow-md p-4 flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img
            src="/logo.png"
            alt="Nachos Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-2xl font-bold text-[#F7DF6E]">Nachos</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link to={path} key={name}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 transition-colors ${
                    isActive
                      ? "bg-[#F7DF6E]/30 text-black"
                      : "hover:bg-[#F7DF6E]/20"
                  }`}
                >
                  <Icon size={20} />
                  {name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button w/ Dialog */}
      <div className="mt-6">
        <AlertDialog >
          <AlertDialogTrigger asChild>
            <Button
              className="w-full justify-start gap-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will log you out of the Nachos Admin panel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
