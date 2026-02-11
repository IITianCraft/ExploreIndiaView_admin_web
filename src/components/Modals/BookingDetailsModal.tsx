
import Modal from '@/components/Common/Modal';
import type { AdminBooking } from '@/services/adminService';
import { Calendar, CreditCard, FileText, Mail, MapPin, Package, Phone, User } from 'lucide-react';

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: AdminBooking | null;
}

export default function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
    if (!booking) return null;

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Booking Details #${booking.id}`}>
            <div className="space-y-6">
                {/* Header Status */}
                <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Status</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            booking.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                            {booking.status || 'Pending'}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total Amount</p>
                        <p className="text-2xl font-bold text-white">₹{booking.PackagePrice?.toLocaleString()}</p>
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
                                <p className="text-slate-200 font-medium">{booking.user?.name || 'Guest'}</p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium">{booking.user?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Phone</p>
                                <div className="flex items-center gap-2">
                                    <Phone size={14} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium">{booking.user?.mobile || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Package Details */}
                    <div className="space-y-4">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
                            <Package size={18} className="text-emerald-500" />
                            Package Information
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Package Name</p>
                                <p className="text-slate-200 font-medium">{booking.PackageName}</p>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-slate-500 text-xs">Location</p>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-600" />
                                    <p className="text-slate-200 font-medium">{/* We might not have specific location in booking, defaulting to name inference or N/A */} N/A</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Duration</p>
                                    <p className="text-slate-200 font-medium">{booking.PackageDays} Days</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Travelers</p>
                                    <p className="text-slate-200 font-medium">{booking.people} Persons</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction & Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
                            <CreditCard size={18} className="text-emerald-500" />
                            Payment Details
                        </h3>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-500 text-xs">Payment Status</p>
                                    <p className="text-slate-200 font-medium capitalize">{booking.paymentStatus || 'Pending'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs">Commission</p>
                                    <p className="text-emerald-500 font-medium">₹{Math.floor(booking.PackagePrice * 0.03).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2 border-b border-slate-800">
                            <Calendar size={18} className="text-emerald-500" />
                            Timeline
                        </h3>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-2">
                            <div className="flex justify-between">
                                <p className="text-slate-500 text-xs">Booking Date</p>
                                <p className="text-slate-300 text-xs">{formatDate(booking.createdAt || '')}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-slate-500 text-xs">Travel Date</p>
                                <p className="text-slate-300 text-xs">{formatDate(booking.startDate || '')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                {(booking._data?.pickupLocation || booking._data?.pickup_location || booking._data?.dropLocation || booking._data?.drop_location || booking._data?.specialRequests || booking._data?.notes || booking._data?.adults) && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h3 className="text-slate-200 font-bold flex items-center gap-2 pb-2">
                            <FileText size={18} className="text-emerald-500" />
                            Additional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(booking._data?.pickupLocation || booking._data?.pickup_location) && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Pickup Location</p>
                                    <p className="text-slate-200 font-medium text-sm break-words">{booking._data.pickupLocation || booking._data.pickup_location}</p>
                                </div>
                            )}
                            {(booking._data?.dropLocation || booking._data?.drop_location) && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Drop Location</p>
                                    <p className="text-slate-200 font-medium text-sm break-words">{booking._data.dropLocation || booking._data.drop_location}</p>
                                </div>
                            )}
                            {(booking._data?.specialRequests || booking._data?.notes) && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 md:col-span-2">
                                    <p className="text-slate-500 text-xs">Special Requests / Notes</p>
                                    <p className="text-slate-200 font-medium text-sm break-words">{booking._data.specialRequests || booking._data.notes}</p>
                                </div>
                            )}
                            {(booking._data?.adults || booking._data?.children || booking._data?.infants) && (
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                    <p className="text-slate-500 text-xs">Travelers Breakdown</p>
                                    <div className="flex gap-4 mt-1 flex-wrap">
                                        {booking._data?.adults > 0 && <span className="text-slate-200 text-sm bg-slate-800 px-2 py-0.5 rounded text-xs">{booking._data.adults} Adults</span>}
                                        {booking._data?.children > 0 && <span className="text-slate-200 text-sm bg-slate-800 px-2 py-0.5 rounded text-xs">{booking._data.children} Children</span>}
                                        {booking._data?.infants > 0 && <span className="text-slate-200 text-sm bg-slate-800 px-2 py-0.5 rounded text-xs">{booking._data.infants} Infants</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}


