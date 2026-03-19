import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  User,
  Settings,
  LogOut,
  Home,
  X,
  Logs,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { Skeleton } from "@/components/ui/skeleton";
import AppSidebar from "@/components/sidebar/AppSidebar";
import slugify from "@/lib/slugify";
import { useUserProfile } from "@/context/UserProfileContext";
import { useEvents } from "@/context/EventsContext";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, isLoading, isAdmin, refetch } = useUserProfile();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const userName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.display_name ||
    user?.username ||
    "User";
  const { events, error } = useEvents();
  const [ticketsCount, setTicketsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate("/editor", { replace: true });
    }
  }, [isLoading, isAdmin, navigate]);

  const upcomingEvents = useMemo(() => {
    const parseEventDateTime = (event: any) => {
      const baseDate: string | undefined = event?.start_date || event?.date;
      if (!baseDate) return null;

      const startTime = typeof event?.time === "string"
        ? event.time.split("-")[0]?.trim()
        : "";

      const candidates = [] as string[];
      if (startTime) {
        candidates.push(`${baseDate} ${startTime} GMT+0500`);
        candidates.push(`${baseDate} ${startTime}`);
      }
      candidates.push(`${baseDate} GMT+0500`);
      candidates.push(baseDate);

      for (const candidate of candidates) {
        const parsed = new Date(candidate);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }

      return null;
    };

    const now = Date.now();

    const enrichedEvents = (events || [])
      .map((event) => ({
        event,
        startAt: parseEventDateTime(event),
      }))
      .filter((item) => item.startAt && item.startAt.getTime() >= now)
      .sort((a, b) => {
        return a.startAt!.getTime() - b.startAt!.getTime();
      });

    const count = enrichedEvents.length;
    let subtitle = "No upcoming events";

    if (enrichedEvents.length > 0) {
      const diffMs = enrichedEvents[0].startAt!.getTime() - now;

      if (diffMs <= 0) {
        subtitle = "Live now!";
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
          subtitle = `Next event in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
        } else if (diffHours > 0) {
          subtitle = `Next event in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
        } else if (diffMinutes > 0) {
          subtitle = `Next event in ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
        } else {
          subtitle = "Starting soon";
        }
      }
    }

    return { count, subtitle };
  }, [events]);

  const ticketsOwned = useMemo(() => {
    if (!user) return 0;
    const storedBookings = localStorage.getItem("user_bookings_count");
    return storedBookings ? Number(storedBookings) : 0;
  }, [user]);

  const storedUserStatus = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const parsed = JSON.parse(raw) as { status?: string };
      return String(parsed?.status || "").toLowerCase();
    } catch {
      return "";
    }
  })();
  const accountStatus = String(user?.status || storedUserStatus || "").toLowerCase();
  const isPendingSubscriber = accountStatus === "pending";

  useEffect(() => {
    if (!isPendingSubscriber) return;
    const interval = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(interval);
  }, [isPendingSubscriber, refetch]);

  useEffect(() => {
    if (!accountStatus) return;
    const statusKey = "account_status_last_seen";
    const pendingToastKey = "pending_status_toast_shown";
    const previousStatus = localStorage.getItem(statusKey);

    if (accountStatus === "pending" && sessionStorage.getItem(pendingToastKey) !== "1") {
      toast.error("Your account is pending approval.");
      sessionStorage.setItem(pendingToastKey, "1");
    }

    if (accountStatus === "approved" && previousStatus === "pending") {
      toast.success("Your account is approved.");
      sessionStorage.removeItem(pendingToastKey);
    }

    localStorage.setItem(statusKey, accountStatus);
  }, [accountStatus]);

  return (
    <div className="min-h-screen bg-background">

  {/* Mobile Navbar */}
  <div className="lg:hidden w-full p-4 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
    <img src={logo} className="h-10 sm:h-12" alt="Logo" />

    <span className="cursor-pointer" onClick={() => setMobileSidebarOpen(true)}>
      <Logs className="h-7 w-7" />
    </span>
  </div>

  {/* Mobile Sidebar */}
  {mobileSidebarOpen && (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setMobileSidebarOpen(false)}
      />
      <AppSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
    </>
  )}

  {/* Desktop Sidebar */}
  <div className="hidden lg:block">
    <AppSidebar />
  </div>

  {/* Main Content */}
  <main className="ml-0 lg:ml-64 p-4 sm:p-6">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-52 mb-2" />
            <Skeleton className="h-5 w-72" />
          </>
        ) : (
          <>
            <h1 className="pt-4 text-2xl sm:text-4xl font-bold mb-2 leading-tight">
              Welcome back,{" "}
              <span className="text-primary">{userName}</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Ready to discover the underground scene?
            </p>
          </>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        
        {/* Card 1 */}
        <Card className="gradient-card neon-border hover-lift bg-gradient-to-br from-primary/10 via-card to-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
              <span>Upcoming Events</span>
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32 mt-2" />
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  {upcomingEvents.count}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {upcomingEvents.subtitle}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="gradient-card neon-border hover-lift bg-gradient-to-br from-primary/10 via-card to-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
              <span>Tickets Owned</span>
              <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-20 mt-2" />
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-bold text-accent">
                  {ticketsOwned}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ready to party
                </p>
              </>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Your Recent Events</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {events?.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date} - {event.venue}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/event/${event.slug}`}
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                      if (!isPendingSubscriber) return;
                      e.preventDefault();
                      toast.error("Your account is pending approval.");
                    }}
                  >
                    <Button className="w-full sm:w-auto">View Details</Button>
                  </Link>

                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  </main>
</div>

  );
};

export default Dashboard;

