import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ServiceBookingDetailsModal from '@/components/Modals/ServiceBookingDetailsModal';
import type { ServiceBooking } from '@/services/adminService';
import adminService from '@/services/adminService';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import { ChevronDown, Download, Filter, MoreHorizontal, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ServiceManagementPageProps {
    type: 'flights' | 'trains' | 'hotels' | 'cabs';
    title: string;
    description: string;
    icon: React.ReactNode;
}

const statusStyles: Record<string, string> = {
    Confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500',
    Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-500',
    Failed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function ServiceManagementPage({ type, title, description, icon }: ServiceManagementPageProps) {
    const [bookings, setBookings] = useState<ServiceBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await adminService.getServiceBookings(type);
                setBookings(data || []);
            } catch (error) {
                console.error(`Error fetching ${type} bookings:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [type]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeMenu && !(event.target as Element).closest('.action-menu-container')) {
                setActiveMenu(null);
            }
            if (showExportMenu && !(event.target as Element).closest('.export-menu-container')) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu, showExportMenu]);

    const filteredBookings = bookings.filter(booking =>
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.details.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportData = (format: ExportFormat) => {
        const columns = ['Booking ID', 'Customer Name', 'Customer Email', 'Details', 'Date', 'Amount', 'Commission', 'Status'];
        const data = filteredBookings.map(b => [
            b.id,
            b.customerName,
            b.customerEmail,
            b.details,
            b.date,
            `₹${b.amount}`,
            `₹${b.commission}`,
            b.status
        ]);

        exportData(format, {
            filename: `${type}_bookings_${new Date().toISOString().split('T')[0]}`,
            columns,
            data,
            title: `${title} Bookings Report`
        });

        setShowExportMenu(false);
    };

    const handleViewDetails = (booking: ServiceBooking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
        setActiveMenu(null);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-[var(--text-primary)]">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] shadow-inner">
                        {icon}
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{description}</p>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border-color)] rounded-2xl">
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by booking ID, customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-[var(--bg-app)] transition-colors text-[var(--text-secondary)] shadow-sm whitespace-nowrap">
                        <Filter size={16} />
                        Status
                    </button>
                    <div className="relative export-menu-container">
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

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm relative overflow-hidden">
                <div className="overflow-x-auto pb-48 -mb-48">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[120px]">Booking ID</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[200px]">Customer</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[220px]">Details</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[120px]">Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[110px]">Amount</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[110px]">Commission</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider min-w-[120px]">Status</th>
                                <th className="sticky right-0 z-20 px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right bg-[var(--bg-app)]/90 backdrop-blur-md shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.5)] min-w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                                        No {type} bookings found.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-500/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase">{booking.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{booking.customerName}</span>
                                                <span className="text-[11px] text-[var(--text-secondary)] font-bold">{booking.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] text-[var(--text-secondary)] font-medium truncate max-w-[200px] inline-block">{booking.details}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] text-[var(--text-secondary)] font-medium">{booking.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-bold text-[var(--text-primary)]">₹{booking.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-bold text-emerald-500">₹{booking.commission.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
                                                statusStyles[booking.status] || "bg-slate-800 text-slate-400 border-slate-700"
                                            )}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="sticky right-0 z-10 px-6 py-4 text-right overflow-visible bg-[var(--bg-app)]/90 backdrop-blur-md shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.5)] group-hover:bg-[var(--bg-card)]/90 transition-colors">
                                            <div className="relative action-menu-container inline-block">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-colors border",
                                                        activeMenu === booking.id
                                                            ? "bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)]"
                                                            : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
                                                    )}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeMenu === booking.id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="p-1.5 flex flex-col gap-1">
                                                            <button
                                                                onClick={() => handleViewDetails(booking)}
                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                                            >
                                                                View Details
                                                            </button>
                                                            <button className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors">
                                                                Update Status
                                                            </button>
                                                            <button className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2 border-t border-[var(--border-color)] mt-1 pt-2">
                                                                Cancel Booking
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between px-2 text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                <span>Showing {filteredBookings.length} results</span>
                <div className="flex items-center gap-2">
                    <button disabled className="px-4 py-2 border border-[var(--border-color)] rounded-xl opacity-50 cursor-not-allowed bg-[var(--bg-card)] text-[var(--text-secondary)]">Previous</button>
                    <button disabled className="px-4 py-2 border border-[var(--border-color)] rounded-xl opacity-50 cursor-not-allowed bg-[var(--bg-card)] text-[var(--text-secondary)]">Next</button>
                </div>
            </div>

            <ServiceBookingDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                booking={selectedBooking}
                type={type}
            />
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
