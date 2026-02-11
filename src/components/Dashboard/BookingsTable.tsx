import LoadingSpinner from '@/components/Common/LoadingSpinner';
import type { AdminBooking } from '@/services/adminService';
import adminService from '@/services/adminService';
import { clsx, type ClassValue } from 'clsx';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const statusStyles = {
    Confirmed: 'bg-green-500/10 text-green-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
    Processing: 'bg-blue-500/10 text-blue-500',
    Cancelled: 'bg-red-500/10 text-red-500',
};

export default function BookingsTable() {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await adminService.getAllBookings(1, 10);
                setBookings(data.bookings);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
                setError('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-red-500 font-medium">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-sm text-blue-400 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-black/5">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h3 className="font-bold text-[var(--text-primary)]">Recent Bookings</h3>
                <button className="text-sm font-medium text-blue-400 hover:text-blue-300">View all</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/50">
                            <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Booking ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Customer</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Details</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                                    No bookings found
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-500/5 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-secondary)]">#{booking.id?.slice(-6)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                                                {booking.user?.name ? booking.user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-[var(--text-primary)]">{booking.user?.name || 'Unknown User'}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)]">{booking.user?.mobile}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{booking.PackageName}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">₹{booking.PackagePrice.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                                            statusStyles[booking.status as keyof typeof statusStyles] || 'bg-[var(--bg-app)] text-[var(--text-secondary)]'
                                        )}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
