import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EditorLayout from "@/components/layouts/EditorLayout";
import { getAdminBookings, updateAdminBookingStatus } from "@/api/admin";
import { toast } from "sonner";

interface AdminBooking {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone: string;
  user_status: string;
  status: string;
  qr_id?: string;
  created_at?: string;
}

const statuses = ["Waiting Approval", "Pending", "Confirm", "Cancel", "Request Rejected"] as const;

export default function EditorBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getAdminBookings();
      if (res?.success) {
        setBookings(res.data || []);
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
    loadBookings();
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

  return (
    <EditorLayout title="Bookings">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Event Bookings</CardTitle>
            <p className="text-sm text-muted-foreground">Review and approve attendee requests.</p>
          </div>
          <Button variant="outline" onClick={loadBookings} disabled={loading}>
            Refresh
          </Button>
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
                    <th className="py-3">Name</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">QR</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{booking.name}</td>
                      <td className="py-3">{booking.email}</td>
                      <td className="py-3">{booking.phone}</td>
                      <td className="py-3 capitalize">{booking.user_status}</td>
                      <td className="py-3">{booking.qr_id || "-"}</td>
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
