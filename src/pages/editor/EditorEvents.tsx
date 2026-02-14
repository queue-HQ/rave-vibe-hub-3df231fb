import { Fragment, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import EditorLayout from "@/components/layouts/EditorLayout";
import {
  bulkDeleteAdminEvents,
  deleteAdminEvent,
  getAdminEvents,
  type EventQueryParams,
} from "@/api/admin";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ExternalLink, Filter, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AdminEvent {
  id: number;
  title: string;
  status: string;
  event_date?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  price?: string;
  slug?: string;
  permalink?: string;
}

const EVENT_STATUSES = ["publish", "draft", "pending", "future", "private"] as const;
const PER_PAGE = 10;

export default function EditorEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ status: "all", start_date: "", end_date: "" });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, total_pages: 1, per_page: PER_PAGE });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadEvents = async (page = currentPage, overrides?: Partial<EventQueryParams>, searchQuery = search) => {
    const rawStatus = overrides?.status ?? appliedFilters.status;
    const normalizedStatus = rawStatus && rawStatus !== "all" ? rawStatus : undefined;
    const startDate = overrides?.start_date ?? appliedFilters.start_date;
    const endDate = overrides?.end_date ?? appliedFilters.end_date;

    const params: EventQueryParams = {
      page,
      per_page: PER_PAGE,
      search: searchQuery || undefined,
      status: normalizedStatus,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    try {
      setLoading(true);
      const res = await getAdminEvents(params);
      if (res?.success) {
        setEvents(res.data || []);
        const pagination = res.pagination || {};
        setPaginationInfo({
          total: pagination.total ?? (res.data?.length ?? 0),
          total_pages: Math.max(1, pagination.total_pages ?? 1),
          per_page: pagination.per_page ?? PER_PAGE,
        });
        setCurrentPage(page);
        setSelectedIds([]);
      } else {
        toast.error(res?.message || "Failed to load events");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const formatted = {
      status: statusFilter,
      start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
    };
    setAppliedFilters(formatted);
    setFiltersOpen(false);
    loadEvents(1, formatted, search);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateRange(undefined);
    const reset = { status: "all", start_date: "", end_date: "" };
    setAppliedFilters(reset);
    loadEvents(1, reset, search);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loadEvents(1, undefined, search);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(events.map((event) => event.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (eventId: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, eventId] : prev.filter((id) => id !== eventId)));
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      setDeletingId(eventId);
      const res = await deleteAdminEvent(eventId);
      if (res?.success) {
        toast.success("Event deleted");
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        setSelectedIds((prev) => prev.filter((id) => id !== eventId));
      } else {
        toast.error(res?.message || "Failed to delete event");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      toast.error("Select at least one event");
      return;
    }
    try {
      setBulkDeleting(true);
      const res = await bulkDeleteAdminEvents(selectedIds);
      if (res?.success) {
        toast.success(res?.message || `Deleted ${selectedIds.length} events`);
        setEvents((prev) => prev.filter((event) => !selectedIds.includes(event.id)));
        setSelectedIds([]);
      } else {
        toast.error(res?.message || "Failed to delete events");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete events");
    } finally {
      setBulkDeleting(false);
    }
  };

  // const handleViewEvent = (eventItem: AdminEvent) => {
  //   const url = eventItem.permalink || (eventItem.slug ? `/event/${eventItem.slug}` : "");
  //   if (!url) {
  //     toast.error("Event URL unavailable");
  //     return;
  //   }
  //   window.open(url, "_blank");
  // };

  const handleViewEvent = (eventItem: AdminEvent) => {
  if (!eventItem.slug) {
    toast.error("Event URL unavailable");
    return;
  }

  const currentUrl = new URL(window.location.href);
  const eventUrl = new URL(`/event/${eventItem.slug}`, currentUrl.origin);

  // Optional: forward params
  currentUrl.searchParams.forEach((value, key) => {
    eventUrl.searchParams.set(key, value);
  });

  window.open(eventUrl.toString(), "_blank");
};

  const selectedCount = selectedIds.length;
  const allSelected = events.length > 0 && selectedCount === events.length;
  const totalPages = paginationInfo.total_pages || 1;
  const firstItemIndex = events.length === 0 ? 0 : (currentPage - 1) * paginationInfo.per_page + 1;
  const lastItemIndex = events.length === 0 ? 0 : firstItemIndex + events.length - 1;

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

  const renderPagination = () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) loadEvents(currentPage - 1);
            }}
          />
        </PaginationItem>
        {pageNumbers.map((page, index) => (
          <Fragment key={page}>
            {index > 0 && pageNumbers[index - 1] !== page - 1 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  loadEvents(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          </Fragment>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) loadEvents(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <EditorLayout title="Events">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Manage Events</CardTitle>
              <p className="text-sm text-muted-foreground">Filter, preview, edit, or delete upcoming and past events.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedCount > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="gap-2"
                >
                  {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Selected ({selectedCount})
                </Button>
              )}
              <Button variant="outline" onClick={() => loadEvents(currentPage)} disabled={loading}>
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
                    <SheetTitle>Filter Events</SheetTitle>
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
                          {EVENT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Event Date Range</p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateRange?.from && "text-muted-foreground"
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
              <Link to="/editor/events/new">
                <Button>Add Event</Button>
              </Link>
            </div>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
            <Input placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} />
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
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">No events found.</p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-3">
                        <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))} />
                      </th>
                      <th className="py-3">Title</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Time</th>
                      <th className="py-3">Venue</th>
                      <th className="py-3">Price</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b last:border-b-0">
                        <td className="py-3">
                          <Checkbox
                            checked={selectedIds.includes(event.id)}
                            onCheckedChange={(checked) => toggleSelect(event.id, Boolean(checked))}
                          />
                        </td>
                        <td className="py-3 font-medium">{event.title}</td>
                        <td className="py-3 capitalize">{event.status}</td>
                        <td className="py-3">{event.event_date || "-"}</td>
                        <td className="py-3">
                          {event.time || [event.start_time, event.end_time].filter(Boolean).join(" - ") || "-"}
                        </td>
                        <td className="py-3">{event.venue || "-"}</td>
                        <td className="py-3">{event.price || "-"}</td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewEvent(event)}
                              title="View event"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Link to={`/editor/events/${event.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={deletingId === event.id}
                              title="Delete event"
                            >
                              {deletingId === event.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {firstItemIndex}-{lastItemIndex} of {paginationInfo.total} events
                </p>
                {renderPagination()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </EditorLayout>
  );
}
