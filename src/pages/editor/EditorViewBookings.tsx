import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { getAdminBookings, updateAdminBookingStatus } from "@/api/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CoupleBookingDetails {
  name?: string;
  email?: string;
  phone?: string;
  nic?: string;
  carNumber?: string;
  invited_by_email?: string;
  isGuestEntry?: boolean;
  qr_id?: string;
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
  event_name: string;
  name: string;
  email: string;
  phone: string;
  user_status: string;
  status: string;
  nic: string;
  carNumber: string;
  qr_id?: string;
  price?: string;
  venue?: string;
  image?: string;
  created_at?: string;
  is_couple_booking?: boolean;
  couple_name?: string;
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

export default function EditorViewBookings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const bookingId = Number(id);

  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [screenshotOpen, setScreenshotOpen] = useState(false);

  const loadBooking = async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await getAdminBookings({ limit: 200 });
      if (!res?.success) {
        toast.error(res?.message || "Failed to load bookings");
        return;
      }
      const found = (res.data as AdminBooking[] | undefined)?.find((item) => item.id === bookingId) || null;
      if (!found) {
        toast.error("Booking not found");
        navigate(-1);
        return;
      }
      setBooking(found);
    } catch (error: any) {
      toast.error(error?.message || error.response?.data?.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleStatusChange = async (status: string) => {
    if (!booking) return;
    try {
      setUpdating(true);
      const res = await updateAdminBookingStatus(booking.id, status);
      if (!res?.success) {
        toast.error(res?.message || "Failed to update status");
        return;
      }
      toast.success("Booking updated");
      setBooking((prev) => (prev ? { ...prev, user_status: status } : prev));
    } catch (error: any) {
      toast.error(error?.message || error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const detailRows = useMemo(() => {
    if (!booking) return [];
    const invitees = booking.invitees ?? [];
    const inviteesContent = invitees.length ? (
      <div className="space-y-1 text-sm text-foreground">
        {invitees.map((invitee) => {
          const genderLabel = formatGenderLabel(invitee.gender);
          return (
            <div key={invitee.id ?? invitee.email ?? invitee.name} className="flex flex-wrap gap-1">
              <span className="font-medium">
                {invitee.name || invitee.email || "Guest"}
              </span>
              {genderLabel ? <span className="capitalize">({genderLabel})</span> : null}
              <span>- {formatInviteStatus(invitee.status)}</span>
            </div>
          );
        })}
      </div>
    ) : (
      "-"
    );
    return [
      { label: "Booking ID", value: `#${booking.id}` },
      { label: "QR ID", value: booking.qr_id || "-" },
      //   { label: "Event ID", value: booking.event_id || "-" },
      { label: "Event Name", value: booking.event_name || "-" },
      booking.tier_name || booking.is_group_booking
        ? { label: "Tier", value: booking.tier_name || (booking.tier_id ? `Tier #${booking.tier_id}` : "-") }
        : null,
      { label: "Name", value: booking.name || "-" },
      { label: "Email", value: booking.email || "-" },
      { label: "Phone", value: booking.phone || "-" },
      { label: "Status", value: booking.user_status || "-" },
      { label: "User Status", value: booking.status || "-" },
      booking.invite_stats
        ? { label: "Invite Progress", value: `${booking.invite_stats.accepted}/${booking.invite_stats.total} accepted` }
        : null,
      invitees.length ? { label: "Invitees", value: inviteesContent } : null,
      { label: "CNIC", value: booking.nic || "-" },
      { label: "Car Number", value: booking.carNumber || "-" },
      { label: "Price", value: booking.price ? `PKR ${booking.price}` : "-" },
      { label: "Venue", value: booking.venue || "-" },
      {
        label: "Payment Screenshot",
        value: booking.image ? (
          <Button variant="default" size="sm" className="mt-3" onClick={() => setScreenshotOpen(true)}>
            View
          </Button>
        ) : (
          "-"
        ),
      },
      {
        label: "Created",
        value: booking.created_at
          ? new Date(booking.created_at).toLocaleString()
          : "-",
      },
    ].filter(Boolean) as { label: string; value: any }[];
  }, [booking]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (!booking) {
      return <p className="text-muted-foreground">Booking details are unavailable.</p>;
    }

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Booking Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Detailed information for attendee request.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge className="capitalize bg-primary/10 text-primary">
                {booking.user_status || "Unknown"}
              </Badge>
              <Badge variant="outline">Event #{booking.event_id || "-"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {detailRows.map((row) => (
                <div key={row.label} className="rounded-lg border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                  {typeof row.value === "string" || typeof row.value === "number" ? (
                    <p className="text-base font-medium text-foreground">{row.value}</p>
                  ) : (
                    <div className="text-sm text-foreground">{row.value}</div>
                  )}
                </div>
              ))}
            </div>

            {booking.is_couple_booking && booking.couple_booking && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold">Couple Booking Details</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">{booking.couple_booking.name || booking.couple_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{booking.couple_booking.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{booking.couple_booking.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">CNIC</p>
                    <p className="text-sm font-medium">{booking.couple_booking.nic || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Car Number</p>
                    <p className="text-sm font-medium">{booking.couple_booking.carNumber === "0" ? "-" : booking.couple_booking.carNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Invited By</p>
                    <p className="text-sm font-medium">{booking.couple_booking.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Entry</p>
                    <p className="text-sm font-medium">{booking.couple_booking && "Couple Entry"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Pair Code</p>
                    <p className="text-sm font-medium">{booking.couple_booking.qr_id || "-"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Update Status</p>
              <Select
                defaultValue={booking.user_status}
                onValueChange={handleStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Choose new status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Payment Screenshot</DialogTitle>
            </DialogHeader>
            {booking?.image ? (
              <div className="max-h-[70vh] overflow-auto">
                <img src={booking.image} alt="Payment Screenshot" className="w-full rounded-lg" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No screenshot available.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <EditorLayout title="Booking Details">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Button variant="ghost" onClick={loadBooking} disabled={loading}>
          Refresh
        </Button>
      </div>
      {renderContent()}
    </EditorLayout>
  );
}
