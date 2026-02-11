import Modal from '@/components/Common/Modal';
import type { ServiceBooking } from '@/services/adminService';
import { Calendar, Car, FileText, Hotel, Mail, Package, Plane, Train, User } from 'lucide-react';

interface ServiceBookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: ServiceBooking | null;
    type: 'flights' | 'trains' | 'hotels' | 'cabs';
}

export default function ServiceBookingDetailsModal({ isOpen, onClose, booking, type }: ServiceBookingDetailsModalProps) {
    if (!booking) return null;

    const data = booking._data || {};

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            Confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            Cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            Failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        };
        const style = styles[status as keyof typeof styles] || 'bg-slate-800 text-slate-400 border-slate-700';

        return (
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style}`}>
                {status}
            </span>
        );
    };

    const ServiceIcon = () => {
        switch (type) {
            case 'flights': return <Plane size={18} className="text-emerald-500" />;
            case 'trains': return <Train size={18} className="text-emerald-500" />;
            case 'hotels': return <Hotel size={18} className="text-emerald-500" />;
            case 'cabs': return <Car size={18} className="text-emerald-500" />;
            default: return <Package size={18} className="text-emerald-500" />;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${type.slice(0, -1).toUpperCase()} Booking #${booking.id}`}>
            <div className="space-y-6">
                {/* Header Status */}
                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Status</p>
                        <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total Amount</p>
                        <p className="text-2xl font-bold text-white">₹{booking.amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Details */}
                    <div className="space-y-4">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
                            <User size={18} className="text-emerald-500" />
                            Customer Information
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Name</p>
                                <p className="text-slate-200 font-medium">{booking.customerName}</p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium">{booking.customerEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-4">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
                            <ServiceIcon />
                            Service Information
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Details</p>
                                <p className="text-slate-200 font-medium">{booking.details}</p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Booking Date</p>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium">{formatDate(booking.date)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info / Raw Data fields if available */}
                {(data.from || data.to || data.pnr || data.airline || data.hotelName || data.roomType) && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2">
                            <FileText size={18} className="text-emerald-500" />
                            Specific Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Flight/Train/Bus specifics */}
                            {(data.from && data.to) && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 col-span-2">
                                    <p className="text-slate-500 text-xs">Route</p>
                                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                                        <span>{data.from}</span>
                                        <span className="text-slate-500">→</span>
                                        <span>{data.to}</span>
                                    </div>
                                </div>
                            )}
                            {data.pnr && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">PNR</p>
                                    <p className="text-slate-200 font-medium">{data.pnr}</p>
                                </div>
                            )}
                            {data.airline && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Airline</p>
                                    <p className="text-slate-200 font-medium">{data.airline}</p>
                                </div>
                            )}
                            {/* Hotel specifics */}
                            {data.hotelName && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Hotel Name</p>
                                    <p className="text-slate-200 font-medium">{data.hotelName}</p>
                                </div>
                            )}
                            {data.roomType && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Room Type</p>
                                    <p className="text-slate-200 font-medium">{data.roomType}</p>
                                </div>
                            )}
                            {/* Cab specifics */}
                            {data.vehicleType && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Vehicle Type</p>
                                    <p className="text-slate-200 font-medium">{data.vehicleType}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
