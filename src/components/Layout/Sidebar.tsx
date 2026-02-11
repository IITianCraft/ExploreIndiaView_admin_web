import { clsx, type ClassValue } from 'clsx';
import {
    Car,
    ChevronLeft,
    ChevronRight,
    Handshake,
    Hotel,
    LayoutDashboard,
    Package,
    Plane,
    Train,
    Users,
    UsersRound,
    Wallet
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    {
        label: 'Overview', items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        ]
    },
    {
        label: 'Management', items: [
            { label: 'Users', icon: Users, path: '/users' },
            { label: 'Partners', icon: Handshake, path: '/partners' },
            { label: 'Affiliates', icon: UsersRound, path: '/affiliates' },
            { label: 'Wallet', icon: Wallet, path: '/wallet' },
        ]
    },
    {
        label: 'Services', items: [
            { label: 'Flights', icon: Plane, path: '/services/flights' },
            { label: 'Trains', icon: Train, path: '/services/trains' },
            { label: 'Hotels', icon: Hotel, path: '/services/hotels' },
            { label: 'Cabs', icon: Car, path: '/services/cabs' },
        ]
    },
    {
        label: 'Tour Packages', items: [
            { label: 'Packages', icon: Package, path: '/packages' },
        ]
    },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={cn(
            "relative h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col",
            collapsed ? "w-20" : "w-64"
        )}>
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <span className="font-bold text-white tracking-tighter">EI</span>
                </div>
                {!collapsed && (
                    <span className="font-bold text-xl tracking-tight text-white">Explore India</span>
                )}
            </div>

            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
                {navItems.map((group) => (
                    <div key={group.label} className="space-y-2">
                        {!collapsed && (
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {group.label}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <item.icon size={20} className={cn(
                                        "shrink-0",
                                        collapsed && "mx-auto"
                                    )} />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className={cn(
                    "bg-slate-800/50 rounded-xl p-3 flex items-center gap-3",
                    collapsed && "justify-center"
                )}>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg shadow-blue-500/20">
                        A
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">Admin</p>
                            <p className="text-xs text-slate-500 truncate">Super Admin</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
