// src/pages/Dashboard.tsx
import {
  Users,
  Film,
  MessageCircle,
  UsersRound,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Users",
    icon: Users,
    value: 1280,
    color: "text-[#f6d33d]",
  },
  {
    title: "Total Groups",
    icon: UsersRound,
    value: 240,
    color: "text-[#f6d33d]",
  },
  {
    title: "Total Movies",
    icon: Film,
    value: 3058,
    color: "text-[#f6d33d]",
  },
  {
    title: "Feedback Count",
    icon: MessageCircle,
    value: 67,
    color: "text-[#f6d33d]",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#f6d33d] flex items-center gap-2">
        <LayoutDashboard className="w-7 h-7" />
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ title, icon: Icon, value, color }) => (
          <Card key={title} className="shadow-md border border-[#fdf6d4] bg-[#fffbe5]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-md font-medium">{title}</CardTitle>
              <Icon className={`w-6 h-6 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add more dashboard widgets/charts below if needed */}
    </div>
  );
}
