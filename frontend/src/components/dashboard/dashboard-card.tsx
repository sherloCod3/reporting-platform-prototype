import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    action?: React.ReactNode;
    onClick?: () => void;
}

export function DashboardCard({ title, description, icon: Icon, gradient, action, onClick }: DashboardCardProps) {
    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-500 hover:shadow-xl transform hover:-translate-y-1 ui-motion duration-200 cursor-pointer group flex flex-col h-full"
        >
            <div className={cn("h-24 relative overflow-hidden", gradient)}>
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-white">
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
                    {description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                    {action}
                </div>
            </div>
        </div>
    );
}
