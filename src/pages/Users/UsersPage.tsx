import LoadingSpinner from '@/components/Common/LoadingSpinner';
import adminService, { type AdminUser } from '@/services/adminService';
import { exportData, type ExportFormat } from '@/utils/exportUtils';
import { ChevronDown, Download, Eye, Mail, MoreVertical, Phone, Search, Shield, Trash2, Users as UsersIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await adminService.getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
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

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
    );

    const handleViewDetails = (userId: string) => {
        navigate(`/users/${userId}`);
        setActiveMenuId(null);
    };

    const handleExportData = (format: ExportFormat) => {
        const columns = ['User ID', 'Name', 'Email', 'Mobile', 'Role', 'Status', 'Joined'];
        const data = filteredUsers.map(u => [
            u.id,
            u.name,
            u.email,
            u.mobile,
            u.role,
            u.status,
            new Date(u.createdAt).toLocaleDateString()
        ]);

        exportData(format, {
            filename: `users_report_${new Date().toISOString().split('T')[0]}`,
            columns,
            data,
            title: 'User Management Report'
        });

        setShowExportMenu(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Users</h1>
                        <p className="text-[var(--text-secondary)] text-sm">Manage and monitor platform users</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64"
                        />
                    </div>

                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[var(--bg-app)] transition-colors text-[var(--text-secondary)]"
                        >
                            <Download size={16} />
                            <span>Export</span>
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

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]/50">
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-500/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-blue-400 font-semibold">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-[var(--text-primary)]">{user.name}</div>
                                                <div className="text-xs text-[var(--text-secondary)]">ID: {user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                <Mail size={12} />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                                <Phone size={12} />
                                                {user.mobile}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                                            <Shield size={14} className={user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'} />
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            user.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(activeMenuId === user.id ? null : user.id);
                                            }}
                                            className="p-2 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-secondary)] transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeMenuId === user.id && (
                                            <div ref={menuRef} className="absolute right-8 top-8 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="p-1">
                                                    <button
                                                        onClick={() => handleViewDetails(user.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)] rounded-lg transition-colors text-left"
                                                    >
                                                        <Eye size={14} />
                                                        View Details
                                                    </button>
                                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-left">
                                                        <Trash2 size={14} />
                                                        Delete User
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
