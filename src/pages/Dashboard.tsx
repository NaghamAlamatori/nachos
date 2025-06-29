// src/pages/Dashboard.tsx
import {
  Users,
  Film,
  MessageCircle,
  UsersRound,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardStats {
  total_users: number;
  total_groups: number;
  total_movies: number;
  total_feedback: number;
  active_users: number;
}

interface Movie {
  id: number;
  name: string;
  genre: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_groups: 0,
    total_movies: 0,
    total_feedback: 0,
    active_users: 0,
  });

  const [genreData, setGenreData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    // Fetch Dashboard Stats
    axios.get("/admin/dashboard/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Dashboard stats error:", err));

    // Fetch Movies & Count Genre Distribution
    axios.get("/movies/")
      .then((res) => {
        const genreMap: Record<string, number> = {};
        res.data.forEach((movie: any) => {
          const genre = movie.genre || "Unknown";
          genreMap[genre] = (genreMap[genre] || 0) + 1;
        });
        const genreArr = Object.entries(genreMap).map(([name, count]) => ({ name, count }));
        setGenreData(genreArr);
      })
      .catch((err) => console.error("Movies fetch error:", err));
  }, []);

  const cards = [
    {
      title: "Total Users",
      icon: Users,
      value: stats.total_users,
    },
    {
      title: "Total Groups",
      icon: UsersRound,
      value: stats.total_groups,
    },
    {
      title: "Total Movies",
      icon: Film,
      value: stats.total_movies,
    },
    {
      title: "Feedback Count",
      icon: MessageCircle,
      value: stats.total_feedback,
    },
  ];

  const chartColors = ["#f6d33d", "#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#f6d33d] flex items-center gap-2">
        <LayoutDashboard className="w-7 h-7" />
        Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ title, icon: Icon, value }) => (
          <Card key={title} className="shadow-md border border-[#fdf6d4] bg-[#fffbe5]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-md font-medium">{title}</CardTitle>
              <Icon className="w-6 h-6 text-[#f6d33d]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users Chart */}
        <Card className="shadow-md border border-[#fdf6d4] bg-[#fffbe5]">
          <CardHeader>
            <CardTitle className="text-md font-medium">Active vs Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Active", value: stats.active_users },
                    {
                      name: "Inactive",
                      value: Math.max(stats.total_users - stats.active_users, 0),
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  <Cell fill="#f6d33d" />
                  <Cell fill="#ddd" />
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Genre Distribution Chart */}
        <Card className="shadow-md border border-[#fdf6d4] bg-[#fffbe5]">
          <CardHeader>
            <CardTitle className="text-md font-medium">Movies Per Genre</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={genreData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f6d33d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

