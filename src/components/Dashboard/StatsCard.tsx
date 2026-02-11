import { clsx, type ClassValue } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    orange: 'bg-orange-500/10 text-orange-500',
    purple: 'bg-purple-500/10 text-purple-500',
};

export default function StatsCard({ label, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{label}</p>
                    <h3 className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{value}</h3>

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={cn(
                                "text-xs font-medium",
                                trend.isUp ? "text-green-500" : "text-red-500"
                            )}>
                                {trend.isUp ? '+' : '-'}{trend.value}%
                            </span>
                            <span className="text-xs text-slate-500">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={cn("p-3 rounded-xl", colorStyles[color])}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}
