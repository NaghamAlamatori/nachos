// src/components/ui/Sidebar.tsx
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Film,
  MessageCircle,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react"; // 

import { Link, useLocation } from "react-router-dom";

interface MenuItem {
  name: string;
  icon: LucideIcon; // ✅ Correct icon type
  path: string;
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Users", icon: Users, path: "/dashboard/users" },
  { name: "Groups", icon: UsersRound, path: "/dashboard/groups" },
  { name: "Movies", icon: Film, path: "/dashboard/movies" },
  { name: "Feedback", icon: MessageCircle, path: "/dashboard/feedback" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-full bg-[#FFFBE5] shadow-md p-4">
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
    </aside>
  );
}
