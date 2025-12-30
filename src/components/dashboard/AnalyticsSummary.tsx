import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface SummaryMetric {
  label: string;
  value?: string | number | null;
  description?: string;
  icon: LucideIcon;
  trend?: "positive" | "negative" | "neutral";
}

interface AnalyticsSummaryProps {
  metrics: SummaryMetric[];
  loading?: boolean;
}

export function AnalyticsSummary({ metrics, loading }: AnalyticsSummaryProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card h-full animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="text-lg font-semibold text-foreground mb-6">Summary</h3>
      
      <div className="space-y-5">
        {metrics.map((metric, index) => (
          <div 
            key={`${metric.label}-${index}`} 
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
          >
            <div className={cn(
              "p-2 rounded-lg",
              metric.trend === "positive" ? "bg-success/10" : metric.trend === "negative" ? "bg-destructive/10" : "bg-muted"
            )}>
              <metric.icon className={cn(
                "h-4 w-4",
                metric.trend === "positive"
                  ? "text-success"
                  : metric.trend === "negative"
                    ? "text-destructive"
                    : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className="text-xl font-bold text-foreground mt-0.5">
                {loading ? <Skeleton className="h-6 w-20" /> : metric.value ?? "-"}
              </div>
              {!loading && metric.description && (
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
