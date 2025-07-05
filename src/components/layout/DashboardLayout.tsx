 import { Outlet } from "react-router-dom";
import { Sidebar } from "../ui/sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto bg-[#fdf6d4]">
        <Outlet />
      </main>
    </div>
  );
}
