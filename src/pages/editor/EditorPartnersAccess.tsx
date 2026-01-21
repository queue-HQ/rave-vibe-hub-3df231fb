import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminEvents, getAdminPartners } from "@/api/admin";

interface AdminEvent {
  id: number;
  title: string;
  status?: string;
  event_date?: string;
  partner_id?: number;
}

interface PartnerUser {
  id: number;
  display_name?: string;
  username?: string;
  email?: string;
}

export default function EditorPartnersAccess() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [partners, setPartners] = useState<PartnerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerFilter, setPartnerFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [eventsRes, partnersRes] = await Promise.all([
          getAdminEvents({ page: 1, per_page: 50 }),
          getAdminPartners({ page: 1, per_page: 100 }),
        ]);

        if (!mounted) return;

        if (eventsRes?.success) {
          setEvents(eventsRes.data || []);
        } else {
          toast.error(eventsRes?.message || "Failed to load events");
        }

        if (partnersRes?.success) {
          setPartners(partnersRes.data || []);
        } else {
          toast.error(partnersRes?.message || "Failed to load partners");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const partnerMap = useMemo(() => {
    const map = new Map<number, string>();
    partners.forEach((p) => {
      map.set(p.id, p.display_name || p.username || p.email || String(p.id));
    });
    return map;
  }, [partners]);

  const filtered = useMemo(() => {
    const pid = partnerFilter === "all" ? null : Number(partnerFilter);
    if (!pid) return events;
    return events.filter((e) => Number(e.partner_id) === pid);
  }, [events, partnerFilter]);

  return (
    <EditorLayout title="Partners Access">
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Partner Collaboration Mapping</CardTitle>
            <p className="text-sm text-muted-foreground">See which events are linked to which partner.</p>
          </div>

          <div className="max-w-sm">
            <Select value={partnerFilter} onValueChange={setPartnerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All partners</SelectItem>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.display_name || p.username || p.email || `Partner #${p.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No events found for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b">
                    <th className="py-3">Event</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Event Date</th>
                    <th className="py-3">Partner</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <tr key={event.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{event.title}</td>
                      <td className="py-3 capitalize">{event.status || "-"}</td>
                      <td className="py-3">{event.event_date || "-"}</td>
                      <td className="py-3">
                        {event.partner_id ? partnerMap.get(Number(event.partner_id)) || `Partner #${event.partner_id}` : "-"}
                      </td>
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
