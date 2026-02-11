import LoadingSpinner from '@/components/Common/LoadingSpinner';
import adminService, { type AdminBooking, type AdminUser } from '@/services/adminService';
import { ArrowLeft, Car, Eye, Hotel, Plane, Train, Users as UsersIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function UserDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [userData, userBookings] = await Promise.all([
                    adminService.getUser(id),
                    adminService.getUserBookings(id)
                ]);
                setUser(userData);
                setBookings(userBookings);
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (!user) return <div className="text-[var(--text-primary)] p-6">User not found</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/users')}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Users
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Information Card */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Profile Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">Full Name</div>
                            <div className="text-[var(--text-primary)] font-medium">{user.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">Role</div>
                            <div className="text-[var(--text-primary)] font-medium capitalize">{user.role}</div>
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">Email</div>
                            <div className="text-[var(--text-primary)] font-medium break-all">{user.email}</div>
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">Mobile</div>
                            <div className="text-[var(--text-primary)] font-medium">{user.mobile}</div>
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">Status</div>
                            <div className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
                                user.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {user.status}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-[var(--text-secondary)] mb-1">User ID</div>
                            <div className="text-[var(--text-primary)] font-mono text-sm">{user.id}</div>
                        </div>
                    </div>
                </div>

                {/* Wallet & Cashback Card */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Wallet & Cashback</h2>

                    <div className="mb-8">
                        <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">₹{user._data?.walletBalance || 0}</div>
                        <div className="text-sm text-[var(--text-secondary)]">Current Balance</div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-[var(--text-primary)] mb-4">Recent Transactions</div>
                        <p className="text-sm text-[var(--text-secondary)]">No recent transactions</p>
                    </div>
                </div>
            </div>

            {/* Booking History Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Booking History</h2>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full">
                        {bookings.length} Bookings
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)]">
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Service</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Details</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Date</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {bookings.length > 0 ? (
                                bookings.map((booking) => {
                                    const type = booking._data?.type?.toLowerCase() || 'package';
                                    return (
                                        <tr key={booking.id} className="hover:bg-slate-500/5 transition-colors group">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        type === 'flight' ? "bg-blue-500/10 text-blue-500" :
                                                            type === 'train' ? "bg-orange-500/10 text-orange-500" :
                                                                type === 'hotel' ? "bg-purple-500/10 text-purple-500" :
                                                                    type === 'cab' ? "bg-yellow-500/10 text-yellow-500" :
                                                                        "bg-emerald-500/10 text-emerald-500"
                                                    )}>
                                                        {type === 'flight' ? <Plane size={16} /> :
                                                            type === 'train' ? <Train size={16} /> :
                                                                type === 'hotel' ? <Hotel size={16} /> :
                                                                    type === 'cab' ? <Car size={16} /> :
                                                                        <UsersIcon size={16} />}
                                                    </div>
                                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                                        {type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-[var(--text-primary)] font-medium">
                                                    {booking.PackageName}
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)]">
                                                    ID: {booking.id.slice(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-[var(--text-primary)]">
                                                    {new Date(booking.startDate).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-bold capitalize",
                                                    booking.status === 'confirmed' || booking.status === 'completed' || booking.paymentStatus === 'paid' || booking.paymentStatus === 'success'
                                                        ? "bg-emerald-500/10 text-emerald-500"
                                                        : booking.status === 'cancelled' || booking.status === 'failed'
                                                            ? "bg-red-500/10 text-red-500"
                                                            : "bg-yellow-500/10 text-yellow-500"
                                                )}>
                                                    {booking.paymentStatus || booking.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-[var(--text-primary)] font-bold text-right">
                                                ₹{booking.PackagePrice.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-[var(--bg-app)] rounded-full flex items-center justify-center text-[var(--text-secondary)]">
                                                <Eye size={24} className="opacity-20" />
                                            </div>
                                            <p className="text-[var(--text-secondary)] font-medium">No bookings found for this user.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
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
