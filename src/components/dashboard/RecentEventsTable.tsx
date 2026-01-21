import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RecentEventRow {
  id: number | string;
  name: string;
  date?: string;
  status?: string;
}

interface RecentEventsTableProps {
  events: RecentEventRow[];
  loading?: boolean;
  onViewAll?: () => void;
}

const DISPLAY_LIMIT = 3;

const statusStyles = {
  confirmed: "bg-success/10 text-success hover:bg-success/20 border-0",
  pending: "bg-warning/10 text-warning hover:bg-warning/20 border-0",
  cancelled: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-0",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

export function RecentEventsTable({
  events,
  loading = false,
  onViewAll,
}: RecentEventsTableProps) {
  const visibleEvents = events.slice(0, DISPLAY_LIMIT);

  return (
    <div
      className="bg-card rounded-lg shadow-card animate-fade-in"
      style={{ animationDelay: "500ms" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recent Events
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Latest events created
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
          onClick={onViewAll}
          disabled={!onViewAll}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground font-medium">
                Event Name
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Date
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading */}
            {loading &&
              Array.from({ length: DISPLAY_LIMIT }).map((_, index) => (
                <TableRow key={index} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty State */}
            {!loading && visibleEvents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  No recent events found.
                </TableCell>
              </TableRow>
            )}

            {/* Data Rows */}
            {!loading &&
              visibleEvents.map((event) => (
                <TableRow
                  key={event.id}
                  className="hover:bg-muted/50 border-border"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground truncate max-w-[220px]">
                        {event.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDate(event.date)}
                  </TableCell>

                  <TableCell className="text-right">
                    {event.status ? (
                      <Badge
                        className={cn(
                          "capitalize font-medium",
                          statusStyles[
                            (event.status.toLowerCase() as keyof typeof statusStyles) ??
                              "confirmed"
                          ] || "bg-muted"
                        )}
                      >
                        {event.status}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
