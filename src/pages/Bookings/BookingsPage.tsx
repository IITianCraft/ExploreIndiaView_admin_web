import LoadingSpinner from '@/components/Common/LoadingSpinner';
import adminService, { type AdminBooking } from '@/services/adminService';
import { BookCheck, Calendar, Download, MoreVertical, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const statusStyles = {
    Confirmed: 'bg-emerald-500/10 text-emerald-500',
    pending: 'bg-amber-500/10 text-amber-500',
    Processing: 'bg-blue-500/10 text-blue-500',
    Cancelled: 'bg-red-500/10 text-red-500',
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await adminService.getAllBookings();
                setBookings(data.bookings);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.PackageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 text-[var(--text-primary)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                        <BookCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bookings</h1>
                        <p className="text-[var(--text-secondary)] text-sm">Manage and track travel bookings</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <Download size={18} />
                        Export
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['all', 'Confirmed', 'pending', 'Processing', 'Cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                            filterStatus === status
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/80"
                        )}
                    >
                        {status === 'all' ? 'All Bookings' : status}
                    </button>
                ))}
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/30">
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Package</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Travel Date</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-500/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-[var(--text-primary)]">#{booking.id}</div>
                                        <div className="text-[10px] text-[var(--text-secondary)]">{new Date(booking.createdAt || '').toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center text-xs font-medium text-blue-400">
                                                {booking.user?.name ? booking.user.name[0] : 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--text-primary)]">{booking.user?.name || 'Unknown'}</div>
                                                <div className="text-[10px] text-[var(--text-secondary)]">{booking.user?.mobile}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-[var(--text-secondary)]">{booking.PackageName}</div>
                                        <div className="text-xs text-[var(--text-secondary)]/60">{booking.PackageDays} Days • {booking.people} People</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-[var(--text-primary)]">₹{booking.PackagePrice.toLocaleString()}</div>
                                        <div className="text-[10px] text-emerald-500">{booking.paymentStatus}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            statusStyles[booking.status as keyof typeof statusStyles] || 'bg-slate-800 text-slate-400'
                                        )}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                            <Calendar size={14} className="text-[var(--text-secondary)]" />
                                            {new Date(booking.startDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-secondary)] transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
