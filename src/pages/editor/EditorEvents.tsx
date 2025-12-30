import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EditorLayout from "@/components/layouts/EditorLayout";
import { getAdminEvents } from "@/api/admin";
import { toast } from "sonner";

interface AdminEvent {
  id: number;
  title: string;
  status: string;
  date?: string;
  time?: string;
  venue?: string;
  price?: string;
}

export default function EditorEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAdminEvents();
      if (res?.success) {
        setEvents(res.data || []);
      } else {
        toast.error(res?.message || "Failed to load events");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EditorLayout title="Events">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Manage Events</CardTitle>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchEvents} disabled={loading}>
              Refresh
            </Button>
            <Link to="/editor/events/new">
              <Button>Add Event</Button>
            </Link>
          </div>
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
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{event.title}</td>
                      <td className="py-3 capitalize">{event.status}</td>
                      <td className="py-3">{event.date || "-"}</td>
                      <td className="py-3">{event.time || "-"}</td>
                      <td className="py-3">{event.venue || "-"}</td>
                      <td className="py-3">{event.price || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </EditorLayout>
  );
}
