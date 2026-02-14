import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAdminPartners, type PartnerQueryParams } from "@/api/admin";

interface PartnerUser {
  id: number;
  display_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
  registered_at?: string;
  profile_picture?: string;
}

const PER_PAGE = 10;

export default function EditorPartners() {
  const [partners, setPartners] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ search: string }>({ search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, total_pages: 1, per_page: PER_PAGE });

  const fetchPartners = useCallback(
    async (page: number, applied: { search: string }) => {
      try {
        setLoading(true);
        const params: PartnerQueryParams = {
          page,
          per_page: PER_PAGE,
          search: applied.search || undefined,
        };
        const res = await getAdminPartners(params);
        if (res?.success) {
          setPartners(res.data || []);
          const pagination = res.pagination || {};
          setPaginationInfo({
            total: pagination.total ?? res.data?.length ?? 0,
            total_pages: Math.max(1, pagination.total_pages ?? 1),
            per_page: pagination.per_page ?? PER_PAGE,
          });
        } else {
          toast.error(res?.message || "Failed to load partners");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load partners");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPartners(currentPage, filters);
  }, [currentPage, filters, fetchPartners]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search });
    setCurrentPage(1);
  };

  const totalPages = paginationInfo.total_pages || 1;
  const firstItemIndex = partners.length === 0 ? 0 : (currentPage - 1) * paginationInfo.per_page + 1;
  const lastItemIndex = partners.length === 0 ? 0 : firstItemIndex + partners.length - 1;

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

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <EditorLayout title="Partner Lists">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Partners</CardTitle>
              <CardDescription>Manage partner accounts and their access.</CardDescription>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={() => fetchPartners(currentPage, filters)} disabled={loading}>
                Refresh
              </Button>
              <Link to="/editor/partners/new">
                <Button>Add Partner</Button>
              </Link>
            </div>
          </div>

          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Search by name or email"
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
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : partners.length === 0 ? (
            <p className="text-muted-foreground">No partners found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-3">Name</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{partner.display_name || partner.username || "-"}</td>
                      <td className="py-3">{partner.email || "-"}</td>
                      <td className="py-3">{partner.phone || "-"}</td>
                      <td className="py-3 capitalize">{partner.status || "approved"}</td>
                      <td className="py-3 text-muted-foreground">{formatDateTime(partner.registered_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {paginationInfo.total
                    ? `Showing ${firstItemIndex}-${lastItemIndex} of ${paginationInfo.total} partners`
                    : "No matching partners"}
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
