import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value?: string | number | null;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
  isLoading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, className, delay = 0, isLoading }: StatCardProps) {
  return (
    <div 
      className={cn(
        "group bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300  animate-fade-in",
        className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {isLoading ? <Skeleton className="h-9 w-24" /> : value ?? "-"}
          </div>
          {trend && !isLoading && (
            <p className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
