import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  ResponsiveContainer,
} from "recharts";
import EditorLayout from "@/components/layouts/EditorLayout";
import { getAdminOverview } from "@/api/admin";
import { toast } from "sonner";

interface OverviewData {
  total_users: number;
  total_events: number;
  pending_bookings: number;
  media_files: number;
  tickets_bought: number;
  today_registrations: number;
  analytics_total: number;
  range_days: number;
  chart?: {
    labels: string[];
    registrations: number[];
    tickets: number[];
  };
}

const summaryCards = [
  { key: "total_users", label: "Total Users" },
  { key: "total_events", label: "Total Events" },
  { key: "pending_bookings", label: "Pending Bookings" },
  { key: "media_files", label: "Media Files" },
] as const;

const insightCards = [
  { key: "analytics_total", label: "Analytics" },
  { key: "tickets_bought", label: "Tickets Buy" },
  { key: "today_registrations", label: "Today Registrations" },
] as const;

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
];

export default function EditorDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<number>(7);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getAdminOverview({ range });
        if (res?.success && isMounted) {
          setData(res.data);
        } else if (isMounted) {
          toast.error(res?.message || "Failed to load overview");
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(
            error.response?.data?.message || "Failed to load overview"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [range]);

  const chartData = useMemo(() => {
    if (!data?.chart) return [];
    const { labels, registrations, tickets } = data.chart;
    return labels.map((label, idx) => ({
      label,
      registrations: registrations?.[idx] ?? 0,
      tickets: tickets?.[idx] ?? 0,
    }));
  }, [data]);

  const chartConfig = {
    registrations: {
      label: "Registrations",
      color: "hsl(var(--primary))",
    },
    tickets: {
      label: "Tickets",
      color: "hsl(var(--chart-2, 12 85% 59%))",
    },
  } as const;

  return (
    <EditorLayout title="Editor Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((stat) => (
            <Card key={stat.key} className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <p className="text-3xl font-semibold">
                    {data ? data[stat.key] ?? "-" : "-"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {insightCards.map((stat) => (
            <Card key={stat.key} className="border-primary/20 shadow-sm">
              <CardHeader>
                <CardDescription className="uppercase text-xs tracking-wide text-primary/80">
                  {stat.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-semibold">
                    {data ? data[stat.key] ?? "-" : "-"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Registrations vs ticket confirmations over time.
              </CardDescription>
            </div>
            <Select
              value={String(range)}
              onValueChange={(value) => setRange(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not enough data for the selected range.
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[360px]">
                <ResponsiveContainer>
                  <LineChart
                    data={chartData}
                    margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="label"
                      stroke="currentColor"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-xs"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="var(--color-registrations, hsl(var(--primary)))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="tickets"
                      stroke="var(--color-tickets, hsl(var(--chart-2, 12 85% 59%)))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </EditorLayout>
  );
}
