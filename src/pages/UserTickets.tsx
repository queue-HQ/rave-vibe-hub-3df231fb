import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { Skeleton } from "@/components/ui/skeleton";
import AppSidebar from "@/components/sidebar/AppSidebar";
import { useUserProfile } from "@/context/UserProfileContext";
import { getBookings } from "@/api/user";
import { useToast } from "@/hooks/use-toast";

const UserTickets = () => {
  const { user, isLoading } = useUserProfile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState<"current" | "past" | "cancel">("current");
  const { toast } = useToast();
  const navigate = useNavigate();

  const userName = user?.display_name || user?.username || "";

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const data = await getBookings();
        setBookings(data?.data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const getEventDate = (bookingDate?: string) => {
    if (!bookingDate) return null;
    const parsed = Date.parse(bookingDate);
    if (Number.isNaN(parsed)) return null;
    return new Date(parsed);
  };

  const isPastEvent = (booking) => {
    const eventDate = getEventDate(booking?.booking_date || booking?.registered_at);
    if (!eventDate) return false;
    const now = new Date();
    const diff = now.getTime() - eventDate.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    return diff > oneDayMs;
  };

  const categorizedBookings = useMemo(() => {
    const groups = {
      current: [] as any[],
      past: [] as any[],
      cancel: [] as any[],
    };

    bookings.forEach((booking) => {
      const status = (booking?.user_status || "").toLowerCase();
      if (status === "cancel") {
        groups.cancel.push(booking);
        return;
      }

      if (isPastEvent(booking)) {
        groups.past.push(booking);
      } else {
        groups.current.push(booking);
      }
    });

    return groups;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return categorizedBookings[activeTab];
  }, [activeTab, categorizedBookings]);

  const hanldeView = (status, id) => {
    console.log(status);
    if (status === "Pending") {
      toast({
        title: "Waiting for Approval",
        description: "Please wait until your booking is approved.",
        variant: "destructive",
      });
    }

    if (status === "Cancel") {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled.",
        variant: "destructive",
      });
    }

    if (status === "Confirm") {
      navigate("/dashboard/view-ticket/" + id);
      // toast({
      //   title: "Booking Cancelled",
      //   description: "Your booking has been cancelled.",
      //   variant: "destructive",
      // });
    }

    console.log("View Ticket Clicked");
  };

  const renderTabButton = (value: "current" | "past" | "cancel", label: string) => (
    <Button
      key={value}
      variant={activeTab === value ? "default" : "ghost"}
      className="capitalize"
      onClick={() => setActiveTab(value)}
    >
      {label} ({categorizedBookings[value].length})
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">

  {/* ---------------------- MOBILE NAVBAR ---------------------- */}
  <div className="lg:hidden w-full p-4 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
    <img src={logo} className="h-10 sm:h-12" alt="Logo" />
    <span className="cursor-pointer" onClick={() => setMobileSidebarOpen(true)}>
      <Logs className="h-6 w-6" />
    </span>
  </div>

  {/* ---------------------- MOBILE SIDEBAR ---------------------- */}
  {mobileSidebarOpen && (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setMobileSidebarOpen(false)}
      />
      <AppSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
    </>
  )}

  {/* ---------------------- DESKTOP SIDEBAR ---------------------- */}
  <div className="hidden lg:block">
    <AppSidebar />
  </div>

  {/* ---------------------- MAIN CONTENT ---------------------- */}
  <main className="ml-0 lg:ml-64 p-4 sm:p-5 md:p-6">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {isLoading ? (
          <>
            <Skeleton className="h-8 sm:h-10 w-48 sm:w-72 mb-3" />
            <Skeleton className="h-5 sm:h-6 w-64 sm:w-96" />
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-snug">
              Welcome back,
              <span className="text-primary ml-1">
                {user?.first_name + " " + user?.last_name}
              </span>{" "}
              🎉
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Ready to discover the underground scene?
            </p>
          </>
        )}
      </div>

      {/* ---------------------- BOOKINGS CARD ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            Event Booking Details
          </CardTitle>
        </CardHeader>

        <CardContent>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {renderTabButton("current", "Current Bookings")}
            {renderTabButton("past", "Past Bookings")}
            {renderTabButton("cancel", "Cancel Bookings")}
          </div>

          {/* Loading */}
          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm sm:text-base">
              No tickets found.
            </p>
          ) : (
            <div className="space-y-4">

              {/* Booking Items */}
              {filteredBookings.map((booking) => {
                const status = booking?.user_status || "Pending";
                const normalizedStatus = status.toLowerCase();
                const pastEvent = activeTab === "past" || isPastEvent(booking);
                const isCancelled = normalizedStatus === "cancel";
                const canViewTicket =
                  normalizedStatus === "confirm" && !pastEvent && !isCancelled;

                const buttonLabel =
                  canViewTicket
                    ? "View Ticket"
                    : normalizedStatus === "confirm" && pastEvent
                    ? "Event Ended"
                    : normalizedStatus === "cancel"
                    ? "Booking Cancelled"
                    : normalizedStatus === "pending"
                    ? "Pending Approval"
                    : status;

                return (
                  <div
                    key={booking.booking_id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={booking.feature_image}
                        alt="Event"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border"
                      />
                      <div>
                        <h3 className="font-bold text-base sm:text-lg leading-tight">
                          {booking.event_title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Event Date: {booking.event_date}
                          <span className="text-primary pl-3 text-xs">
                            {booking.event_time}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right (Button) */}
                    <div className="w-full sm:w-auto">
                      <Button
                        className="w-full sm:w-auto"
                        disabled={pastEvent || isCancelled}
                        onClick={() =>
                          hanldeView(booking?.user_status, booking?.booking_id)
                        }
                      >
                        {buttonLabel}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </main>
</div>

  );
};

export default UserTickets;
