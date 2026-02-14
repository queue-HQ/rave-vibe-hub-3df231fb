import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CheckCircle, XCircle, TrendingUp, DollarSign } from "lucide-react";
import EditorLayout from "@/components/layouts/EditorLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { getPartnerOverview } from "@/api/partner";

interface PartnerOverviewData {
  total_events: number;
  total_accept_bookings: number;
  total_reject_bookings: number;
  total_sell: number;
  revenue: number;
  range_days: number;
  chart?: {
    labels: string[];
    sell: number[];
    revenue: number[];
  };
}

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
];

export default function PartnerDashboard() {
  const [overview, setOverview] = useState<PartnerOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<number>(7);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getPartnerOverview({ range });
        if (!mounted) return;
        if (res?.success) {
          setOverview(res.data ?? null);
        } else {
          toast.error(res?.message || "Failed to load partner overview");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load partner overview");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [range]);

  const chartData = useMemo(() => {
    if (!overview?.chart) return [];
    const { labels = [], sell = [], revenue = [] } = overview.chart;
    return labels.map((label, idx) => ({
      label,
      registrations: sell?.[idx] ?? 0,
      tickets: revenue?.[idx] ?? 0,
    }));
  }, [overview]);

  const formatNumber = (value?: number | null) => {
    if (value === null || value === undefined) return undefined;
    return value.toLocaleString();
  };

  return (
    <EditorLayout title="Partner Dashboard">
      <div className="min-h-screen bg-background">
        <main className="p-6 max-w-7xl mx-auto">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Events" value={formatNumber(overview?.total_events)} icon={CalendarDays} isLoading={loading} />
            <StatCard title="Accepted Bookings" value={formatNumber(overview?.total_accept_bookings)} icon={CheckCircle} isLoading={loading} />
            <StatCard title="Rejected Bookings" value={formatNumber(overview?.total_reject_bookings)} icon={XCircle} isLoading={loading} />
            <StatCard title="Total Sale" value={formatNumber(overview?.total_sell)} icon={TrendingUp} isLoading={loading} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
            <div className="lg:col-span-7">
              <AnalyticsChart
                data={chartData}
                range={range}
                onRangeChange={setRange}
                rangeOptions={RANGE_OPTIONS}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-3">
              <StatCard
                title="Revenue"
                value={overview?.revenue !== undefined ? `${overview.revenue.toLocaleString()} PKR` : undefined}
                icon={DollarSign}
                isLoading={loading}
              />
            </div>
          </section>
        </main>
      </div>
    </EditorLayout>
  );
}
