import LoadingSpinner from '@/components/Common/LoadingSpinner';
import adminService, { type Transaction, type WalletStats } from '@/services/adminService';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import {
    AlertCircle,
    ChevronDown,
    Download,
    Filter,
    RefreshCcw,
    Search,
    TrendingUp,
    Wallet
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WalletPage() {
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Transactions');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'earning' | 'spending'>('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, transData] = await Promise.all([
                adminService.getWalletStats(),
                adminService.getTransactionHistory()
            ]);
            setStats(statsData);
            setTransactions(transData);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showExportMenu && !(event.target as Element).closest('.export-menu-container')) {
                setShowExportMenu(false);
            }
            if (showFilterMenu && !(event.target as Element).closest('.filter-menu-container')) {
                setShowFilterMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportMenu, showFilterMenu]);

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || tx.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    const handleExportData = (format: ExportFormat) => {
        const columns = ['Date', 'User', 'Type', 'Category', 'Description', 'Amount', 'Status'];
        const data = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.description.includes('Referral') ? 'System' : 'Super Admin',
            tx.type === 'earning' ? 'CREDIT' : 'DEBIT',
            tx.description.includes('Booking') ? 'Booking Payment' : 'Referral Reward',
            tx.description,
            `${tx.type === 'earning' ? '+' : '-'}₹${tx.amount}`,
            tx.status
        ]);

        exportData(format, {
            filename: `transactions_report_${new Date().toISOString().split('T')[0]}`,
            columns,
            data,
            title: 'Wallet Transactions Report'
        });

        setShowExportMenu(false);
    };

    if (loading && !stats) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-[var(--text-primary)]">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Wallet & Payments</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage transactions, payouts, and payment gateways.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={formatCurrency(stats?.totalEarnings || 0)}
                    subtext="All time earned"
                    icon={<TrendingUp size={20} />}
                    iconColor="text-blue-400"
                    bgColor="bg-blue-400/10"
                />
                <StatCard
                    label="User Wallet Balances"
                    value={formatCurrency(stats?.balance || 0)}
                    subtext="Circulating in ecosystem"
                    icon={<Wallet size={20} />}
                    iconColor="text-emerald-400"
                    bgColor="bg-emerald-400/10"
                />
                <StatCard
                    label="Today's Wallet Activity"
                    value={<div className="flex flex-col"><span className="text-emerald-400">+₹0</span><span className="text-rose-400">-₹0</span></div>}
                    subtext=""
                    icon={<RefreshCcw size={20} />}
                    iconColor="text-emerald-400"
                    bgColor="bg-emerald-400/10"
                />
                <StatCard
                    label="Pending Payouts"
                    value={stats?.pendingPayouts || 0}
                    subtext="Requires attention"
                    icon={<AlertCircle size={20} />}
                    iconColor="text-orange-400"
                    bgColor="bg-orange-400/10"
                />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 border border-[var(--border-color)] rounded-2xl">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)] shadow-inner"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition-all shadow-sm">
                            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <div className="relative filter-menu-container">
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={cn(
                                    "flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-[var(--bg-app)] transition-colors shadow-sm",
                                    filterType !== 'all' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-[var(--text-secondary)]"
                                )}
                            >
                                <Filter size={16} />
                                {filterType === 'all' ? 'Filter' : filterType === 'earning' ? 'Credits' : 'Debits'}
                                <ChevronDown size={14} className={cn("transition-transform", showFilterMenu && "rotate-180")} />
                            </button>

                            {showFilterMenu && (
                                <div className="absolute top-full mt-2 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 left-0">
                                    <div className="p-1.5 flex flex-col gap-1">
                                        <button
                                            onClick={() => { setFilterType('all'); setShowFilterMenu(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors",
                                                filterType === 'all' ? "bg-[var(--bg-app)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
                                            )}
                                        >
                                            All Transactions
                                        </button>
                                        <button
                                            onClick={() => { setFilterType('earning'); setShowFilterMenu(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors",
                                                filterType === 'earning' ? "bg-emerald-500/10 text-emerald-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
                                            )}
                                        >
                                            Credits Only
                                        </button>
                                        <button
                                            onClick={() => { setFilterType('spending'); setShowFilterMenu(false); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors",
                                                filterType === 'spending' ? "bg-rose-500/10 text-rose-500" : "text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
                                            )}
                                        >
                                            Debits Only
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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

                <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar">
                    {['All Transactions', 'Partner Payouts', 'Refunds', 'Payment Gateways'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition-all",
                                activeTab === tab
                                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-lg border border-[var(--border-color)]"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/30">
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-[var(--bg-app)]/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] text-[var(--text-secondary)] font-medium">
                                                    {new Date(tx.date).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-bold text-[var(--text-primary)]">
                                                    {tx.description.includes('Referral') ? 'System' : 'Super Admin'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    tx.type === 'earning' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                )}>
                                                    {tx.type === 'earning' ? 'CREDIT' : 'DEBIT'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] font-bold text-[var(--text-primary)]">
                                                    {tx.description.includes('Booking') ? 'Booking Payment' : 'Referral Reward'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[13px] text-[var(--text-secondary)] font-medium">{tx.description}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-[13px] font-bold",
                                                    tx.type === 'earning' ? "text-emerald-500" : "text-rose-500"
                                                )}>
                                                    {tx.type === 'earning' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                    tx.status === 'completed'
                                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
}

function StatCard({ label, value, subtext, icon, iconColor, bgColor }: any) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-none">{label}</span>
                    <div className={cn("p-2.5 rounded-xl", bgColor, iconColor)}>
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold text-[var(--text-primary)] leading-tight">
                        {value}
                    </div>
                    {subtext && <p className="text-xs text-[var(--text-secondary)] font-bold">{subtext}</p>}
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
