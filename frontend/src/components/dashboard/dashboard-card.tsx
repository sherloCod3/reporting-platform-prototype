import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  onClick?: () => void;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  action,
  onClick
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-lg border border-border overflow-hidden',
        'hover:border-primary/50 hover:shadow-sm',
        'ui-motion duration-200 cursor-pointer group flex flex-col h-full'
      )}
    >
      <div className="bg-muted/40 border-l-2 border-l-primary h-20 flex items-center px-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {description}
        </p>

        <div className="mt-auto pt-4 border-t border-border">{action}</div>
      </div>
    </div>
  );
}
