import { Fragment, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import EditorLayout from "@/components/layouts/EditorLayout";
import {
  bulkDeleteAdminBookings,
  deleteAdminBooking,
  exportAdminBookings,
  getAdminBookings,
  updateAdminBookingStatus,
} from "@/api/admin";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Download, Filter, Trash2, X, Printer } from "lucide-react";
import api from "@/lib/axios";

interface CoupleBookingDetails {
  name?: string;
  email?: string;
  phone?: string;
  nic?: string;
  carNumber?: string;
  invited_by_email?: string;
  isGuestEntry?: boolean;
  pair_code?: string;
}

interface BookingInvitee {
  id?: number;
  name?: string;
  email?: string;
  status?: string;
  gender?: string;
}

interface AdminBooking {
  id: number;
  event_id: number;
  event_name?: string;
  name: string;
  email: string;
  phone: string;
  user_status: string;
  status: string;
  qr_id?: string;
  nic?: string;
  created_at?: string;
  couple_name?: string;
  is_couple_booking?: boolean;
  couple_booking?: CoupleBookingDetails | null;
  pair_code?: string;
  is_guest_entry?: boolean;
  invite_stats?: {
    total: number;
    accepted: number;
    waiting: number;
    rejected: number;
  };
  invitees?: BookingInvitee[];
  is_group_booking?: boolean;
  tier_name?: string;
  tier_id?: number;
  tier_gender?: string;
  required_persons?: number;
  group_size?: number;
}

const statuses = ["Waiting Approval", "Pending", "Confirm", "Cancel", "Request Rejected"] as const;
const PER_PAGE = 15;

const formatInviteStatus = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "waiting approval") return "pending";
  if (normalized === "pending" || normalized === "confirm") return "accepted";
  if (normalized === "request rejected" || normalized === "cancel") return "rejected";
  return status || "pending";
};

const formatGenderLabel = (gender?: string) => {
  const normalized = String(gender || "").toLowerCase().trim();
  if (!normalized) return "";
  return normalized;
};

