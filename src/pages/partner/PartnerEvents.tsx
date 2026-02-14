import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getPartnerEvents } from "@/api/partner";

interface PartnerEvent {
  id: number;
  title: string;
  slug?: string;
  permalink?: string;
  status?: string;
  event_date?: string;
  time?: string;
  event_venue?: string;
  event_price?: string;
}

const PER_PAGE = 10;

export default function PartnerEvents() {
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, total_pages: 1, per_page: PER_PAGE });

  const loadEvents = async (page = currentPage, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await getPartnerEvents({ page, per_page: PER_PAGE, search: searchQuery || undefined });
      if (res?.success) {
        setEvents(res.data || []);
        const pagination = res.pagination || {};
        setPaginationInfo({
          total: pagination.total ?? (res.data?.length ?? 0),
          total_pages: Math.max(1, pagination.total_pages ?? 1),
          per_page: pagination.per_page ?? PER_PAGE,
        });
        setCurrentPage(page);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents(1, search);
  };

  const totalPages = paginationInfo.total_pages || 1;

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
    <EditorLayout title="Partner Events">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Events</CardTitle>
              <p className="text-sm text-muted-foreground">Your collaborated events.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => loadEvents(currentPage)} disabled={loading}>
                Refresh
              </Button>
              <Link to="/partner">
                <Button variant="outline">Back</Button>
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
                        <td className="py-3 font-medium">{event.title}</td>
                        <td className="py-3 capitalize">{event.status || "-"}</td>
                        <td className="py-3">{event.event_date || "-"}</td>
                        <td className="py-3">{event.time || "-"}</td>
                        <td className="py-3">{event.event_venue || "-"}</td>
                        <td className="py-3">{event.event_price || "-"}</td>
                        <td className="py-3 text-right">
                          <Link to={`/event/${event.slug || event.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * paginationInfo.per_page + 1}-{(currentPage - 1) * paginationInfo.per_page + events.length} of {paginationInfo.total} events
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
