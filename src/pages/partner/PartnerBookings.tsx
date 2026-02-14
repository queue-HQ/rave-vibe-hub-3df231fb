import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import EditorLayout from "@/components/layouts/EditorLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { getPartnerBookings, updatePartnerBookingStatus } from "@/api/partner";

interface PartnerBooking {
  id: number;
  event_id: number;
  event_name?: string;
  name: string;
  email: string;
  phone?: string;
  user_status: string;
  status: string;
  created_at?: string;
}

const statuses = ["Waiting Approval", "Pending", "Confirm", "Cancel", "Request Rejected"] as const;
const PER_PAGE = 15;

export default function PartnerBookings() {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, total_pages: 1, per_page: PER_PAGE, current_page: 1 });
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    event: "",
    start_date: "",
    end_date: "",
  });

  const loadBookings = async (page = currentPage, overrideFilters = appliedFilters, searchQuery = search) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: PER_PAGE,
        status: overrideFilters.status !== "all" ? overrideFilters.status : undefined,
        event_name: overrideFilters.event || undefined,
        search: searchQuery || undefined,
        start_date: overrideFilters.start_date || undefined,
        end_date: overrideFilters.end_date || undefined,
      };
      const res = await getPartnerBookings(params);
      if (res?.success) {
        setBookings(res.data || []);
        const pagination = res.pagination || {};
        setPaginationInfo({
          per_page: pagination.per_page ?? PER_PAGE,
          current_page: pagination.current_page ?? page,
          total: pagination.total ?? res.data?.length ?? 0,
          total_pages: Math.max(1, pagination.total_pages ?? 1),
        });
        setCurrentPage(page);
      } else {
        toast.error(res?.message || "Failed to load bookings");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await updatePartnerBookingStatus(bookingId, newStatus);
      if (res?.success) {
        toast.success("Booking updated");
        const updated = res?.data;
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, ...(updated || {}), user_status: newStatus } : b))
        );
      } else {
        toast.error(res?.message || "Failed to update booking");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const formatted = {
      status: statusFilter,
      event: eventFilter.trim(),
      start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
    };
    setAppliedFilters(formatted);
    setFiltersOpen(false);
    loadBookings(1, formatted, search);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setEventFilter("");
    setDateRange(undefined);
    const resetFilters = { status: "all", event: "", start_date: "", end_date: "" };
    setAppliedFilters(resetFilters);
    loadBookings(1, resetFilters, search);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loadBookings(1, appliedFilters, search);
  };

  const totalPages = paginationInfo.total_pages || 1;
  const firstItemIndex = bookings.length === 0 ? 0 : (currentPage - 1) * paginationInfo.per_page + 1;
  const lastItemIndex = bookings.length === 0 ? 0 : firstItemIndex + bookings.length - 1;

  const pageNumbers = useMemo(() => {
    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        set.add(i);
      }
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  return (
    <EditorLayout title="Partner Bookings">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Bookings</CardTitle>
              <p className="text-sm text-muted-foreground">Bookings for your events.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => loadBookings(currentPage)} disabled={loading}>
                Refresh
              </Button>
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle>Filter Bookings</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Status</p>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Event Name</p>
                      <Input placeholder="Search event name" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Date Range</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange?.from && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange?.to ? (
                                `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
                              ) : (
                                format(dateRange.from, "MMM d, yyyy")
                              )
                            ) : (
                              "Pick a date range"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => setDateRange(range ?? undefined)}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <Button onClick={applyFilters}>Apply Filters</Button>
                    <Button type="button" variant="ghost" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <SheetClose asChild>
                      <Button type="button" variant="outline">
                        Close
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings found.</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3">ID</th>
                      <th className="py-3">Name</th>
                      <th className="py-3">Email</th>
                      <th className="py-3">Internal Status</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Event</th>
                      <th className="py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-b-0">
                        <td className="py-3 font-medium">{booking.id}</td>
                        <td className="py-3">{booking.name}</td>
                        <td className="py-3">{booking.email}</td>
                        <td className="py-3">{booking.status || "-"}</td>
                        <td className="py-3">
                          <Select
                            onValueChange={(value) => handleStatusChange(booking.id, value)}
                            value={booking.user_status}
                            disabled={updatingId === booking.id}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3">{booking.event_name || "-"}</td>
                        <td className="py-3 text-muted-foreground">
                          {booking.created_at ? new Date(booking.created_at).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {paginationInfo.total
                    ? `Showing ${firstItemIndex}-${lastItemIndex} of ${paginationInfo.total} bookings`
                    : "No matching bookings"}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => currentPage > 1 && loadBookings(currentPage - 1)}
                  >
                    Prev
                  </Button>

                  {pageNumbers.map((page) => (
                    <Button
                      key={page}
                      type="button"
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => loadBookings(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => currentPage < totalPages && loadBookings(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </EditorLayout>
  );
}