export default function EditorBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, total_pages: 1, per_page: PER_PAGE, current_page: 1 });
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all",
    gender: "all",
    event: "",
    start_date: "",
    end_date: "",
  });
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadBookings = async (page = currentPage, overrideFilters = appliedFilters, searchQuery = search) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: PER_PAGE,
        status: overrideFilters.status !== "all" ? overrideFilters.status : undefined,
        gender: overrideFilters.gender !== "all" ? overrideFilters.gender : undefined,
        event_name: overrideFilters.event || undefined,
        search: searchQuery || undefined,
        start_date: overrideFilters.start_date || undefined,
        end_date: overrideFilters.end_date || undefined,
      };
      const res = await getAdminBookings(params);
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

  useEffect(() => {
    loadBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (bookingId: number, status: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await updateAdminBookingStatus(bookingId, status);
      if (res?.success) {
        toast.success("Booking updated");
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId ? { ...booking, user_status: status } : booking
          )
        );
      } else {
        toast.error(res?.message || "Failed to update booking");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewBooking = (bookingId: number) => {
    navigate(`/editor/view-booking/${bookingId}`);
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      setDeletingId(bookingId);
      const res = await deleteAdminBooking(bookingId);
      if (res?.success) {
        toast.success("Booking deleted");
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
        setSelectedIds((prev) => prev.filter((id) => id !== bookingId));
      } else {
        toast.error(res?.message || "Failed to delete booking");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete booking");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      toast.error("Select at least one booking to delete");
      return;
    }
    try {
      setBulkDeleting(true);
      const res = await bulkDeleteAdminBookings(selectedIds);
      if (res?.success) {
        toast.success(`Deleted ${res.deleted || selectedIds.length} bookings`);
        setBookings((prev) => prev.filter((booking) => !selectedIds.includes(booking.id)));
        setSelectedIds([]);
      } else {
        toast.error(res?.message || "Failed to delete bookings");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete bookings");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportParams = {
        status: appliedFilters.status !== "all" ? appliedFilters.status : undefined,
        gender: appliedFilters.gender !== "all" ? appliedFilters.gender : undefined,
        event_name: appliedFilters.event || undefined,
        search: search || undefined,
        start_date: appliedFilters.start_date || undefined,
        end_date: appliedFilters.end_date || undefined,
      };
      const blob = await exportAdminBookings(exportParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookings-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to export bookings");
    } finally {
      setExporting(false);
    }
  };

  const handlePrintView = async () => {
    try {
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (appliedFilters.status !== 'all') params.append('status', appliedFilters.status);
      if (appliedFilters.gender !== 'all') params.append('gender', appliedFilters.gender);
      if (appliedFilters.event) params.append('event_name', appliedFilters.event);
      if (appliedFilters.start_date) params.append('start_date', appliedFilters.start_date);
      if (appliedFilters.end_date) params.append('end_date', appliedFilters.end_date);
      params.append('format', 'print');
      
      const response = await api.get(`/admin/bookings/export?${params.toString()}`);
      
      // Open print view in new window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(response.data.html);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success('Print view opened successfully');
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Authorization failed. Please login again.');
      } else {
        toast.error('Failed to open print view. Please try again.');
      }
      console.error('Print view error:', error);
    }
  };

  const applyFilters = () => {
    const formatted = {
      status: statusFilter,
      gender: genderFilter,
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
    setGenderFilter("all");
    setEventFilter("");
    setDateRange(undefined);
    const resetFilters = { status: "all", gender: "all", event: "", start_date: "", end_date: "" };
    setAppliedFilters(resetFilters);
    loadBookings(1, resetFilters, search);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loadBookings(1, appliedFilters, search);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(bookings.map((booking) => booking.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (bookingId: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, bookingId] : prev.filter((id) => id !== bookingId)));
  };

  const selectedCount = selectedIds.length;
  const allSelected = bookings.length > 0 && selectedCount === bookings.length;

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
    <EditorLayout title="Bookings">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Event Bookings</CardTitle>
              <p className="text-sm text-muted-foreground">Review, filter, export, and manage attendee requests.</p>
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
                  <Trash2 className="h-4 w-4" /> Delete Selected ({selectedCount})
                </Button>
              )}
              <Button variant="outline" onClick={() => loadBookings(currentPage)} disabled={loading}>
                Refresh
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintView} className="flex items-center gap-1">
                <Printer className="h-3 w-3" />
                Print
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
                      <p className="text-sm font-medium">Gender</p>
                      <Select value={genderFilter} onValueChange={setGenderFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All genders" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All genders</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-3">
                      <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))} />
                    </th>
                    <th className="py-3">ID</th>
                    <th className="py-3">Name</th>
                    <th className="py-3">Email</th>
                    {/* <th className="py-3">Phone</th> */}
                    <th className="py-3">Status</th>
                    <th className="py-3">Tier</th>
                    <th className="py-3">Event</th>
                    {/* <th className="py-3">CNIC</th> */}
                    <th className="py-3">Created</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-b-0">
                      <td className="py-3">
                        <Checkbox
                          checked={selectedIds.includes(booking.id)}
                          onCheckedChange={(checked) => toggleSelect(booking.id, Boolean(checked))}
                        />
                      </td>
                      <td className="py-3 font-medium">{booking.id}</td>
                      <td className="py-3">
                        <div className="font-medium">{booking.name}</div>
                        {booking.is_couple_booking && (booking.couple_booking?.name || booking.couple_name) && (
                          <p className="text-xs text-muted-foreground">
                            Partner: {booking.couple_booking?.name || booking.couple_name}
                          </p>
                        )}
                      </td>
                      <td className="py-3">{booking.email}</td>
                      {/* <td className="py-3">{booking.phone}</td> */}
                      <td className="py-3">
                        <Select
                          onValueChange={(value) => handleStatusChange(booking.id, value)}
                          defaultValue={booking.user_status}
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
                        {booking.invitees && booking.invitees.length > 0 ? (
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            {booking.invitees.map((invitee) => {
                              const genderLabel = formatGenderLabel(invitee.gender);
                              return (
                                <div key={invitee.id ?? invitee.email ?? invitee.name} className="flex flex-wrap gap-1">
                                  <span className="font-medium text-foreground">
                                    {invitee.name || invitee.email || "Guest"}
                                  </span>
                                  {genderLabel ? <span className="capitalize">({genderLabel})</span> : null}
                                  <span>- {formatInviteStatus(invitee.status)}</span>
                                </div>
                              );
                            })}
                            {booking.invite_stats && booking.invite_stats.total > 0 ? (
                              <p className="text-xs text-muted-foreground mt-2">
                                Invites: {booking.invite_stats.accepted}/{booking.invite_stats.total} accepted
                              </p>
                            ) : null}
                          </div>
                        ) : booking.invite_stats && booking.invite_stats.total > 0 ? (
                          <p className="text-xs text-muted-foreground mt-2">
                            Invites: {booking.invite_stats.accepted}/{booking.invite_stats.total} accepted
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3">
                        {booking.is_group_booking
                          ? booking.tier_name || (booking.tier_id ? `Tier #${booking.tier_id}` : "-")
                          : "-"}
                      </td>
                      <td className="py-3">{booking.event_name || "-"}</td>
                      {/* <td className="py-3">
                        <div>{booking.nic || booking.qr_id || "-"}</div>
                        {booking.is_couple_booking && booking.couple_booking?.nic && (
                          <p className="text-xs text-muted-foreground">Partner: {booking.couple_booking.nic}</p>
                        )}
                      </td> */}
                      <td className="py-3 text-muted-foreground">
                        {booking.created_at ? new Date(booking.created_at).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewBooking(booking.id)}>
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={deletingId === booking.id}
                          >
                            {deletingId === booking.id ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {paginationInfo.total
                    ? `Showing ${firstItemIndex}-${lastItemIndex} of ${paginationInfo.total} bookings`
                    : "No matching bookings"}
                </p>
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1) {
                            loadBookings(currentPage - 1);
                          }
                        }}
                      />
                    </PaginationItem>
                    {pageNumbers.map((page, index) => {
                      const prevPage = pageNumbers[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <Fragment key={page}>
                          {showEllipsis && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(event) => {
                                event.preventDefault();
                                if (page !== currentPage) {
                                  loadBookings(page);
                                }
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </Fragment>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage < totalPages) {
                            loadBookings(currentPage + 1);
                          }
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </EditorLayout>
  );
}
