import { useTheme } from '@/context/ThemeContext';
import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 bg-[var(--bg-app)] border-b border-[var(--border-color)] flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-4 flex-1">
                <div className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                    <Menu size={20} />
                </div>
                <div className="max-w-md w-full relative hidden md:block text-[var(--text-primary)]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search bookings, users..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end text-right hidden sm:flex">
                    <h1 className="text-sm font-semibold text-[var(--text-primary)]">Dashboard</h1>
                    <p className="text-xs text-[var(--text-secondary)]">Welcome back, Admin!</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-app)]"></span>
                    </button>

                    <div className="h-8 w-px bg-[var(--border-color)] mx-1"></div>

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                A
                            </div>
                            <ChevronDown size={14} className={`text-[var(--text-secondary)] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 border-b border-[var(--border-color)]">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Admin</p>
                                        <p className="text-xs text-[var(--text-secondary)]">admin@exploreindia.com</p>
                                    </div>
                                </div>
                                <div className="p-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors">
                                        <User size={16} className="text-[var(--text-secondary)]" />
                                        <span>My Profile</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTheme();
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-app)] rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {theme === 'dark' ? (
                                                <Moon size={16} className="text-blue-400" />
                                            ) : (
                                                <Sun size={16} className="text-amber-500" />
                                            )}
                                            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                                        </div>
                                        <div className={`w-8 h-4 bg-slate-700/50 rounded-full relative transition-colors ${theme === 'light' ? 'bg-blue-100' : ''}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${theme === 'light' ? 'left-4.5 bg-blue-600' : 'left-0.5 bg-slate-400'}`}></div>
                                        </div>
                                    </button>
                                </div>
                                <div className="p-1 border-t border-[var(--border-color)]">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <LogOut size={16} />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
