import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CalendarDays, CheckCircle, Clock, Activity, Ticket, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { AnalyticsSummary, type SummaryMetric } from "@/components/dashboard/AnalyticsSummary";
import { RecentUsersTable } from "@/components/dashboard/RecentUsersTable";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { getAdminOverview, getAdminEvents, getAdminUsers } from "@/api/admin";
import EditorLayout from "@/components/layouts/EditorLayout";

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

interface AdminUserSummary {
  id: number;
  display_name?: string;
  username?: string;
  email?: string;
  registered_at?: string;
}

interface AdminEventSummary {
  id: number;
  title: string;
  status?: string;
  date?: string;
  time?: string;
}

type OverviewStatKey = keyof Pick<OverviewData, "total_users" | "total_events" | "tickets_bought" | "pending_bookings">;

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
];

const RECENT_LIMIT = 5;

const statCards: { title: string; key: OverviewStatKey; icon: typeof Users }[] = [
  { title: "Total Users", key: "total_users", icon: Users },
  { title: "Total Events", key: "total_events", icon: CalendarDays },
  { title: "Confirmed Bookings", key: "tickets_bought", icon: CheckCircle },
  { title: "Pending Bookings", key: "pending_bookings", icon: Clock },
];

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) return undefined;
  return value.toLocaleString();
};

const EditorDashboard = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [range, setRange] = useState<number>(7);
  const [recentUsers, setRecentUsers] = useState<AdminUserSummary[]>([]);
  const [recentUsersLoading, setRecentUsersLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState<AdminEventSummary[]>([]);
  const [recentEventsLoading, setRecentEventsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setOverviewLoading(true);
        const res = await getAdminOverview({ range });
        if (!isMounted) return;
        if (res?.success) {
          setOverview(res.data ?? null);
        } else {
          toast.error(res?.message || "Failed to load overview");
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Failed to load overview");
        }
      } finally {
        if (isMounted) {
          setOverviewLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [range]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setRecentUsersLoading(true);
        const res = await getAdminUsers({ page: 1, per_page: RECENT_LIMIT });
        if (!isMounted) return;
        if (res?.success) {
          setRecentUsers(res.data || []);
        } else {
          toast.error(res?.message || "Failed to load users");
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Failed to load users");
        }
      } finally {
        if (isMounted) {
          setRecentUsersLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setRecentEventsLoading(true);
        const res = await getAdminEvents({ page: 1, per_page: RECENT_LIMIT });
        if (!isMounted) return;
        if (res?.success) {
          setRecentEvents(res.data || []);
        } else {
          toast.error(res?.message || "Failed to load events");
        }
      } catch (error: any) {
        if (isMounted) {
          toast.error(error.response?.data?.message || "Failed to load events");
        }
      } finally {
        if (isMounted) {
          setRecentEventsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!overview?.chart) return [];
    const { labels = [], registrations = [], tickets = [] } = overview.chart;
    return labels.map((label, idx) => ({
      label,
      registrations: registrations?.[idx] ?? 0,
      tickets: tickets?.[idx] ?? 0,
    }));
  }, [overview]);

  const summaryMetrics: SummaryMetric[] = useMemo(() => {
    return [
      {
        label: "Analytics Total",
        value: formatNumber(overview?.analytics_total),
        description: overview ? `Across the last ${overview.range_days ?? range} days` : undefined,
        icon: Activity,
        trend: "positive",
      },
      {
        label: "Tickets Bought",
        value: formatNumber(overview?.tickets_bought),
        description: "All confirmed ticket purchases",
        icon: Ticket,
        trend: "positive",
      },
      {
        label: "Today Registrations",
        value: formatNumber(overview?.today_registrations),
        description: "New users today",
        icon: UserPlus,
        trend: ((overview?.today_registrations ?? 0) > 0 ? "positive" : "neutral") as SummaryMetric["trend"],
      },
    ];
  }, [overview, range]);

  const recentUserRows = useMemo(() => {
    return recentUsers.map((user) => ({
      id: user.id,
      name: user.display_name || user.username || "Unnamed user",
      email: user.email || "-",
      date: user.registered_at,
    }));
  }, [recentUsers]);

  const recentEventRows = useMemo(() => {
    return recentEvents.map((event) => ({
      id: event.id,
      name: event.title,
      date: event.date,
      status: event.status,
    }));
  }, [recentEvents]);

  return (
    <EditorLayout title="Editor Dashboard">
      <div className="min-h-screen bg-background">
      <main className="p-6 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((stat, index) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={formatNumber(overview?.[stat.key])}
              icon={stat.icon}
              delay={index * 50}
              isLoading={overviewLoading}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
          <div className="lg:col-span-7">
            <AnalyticsChart
              data={chartData}
              range={range}
              onRangeChange={setRange}
              rangeOptions={RANGE_OPTIONS}
              loading={overviewLoading}
            />
          </div>
          <div className="lg:col-span-3">
            <AnalyticsSummary metrics={summaryMetrics} loading={overviewLoading} />
          </div>
        </section>

        <section className="mb-6">
          <RecentUsersTable
            users={recentUserRows}
            loading={recentUsersLoading}
            onViewAll={() => navigate("/editor/users")}
          />
        </section>

        <section>
          <RecentEventsTable
            events={recentEventRows}
            loading={recentEventsLoading}
            onViewAll={() => navigate("/editor/events")}
          />
        </section>
      </main>
    </div>
    </EditorLayout>
  );
};

export default EditorDashboard;
