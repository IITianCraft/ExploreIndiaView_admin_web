import LoadingSpinner from '@/components/Common/LoadingSpinner';
import adminService, { type AdminPartner } from '@/services/adminService';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import { ChevronDown, Download, Filter, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const typeStyles: Record<string, string> = {
    Transport: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    Hotel: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-500',
    Agency: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500',
};

const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500',
    Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function PartnersPage() {
    const [partners, setPartners] = useState<AdminPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPartner, setNewPartner] = useState({
        name: '',
        type: 'Hotel',
        city: '',
        state: '',
        email: '',
        phone: '',
        commission: 0
    });

    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const data = await adminService.getPartners();
            setPartners(data);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeMenu && !(event.target as Element).closest('.action-menu-container')) {
                setActiveMenu(null);
            }
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenu]);

    const filteredPartners = partners.filter(partner =>
        partner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Adding partner:', newPartner);
            const partnerData = {
                businessName: newPartner.name,
                contactPerson: newPartner.name, // Using name as contact person for now
                email: newPartner.email,
                phone: newPartner.phone,
                types: [newPartner.type],
                city: newPartner.city,
                state: newPartner.state,
                commission: newPartner.commission
            };

            await adminService.createPartner(partnerData);
            setIsModalOpen(false);
            // Reset form
            setNewPartner({
                name: '',
                type: 'Hotel',
                city: '',
                state: '',
                email: '',
                phone: '',
                commission: 0
            });
            fetchPartners();
        } catch (error) {
            console.error('Error adding partner:', error);
            alert('Failed to add partner. Please try again.');
        }
    };

    const handleDeletePartner = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this partner?')) return;
        try {
            await adminService.deletePartner(id);
            fetchPartners();
        } catch (error) {
            console.error('Error deleting partner:', error);
            alert('Failed to delete partner.');
        }
    };

    const handleExportData = (format: ExportFormat) => {
        const columns = ['Partner Name', 'Type', 'Email', 'Phone', 'City', 'State', 'Commission', 'Status'];
        const data = filteredPartners.map(p => [
            p.businessName,
            p.types.join(', '),
            p.email,
            p.phone,
            p.city,
            p.state,
            `${p.commission}%`,
            p.status
        ]);

        exportData(format, {
            filename: `partners_report_${new Date().toISOString().split('T')[0]}`,
            columns,
            data,
            title: 'Partners Report'
        });

        setShowExportMenu(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-[var(--text-primary)]">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Partner Management</h1>
                    <p className="text-[var(--text-secondary)] text-sm">Manage hotels, transport agencies, and local guides.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                >
                    <Plus size={18} />
                    Add Partner
                </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border-color)] rounded-2xl">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search by partner name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)] shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-[var(--bg-app)] transition-colors text-[var(--text-secondary)] shadow-sm">
                        <Filter size={16} />
                        Filter
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

            {/* Content body */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm min-h-[400px]">
                <div className="overflow-x-auto pb-44 -mb-44">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredPartners.map((partner) => (
                                <tr key={partner.id} className={cn(
                                    "transition-colors",
                                    activeMenu === partner.id ? "bg-[var(--bg-app)] relative z-20" : "hover:bg-slate-500/5"
                                )}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-bold shadow-inner">
                                                {partner.businessName[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{partner.businessName}</span>
                                                <span className="text-[11px] text-[var(--text-secondary)] font-medium tracking-tight">ID: {partner.id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {partner.types.map(type => (
                                                <span key={type} className={cn(
                                                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors",
                                                    typeStyles[type] || typeStyles.Transport
                                                )}>
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-[var(--text-primary)]">{partner.email}</span>
                                            <span className="text-[11px] text-[var(--text-secondary)] font-bold tracking-tight">{partner.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-bold text-[var(--text-primary)]">
                                            {partner.city}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-bold text-[var(--text-primary)]">
                                            {partner.commission}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            statusStyles[partner.status] || statusStyles.Inactive
                                        )}>
                                            {partner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right overflow-visible">
                                        <div className="relative action-menu-container inline-block">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === partner.id ? null : partner.id)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors border",
                                                    activeMenu === partner.id
                                                        ? "bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)]"
                                                        : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
                                                )}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {activeMenu === partner.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-app)]/50">
                                                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-none">Row Actions</span>
                                                    </div>
                                                    <div className="p-1.5 flex flex-col gap-1">
                                                        <button className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors">
                                                            View Documents
                                                        </button>
                                                        <button className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors">
                                                            Suspend Partner
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePartner(partner.id)}
                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 border-t border-[var(--border-color)] mt-1 pt-2"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete Partner
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Partner Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Add New Partner</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPartner} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                    Partner Name <span className="text-red-500 text-lg">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter partner name"
                                    value={newPartner.name}
                                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                    Partner Type <span className="text-red-500 text-lg">*</span>
                                </label>
                                <select
                                    value={newPartner.type}
                                    onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value })}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                                >
                                    <option value="Hotel">Hotel</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Agency">Agency</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                        City <span className="text-red-500 text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="City"
                                        value={newPartner.city}
                                        onChange={(e) => setNewPartner({ ...newPartner, city: e.target.value })}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                        State <span className="text-red-500 text-lg">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="State"
                                        value={newPartner.state}
                                        onChange={(e) => setNewPartner({ ...newPartner, state: e.target.value })}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                    Email Address <span className="text-red-500 text-lg">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="partner@example.com"
                                    value={newPartner.email}
                                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+91 98765 43210"
                                        value={newPartner.phone}
                                        onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                        Commission (%)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newPartner.commission}
                                        onChange={(e) => setNewPartner({ ...newPartner, commission: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border-color)] bg-[var(--bg-app)]/20 -mx-8 -mb-8 px-8 py-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                                >
                                    Add Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

        </div >
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

