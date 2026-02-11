import LoadingSpinner from '@/components/Common/LoadingSpinner';
import BookingDetailsModal from '@/components/Modals/BookingDetailsModal';
import adminService, { type AdminBooking } from '@/services/adminService';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import { ChevronDown, Download, Filter, MoreHorizontal, Package, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const statusStyles: Record<string, string> = {
    Confirmed: 'bg-emerald-500/10 text-emerald-500',
    Pending: 'bg-amber-500/10 text-amber-500',
    Processing: 'bg-blue-500/10 text-blue-500',
    Cancelled: 'bg-red-500/10 text-red-500',
    Failed: 'bg-red-500/10 text-red-500',
};

export default function PackagesPage() {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await adminService.getPackageBookings();
                setBookings(data);
            } catch (error) {
                console.error('Error fetching package bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const searchLower = searchTerm.toLowerCase();
        return (
            booking.id.toLowerCase().includes(searchLower) ||
            booking.PackageName.toLowerCase().includes(searchLower) ||
            booking.user?.name?.toLowerCase().includes(searchLower) ||
            booking.user?.email?.toLowerCase().includes(searchLower)
        );
    });

    const getCommission = (amount: number) => {
        // Mock commission calculation (e.g., 3%) - ideally this comes from backend
        return Math.floor(amount * 0.03);
    };

    const handleExportData = (format: ExportFormat) => {
        const columns = ['Booking ID', 'Customer Name', 'Email', 'Package', 'Date', 'Amount', 'Commission', 'Status'];
        const data = filteredBookings.map(b => [
            b.id,
            b.user?.name || 'Unknown',
            b.user?.email || 'N/A',
            b.PackageName,
            new Date(b.startDate || '').toLocaleDateString(),
            `₹${b.PackagePrice.toLocaleString()}`,
            `₹${getCommission(b.PackagePrice).toLocaleString()}`,
            b.status || 'Pending'
        ]);

        exportData(format, {
            filename: `packages_report_${new Date().toISOString().split('T')[0]}`,
            columns,
            data,
            title: 'Tour Packages Booking Report'
        });


        setShowExportMenu(false);
    };

    const handleViewDetails = (booking: AdminBooking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDownloadInvoice = (booking: AdminBooking) => {
        exportData('pdf', {
            filename: `invoice_${booking.id}`,
            columns: ['Description', 'Details'],
            data: [
                ['Booking ID', booking.id],
                ['Date', new Date(booking.createdAt || '').toLocaleDateString()],
                ['Customer', booking.user?.name || 'Guest'],
                ['Email', booking.user?.email || 'N/A'],
                ['Package', booking.PackageName],
                ['Passengers', `${booking.people}`],
                ['Amount', `Rs. ${booking.PackagePrice.toLocaleString()}`],
                ['Status', booking.status || 'Pending']
            ],
            title: `Invoice #${booking.id}`
        });
        setActiveMenuId(null);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-[var(--text-primary)]">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-inner text-[var(--text-primary)]">
                        <Package size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Packages Management</h1>
                </div>
                <p className="text-[var(--text-secondary)] text-sm ml-14 font-medium">View and manage all packages bookings.</p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border-color)] rounded-2xl">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by booking ID, customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-[var(--bg-app)] transition-colors text-[var(--text-secondary)] shadow-sm">
                        <Filter size={16} />
                        Status
                    </button>
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-[var(--bg-app)] transition-colors text-[var(--text-secondary)] shadow-sm"
                        >
                            <Download size={16} />
                            Export
                            <ChevronDown size={14} className={cn("transition-transform", showExportMenu && "rotate-180")} />
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-1.5 flex flex-col gap-1">
                                    <button
                                        onClick={() => handleExportData('csv')}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                    >
                                        Export to CSV
                                    </button>
                                    <button
                                        onClick={() => handleExportData('pdf')}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                    >
                                        Export to PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
                <div className="overflow-x-auto pb-44 -mb-44">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className={cn(
                                        "transition-colors hover:bg-slate-500/5",
                                        activeMenuId === booking.id ? "bg-[var(--bg-app)] relative z-20" : ""
                                    )}>
                                        <td className="px-6 py-4 text-emerald-500">
                                            <button
                                                className="text-[13px] font-bold hover:text-emerald-400 transition-colors"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(booking.id);
                                                }}
                                            >
                                                #{booking.id.slice(0, 6).toUpperCase()}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">
                                                    {booking.user?.name || 'Unknown User'}
                                                </span>
                                                <span className="text-[11px] text-[var(--text-secondary)] font-bold">
                                                    {booking.user?.email || 'No Email'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] text-[var(--text-secondary)] font-medium max-w-[200px] truncate" title={booking.PackageName}>
                                                {booking.PackageName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] text-[var(--text-secondary)] font-medium whitespace-nowrap">
                                                {new Date(booking.startDate).toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-bold text-[var(--text-primary)]">
                                                ₹{booking.PackagePrice.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[13px] font-bold text-emerald-500">
                                                ₹{getCommission(booking.PackagePrice).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                statusStyles[booking.status || 'Pending'] || "bg-slate-800 text-slate-400 border-slate-700"
                                            )}>
                                                {booking.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right overflow-visible">
                                            <div className="relative action-menu-container inline-block">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === booking.id ? null : booking.id);
                                                    }}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-colors border",
                                                        activeMenuId === booking.id
                                                            ? "bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)]"
                                                            : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
                                                    )}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeMenuId === booking.id && (
                                                    <div ref={menuRef} className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="p-1.5 flex flex-col gap-1">
                                                            <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                                                Actions
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(booking.id);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                                            >
                                                                Copy ID
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewDetails(booking)}
                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                                            >
                                                                View Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadInvoice(booking)}
                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                                            >
                                                                Download Invoice
                                                            </button>
                                                            <div className="my-1 border-t border-[var(--border-color)]"></div>
                                                            <button className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                                Refund Booking
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                                        No bookings found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BookingDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                booking={selectedBooking}
            />
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
