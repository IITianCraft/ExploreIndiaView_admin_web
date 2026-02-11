import LoadingSpinner from '@/components/Common/LoadingSpinner';
import adminService, { type AdminAffiliate } from '@/services/adminService';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import {
    Check,
    ChevronDown,
    Copy,
    Download,
    Filter,
    IndianRupee,
    Link,
    MoreHorizontal,
    MousePointer2,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    Inactive: 'bg-slate-800 text-slate-400 border border-slate-700',
};

export default function AffiliatesPage() {
    const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAffiliate, setSelectedAffiliate] = useState<AdminAffiliate | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        website: '',
        commissionRate: '5'
    });

    const fetchAffiliates = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAffiliates();
            setAffiliates(data);
        } catch (error) {
            console.error('Error fetching affiliates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const handleAddAffiliate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.createAffiliate({
                name: formData.name,
                website: formData.website,
                status: 'Active'
            });
            setIsModalOpen(false);
            setFormData({ name: '', website: '', commissionRate: '5' });
            fetchAffiliates();
        } catch (error) {
            console.error('Error adding affiliate:', error);
        }
    };

    const handleEditAffiliate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAffiliate) return;
        try {
            await adminService.updateAffiliate(selectedAffiliate.id, {
                name: formData.name,
                website: formData.website
            });
            setIsModalOpen(false);
            setIsEditing(false);
            setSelectedAffiliate(null);
            setFormData({ name: '', website: '', commissionRate: '5' });
            fetchAffiliates();
        } catch (error) {
            console.error('Error updating affiliate:', error);
        }
    };

    const handleDeleteAffiliate = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this affiliate?')) return;
        try {
            await adminService.deleteAffiliate(id);
            fetchAffiliates();
        } catch (error) {
            console.error('Error deleting affiliate:', error);
        }
    };

    const openEditModal = (affiliate: AdminAffiliate) => {
        setSelectedAffiliate(affiliate);
        setFormData({
            name: affiliate.name,
            website: affiliate.website || '',
            commissionRate: '5' // We don't store commission rate yet, defaulting to 5
        });
        setIsEditing(true);
        setIsModalOpen(true);
        setActiveMenu(null);
    };

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

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredAffiliates = affiliates.filter(affiliate =>
        affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total Affiliates', value: affiliates.length, trend: '+0 this month', icon: Link, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Total Clicks', value: affiliates.reduce((acc, curr) => acc + (curr.clicks || 0), 0), trend: '+0% vs last month', icon: MousePointer2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Conversions', value: affiliates.reduce((acc, curr) => acc + (curr.conversions || 0), 0), trend: '0.0% conversion rate', icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Total Payouts', value: `₹${affiliates.reduce((acc, curr) => acc + (curr.earnings || 0), 0).toFixed(1)}K`, trend: '+0% vs last month', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    const handleExportData = (format: ExportFormat) => {
        const columns = ['Affiliate Name', 'Code', 'Website', 'Clicks', 'Conversions', 'Conv. Rate', 'Earnings', 'Status'];
        const data = filteredAffiliates.map(a => [
            a.name,
            a.code,
            a.website || 'N/A',
            a.clicks,
            a.conversions,
            a.convRate,
            `₹${(a.earnings || 0).toLocaleString()}K`,
            a.status
        ]);

        exportData(format, {
            filename: `affiliates_report_${new Date().toISOString().split('T')[0]}`,
            columns,
            data,
            title: 'Affiliate Performance Report'
        });

        setShowExportMenu(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-[var(--text-primary)]">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Affiliate Management</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">System Operational</span>
                        </div>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm">Manage affiliate partners and track performance across your network.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-secondary)] leading-none">{stat.label}</p>
                                <h3 className="text-2xl font-bold mt-3 text-[var(--text-primary)]">{stat.value}</h3>
                                <p className="text-xs font-bold text-emerald-500 mt-2">{stat.trend}</p>
                            </div>
                            <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                                <stat.icon className={stat.color} size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border-color)] rounded-2xl">
                <div className="relative flex-1 max-w-md action-menu-container">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search affiliates by name, code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => alert('Filter functionality coming soon!')}
                        className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] transition-colors shadow-sm"
                    >
                        <Filter size={16} />
                        Filter
                    </button>
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] transition-colors shadow-sm"
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
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setFormData({ name: '', website: '', commissionRate: '5' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                    >
                        <Plus size={16} />
                        Add Affiliate
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm min-h-[400px]">
                <div className="overflow-x-auto pb-44 -mb-44">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Affiliate</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tracking Code</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Conversions</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Conv. Rate</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Earnings</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredAffiliates.map((affiliate) => (
                                <tr key={affiliate.id} className={cn(
                                    "transition-colors",
                                    activeMenu === affiliate.id ? "bg-[var(--bg-app)] relative z-20" : "hover:bg-slate-500/5"
                                )}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-bold shadow-inner">
                                                {affiliate.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[var(--text-primary)] leading-tight">{affiliate.name}</span>
                                                <span className="text-[11px] text-[var(--text-secondary)] font-medium">{affiliate.website || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 group/code">
                                            <code className="bg-[var(--bg-app)] text-[var(--text-secondary)] px-2.5 py-1 rounded-md text-[11px] font-bold border border-[var(--border-color)] flex items-center gap-2">
                                                {affiliate.code}
                                                <button
                                                    onClick={() => copyToClipboard(affiliate.code)}
                                                    className="p-1 hover:bg-[var(--bg-card)] rounded transition-colors"
                                                >
                                                    {copiedCode === affiliate.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-[var(--text-secondary)]" />}
                                                </button>
                                            </code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-bold text-blue-400">{affiliate.clicks}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-bold text-blue-400">{affiliate.conversions}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-bold text-emerald-500">{affiliate.convRate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-bold text-[var(--text-primary)]">₹{affiliate.earnings.toLocaleString()}K</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            statusStyles[affiliate.status] || statusStyles.Inactive
                                        )}>
                                            {affiliate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right overflow-visible">
                                        <div className="relative action-menu-container inline-block">
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === affiliate.id ? null : affiliate.id)}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-colors border",
                                                    activeMenu === affiliate.id
                                                        ? "bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-primary)]"
                                                        : "bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
                                                )}
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>

                                            {activeMenu === affiliate.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                                                    <div className="p-1.5 flex flex-col gap-1">
                                                        <button
                                                            onClick={() => alert(`Showing performance metrics for ${affiliate.name}`)}
                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                                        >
                                                            View Performance
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(affiliate)}
                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                                        >
                                                            Edit Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAffiliate(affiliate.id)}
                                                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 border-t border-[var(--border-color)] mt-1 pt-2"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete Affiliate
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

            {/* Add/Edit Affiliate Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <form
                        onSubmit={isEditing ? handleEditAffiliate : handleAddAffiliate}
                        className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                    >
                        <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">{isEditing ? 'Edit Affiliate' : 'Add New Affiliate'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                    Affiliate Name <span className="text-red-500 text-lg">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter affiliate name"
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                    Website URL <span className="text-red-500 text-lg">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="example.com"
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                                    Commission Rate (%) <span className="text-red-500 text-lg">*</span>
                                </label>
                                <select
                                    value={formData.commissionRate}
                                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium appearance-none"
                                >
                                    <option value="5">5% Standard</option>
                                    <option value="10">10% Premium</option>
                                    <option value="15">15% Strategic</option>
                                </select>
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                                <p className="text-xs text-slate-400 font-medium">
                                    {isEditing
                                        ? "Updates will be applied immediately to the affiliate tracking profile."
                                        : "A unique tracking code will be automatically generated for this affiliate upon registration."}
                                </p>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-[var(--bg-app)]/30 flex items-center justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
                                {isEditing ? 'Save Changes' : 'Add Affiliate'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
