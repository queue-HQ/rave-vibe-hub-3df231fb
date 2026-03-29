import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Calendar, FileText, FileSpreadsheet, Printer } from "lucide-react";
import EditorLayout from "@/components/layouts/EditorLayout";
import { getAdminUsers, updateAdminUser } from "@/api/admin";
import api from "@/lib/axios";
import { apiUrl } from "@/lib/apiURL";
import { toast } from "sonner";


interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  email: string;
  event_type?: string;
  role: string;
  status: string;
  registered_at: string;
}

interface UserFilters {
  search: string;
  status: string;
  gender: string;
  event_type: string;
  date_from: string;
  date_to: string;
}

const statusOptions = ["pending", "approved", "rejected"] as const;
const PER_PAGE = 10;

export default function EditorUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({ search: "", status: "all", gender: "all", event_type: "all", date_from: "", date_to: "" });
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, total_pages: 1, per_page: PER_PAGE });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const loadEventTypes = async () => {
      try {
        const res = await fetch(`${apiUrl}/events`);
        const json = await res.json();
        if (!mounted) return;
        const items = Array.isArray(json?.data) ? json.data : [];
        const titles = items
          .map((e: any) => String(e?.title ?? "").trim())
          .filter(Boolean);
        setEventTypeOptions(Array.from(new Set(titles)));
      } catch {
        // ignore
      }
    };
    loadEventTypes();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchUsers = useCallback(
    async (page: number, appliedFilters: UserFilters) => {
      try {
        setLoading(true);
        const effectiveStatus = appliedFilters.status === "all" ? undefined : appliedFilters.status;
        const res = await getAdminUsers({
          page,
          per_page: PER_PAGE,
          search: appliedFilters.search || undefined,
          status: effectiveStatus,
          gender: appliedFilters.gender !== "all" ? appliedFilters.gender : undefined,
          event_type: appliedFilters.event_type !== "all" ? appliedFilters.event_type : undefined,
        });

        if (res?.success) {
          setUsers(res.data || []);
          const pagination = res.pagination || {};
          setPaginationInfo({
            total: pagination.total ?? res.data?.length ?? 0,
            total_pages: Math.max(1, pagination.total_pages ?? 1),
            per_page: pagination.per_page ?? PER_PAGE,
          });
        } else {
          toast.error(res?.message || "Failed to load users");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchUsers(currentPage, filters);
  }, [currentPage, filters, fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search, status: statusFilter, gender: genderFilter, event_type: eventTypeFilter, date_from: dateFromFilter, date_to: dateToFilter });
    setCurrentPage(1);
  };

  const handleDownloadCSV = async () => {
    await downloadFile('csv');
  };

  const handleDownloadTXT = async () => {
    await downloadFile('txt');
  };

  const handleDownloadDOCX = async () => {
    await downloadFile('docx');
  };

  const handlePrintView = async () => {
    await downloadFile('print');
  };

  const downloadFile = async (format: string) => {
    try {
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      if (eventTypeFilter !== 'all') params.append('event_type', eventTypeFilter);
      if (dateFromFilter) params.append('date_from', dateFromFilter);
      if (dateToFilter) params.append('date_to', dateToFilter);
      params.append('format', format);
      
      const response = await api.get(`/admin/users/download?${params.toString()}`, {
        responseType: format === 'print' ? 'json' : 'blob',
      });
      
      if (format === 'print') {
        // Open print view in new window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(response.data.html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        // Create download link for file formats
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with timestamp and format
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const extensions = {
          csv: 'csv',
          txt: 'txt',
          docx: 'docx'
        };
        const filename = `users_export_${timestamp}.${extensions[format] || 'csv'}`;
        
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(`${format.toUpperCase()} downloaded successfully`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Authorization failed. Please login again.');
      } else {
        toast.error(`Failed to download ${format.toUpperCase()}. Please try again.`);
      }
      console.error('Download error:', error);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      setStatusUpdating(userId);
      const res = await updateAdminUser(userId, { account_status: newStatus });
      if (res?.success) {
        toast.success("Status updated");
        fetchUsers(currentPage, filters);
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const totalPages = paginationInfo.total_pages || 1;
  const firstItemIndex = users.length === 0 ? 0 : (currentPage - 1) * paginationInfo.per_page + 1;
  const lastItemIndex = users.length === 0 ? 0 : firstItemIndex + users.length - 1;

  const pageNumbers = useMemo(() => {
    const set = new Set<number>();
    set.add(1);
    set.add(totalPages);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        set.add(i);
      }
    }
    const sorted = Array.from(set).sort((a, b) => a - b);
    return sorted;
  }, [currentPage, totalPages]);

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <EditorLayout title="Users">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search, filter, review and edit user accounts.</CardDescription>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={() => fetchUsers(currentPage, filters)} disabled={loading}>
                Refresh
              </Button>
              
              {/* Download Dropdown */}
              {/* <Select>
                <SelectTrigger className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv" onClick={handleDownloadCSV}>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV (Excel)
                    </div>
                  </SelectItem>
                  <SelectItem value="txt" onClick={handleDownloadTXT}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      TXT (Notepad)
                    </div>
                  </SelectItem>
                  <SelectItem value="docx" onClick={handleDownloadDOCX}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      DOCX (Word)
                    </div>
                  </SelectItem>
                  <SelectItem value="print" onClick={handlePrintView}>
                    <div className="flex items-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print View
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select> */}

              {/* Individual Download Buttons */}
              {/* <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="flex items-center gap-1">
                <FileSpreadsheet className="h-3 w-3" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTXT} className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                TXT
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadDOCX} className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                DOCX
              </Button> */}
              <Button variant="outline" size="sm" onClick={handlePrintView} className="flex items-center gap-1">
                <Printer className="h-3 w-3" />
                Print
              </Button>
              
              <Link to="/editor/users/new">
                <Button>Add User</Button>
              </Link>
            </div>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-7 gap-3" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Search by name, username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={(value) => setGenderFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select value={eventTypeFilter} onValueChange={(value) => setEventTypeFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All event types</SelectItem>
                <SelectItem value="future">All Future Events</SelectItem>
                {/* <SelectItem value="bhuttnco">BHUTTNCO 5.0 NYE Edition</SelectItem> */}
                {eventTypeOptions
                  .filter((t) => {
                    const normalized = t.toLowerCase();
                    return normalized !== "all" && normalized !== "future" && normalized !== "bhuttnco";
                  })
                  .map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date (YYYY-MM-DD)"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />
            <Input
              type="date"
              placeholder="To Date (YYYY-MM-DD)"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />
            <Button type="submit">Apply Filters</Button>
          </form>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-3">Name</th>
                    <th className="py-3">Username</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Event Type</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Registered</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{user.display_name || "-"}</td>
                      <td className="py-3">{user.username}</td>
                      <td className="py-3">{user.email}</td>
                      <td className="py-3">{user.event_type || "BNC"}</td>
                      <td className="py-3 capitalize">{user.role}</td>
                      <td className="py-3">
                        <Select
                          value={user.status}
                          onValueChange={(value) => handleStatusChange(user.id, value)}
                          disabled={statusUpdating === user.id}
                        >
                          <SelectTrigger className="w-40 capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status} className="capitalize">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDateTime(user.registered_at)}</td>
                      <td className="py-3 text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/editor/users/${user.id}`)}>
                                View details
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View & edit profile details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {paginationInfo.total
                    ? `Showing ${firstItemIndex}-${lastItemIndex} of ${paginationInfo.total} users`
                    : "No matching users"}
                </p>
                <Pagination className="justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage((prev) => Math.max(1, prev - 1));
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
                                  setCurrentPage(page);
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
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1));
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
