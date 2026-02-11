import LoadingSpinner from '@/components/Common/LoadingSpinner';
import BookingsTable from '@/components/Dashboard/BookingsTable';
import StatsCard from '@/components/Dashboard/StatsCard';
import type { AdminDashboardStats } from '@/services/adminService';
import adminService from '@/services/adminService';
import {
    BookCheck,
    FileText,
    TrendingUp,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';



export default function DashboardPage() {
    const [stats, setStats] = useState<(AdminDashboardStats & { trendData: { name: string, bookings: number }[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await adminService.getDashboardStats();
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('Failed to load dashboard statistics. Please check your connection or Firestore configuration.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading && !stats) return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;

    if (error && !stats) {
        return (
            <div className="p-8 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl h-full flex flex-col items-center justify-center">
                <p className="text-red-500 font-medium mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-blue-400 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[var(--text-primary)]">
                <StatsCard
                    label="Total Users"
                    value={stats?.totalUsers || '0'}
                    icon={Users}
                    trend={{ value: 12, isUp: true }}
                    color="blue"
                />
                <StatsCard
                    label="Total Bookings"
                    value={stats?.totalBookings || '0'}
                    icon={BookCheck}
                    trend={{ value: 8, isUp: true }}
                    color="green"
                />
                <StatsCard
                    label="Forum Posts"
                    value={stats?.totalForumPosts || '0'}
                    icon={FileText}
                    trend={{ value: 5, isUp: true }}
                    color="purple"
                />
                <StatsCard
                    label="Scratch Cards"
                    value={stats?.totalScratchCards || '0'}
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Main Chart */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl shadow-black/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-[var(--text-primary)] text-lg">Booking Trends</h3>
                        <select className="bg-[var(--bg-app)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] rounded-lg px-3 py-1.5 focus:ring-0">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={stats?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--text-secondary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--text-secondary)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBookings)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Recent Bookings Table */}
            <BookingsTable />
        </div>
    );
}
