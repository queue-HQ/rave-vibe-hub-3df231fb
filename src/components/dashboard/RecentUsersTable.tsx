import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export interface RecentUserRow {
  id: number | string;
  name: string;
  email: string;
  date?: string;
  initials?: string;
}

interface RecentUsersTableProps {
  users: RecentUserRow[];
  loading?: boolean;
  onViewAll?: () => void;
}

const DISPLAY_LIMIT = 3;

const buildInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "");
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

export function RecentUsersTable({
  users,
  loading = false,
  onViewAll,
}: RecentUsersTableProps) {
  const visibleUsers = users.slice(0, DISPLAY_LIMIT);

  return (
    <div
      className="bg-card rounded-lg shadow-card animate-fade-in"
      style={{ animationDelay: "400ms" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recent Users
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Users registered in the last 24 hours
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
                User Name
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Email
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Date
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
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Empty State */}
            {!loading && visibleUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  No recent users found.
                </TableCell>
              </TableRow>
            )}

            {/* Data Rows */}
            {!loading &&
              visibleUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/50 border-border"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {user.initials || buildInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground truncate max-w-[180px]">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {user.email}
                  </TableCell>

                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(user.date)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
