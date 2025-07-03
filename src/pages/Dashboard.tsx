import {
  User,
  Film,
  MessageCircle,
  UsersRound,
  LayoutDashboard,
  TrendingUp,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface DashboardStats {
  movie_count: number;
  user_count: number;
  group_count: number;
  genre_count: number;
  post_count: number;
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">
    {children}
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    movie_count: 0,
    user_count: 0,
    group_count: 0,
    genre_count: 0,
    post_count: 0,
  });

  const [monthlyData] = useState<{ month: string; users: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using your actual API response structure
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // For demo purposes, using the data from your API response
        // Replace this with your actual API call:
        /*
        const response = await fetch('https://nachos-backend-production.up.railway.app/api/v1/admin/dashboard/', {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN_HERE'
          }
        });
        const data = await response.json();
        setStats(data);
        */
        
        // Using your actual API response data
        setStats({
          movie_count: 3058,
          user_count: 13,
          group_count: 4,
          genre_count: 19,
          post_count: 6,
        });
      } catch (error) {
        console.error('Dashboard API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate some derived data for charts
  const pieData = [
    { name: 'Movies', value: stats.movie_count, color: '#f6d33d' },
    { name: 'Users', value: stats.user_count, color: '#fbbf24' },
    { name: 'Groups', value: stats.group_count, color: '#f59e0b' },
    { name: 'Genres', value: stats.genre_count, color: '#d97706' },
    { name: 'Posts', value: stats.post_count, color: '#b45309' },
  ];

  const cards = [
    { title: "Total Movies", icon: Film, value: stats.movie_count, color: "text-blue-600" },
    { title: "Total Users", icon: User, value: stats.user_count, color: "text-green-600" },
    { title: "Total Groups", icon: UsersRound, value: stats.group_count, color: "text-purple-600" },
    { title: "Total Genres", icon: Tag, value: stats.genre_count, color: "text-orange-600" },
    { title: "Total Posts", icon: MessageCircle, value: stats.post_count, color: "text-red-600" },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-[#f6d33d] flex items-center gap-2">
        <LayoutDashboard className="w-7 h-7" />
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map(({ title, icon: Icon, value, color }) => (
          <Card key={title} className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={`w-4 h-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-1">Total count</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Content Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Movies', count: stats.movie_count },
                { name: 'Users', count: stats.user_count },
                { name: 'Groups', count: stats.group_count },
                { name: 'Genres', count: stats.genre_count },
                { name: 'Posts', count: stats.post_count },
              ]}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f6d33d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              User Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fefce8', 
                    border: '1px solid #fef3c7' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#f6d33d" 
                  strokeWidth={3}
                  dot={{ fill: '#f6d33d', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, fill: '#f6d33d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{(stats.movie_count / stats.user_count).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Movies per User</div>
          </div>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{(stats.user_count / stats.group_count).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Users per Group</div>
          </div>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(stats.movie_count / stats.genre_count).toFixed(0)}</div>
            <div className="text-sm text-gray-600">Movies per Genre</div>
          </div>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{(stats.post_count / stats.user_count).toFixed(1)}</div>
            <div className="text-sm text-gray-600">Posts per User</div>
          </div>
        </Card>
      </div>
    </div>
  );
}