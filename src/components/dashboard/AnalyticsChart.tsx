import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartPoint {
  label: string;
  registrations: number;
  tickets: number;
}

interface RangeOption {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data?: ChartPoint[];
  range: number;
  onRangeChange: (value: number) => void;
  rangeOptions: RangeOption[];
  loading?: boolean;
}

export function AnalyticsChart({ data, range, onRangeChange, rangeOptions, loading }: AnalyticsChartProps) {
  const safeData = data ?? [];
  const totalRegistrations = safeData.reduce((sum, item) => sum + (item.registrations || 0), 0);
  const totalTickets = safeData.reduce((sum, item) => sum + (item.tickets || 0), 0);
  const isEmpty = !loading && safeData.length === 0;

  return (
    <div className="bg-card rounded-lg p-6 shadow-card h-full  animate-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Full Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor registrations and ticket confirmations over your selected window.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(range)} onValueChange={(value) => onRangeChange(Number(value))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {rangeOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[320px] w-full">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Not enough data for the selected range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={safeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(0, 0%, 90%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px hsl(0 0% 0% / 0.1)",
                }}
                labelStyle={{ color: "hsl(0, 0%, 8%)", fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="hsl(var(--chart-2, 12 85% 59%))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:grid-cols-2">
        <p>
          Total registrations: <span className="font-semibold text-foreground">{loading ? "-" : totalRegistrations.toLocaleString()}</span>
        </p>
        <p>
          Total tickets confirmed: <span className="font-semibold text-foreground">{loading ? "-" : totalTickets.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
