import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, CalendarDays, MapPin, Mail, Phone, User, CreditCard, CheckCircle } from "lucide-react";
import { getQrDetails } from "@/api/user";
import logo from "@/assets/logo.png";

interface QrTicketResponse {
  status: boolean;
  data?: {
    booking_raw?: {
      id?: string;
      event_name?: string;
      username?: string;
      email?: string;
      booking_date?: string;
      phone?: string;
      price?: string;
      venue?: string;
      image?: string;
      qr_id?: string;
      user_status?: string;
      created_at?: string;
      status?: string;
    };
    name?: string;
    email?: string;
    phone?: string;
    qr_id?: string;
    event?: string;
    venue?: string;
    date?: string;
    price?: string;
  };
  message?: string;
}

const formatDate = (value?: string, opts?: Intl.DateTimeFormatOptions) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, opts ?? { dateStyle: "medium" });
};

const TicketScan = () => {
  const { passId } = useParams();
  const [ticket, setTicket] = useState<QrTicketResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!passId) return;
      setLoading(true);
      setError(null);

      try {
        const res: QrTicketResponse = await getQrDetails(passId);
        if (res?.status && res?.data) {
          setTicket(res.data);
        } else {
          setTicket(null);
          setError(res?.message || "Ticket not found");
        }
      } catch (err) {
        setTicket(null);
        setError("Unable to fetch ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [passId]);

  const booking = ticket?.booking_raw;
  const ticketNumber = booking?.qr_id || ticket?.qr_id || passId;
  const attendeeName = booking?.username || ticket?.name || "Guest";
  const attendeeEmail = booking?.email || ticket?.email || "Not available";
  const attendeePhone = booking?.phone || ticket?.phone || "N/A";
  const eventTitle = booking?.event_name || ticket?.event || "Event";
  const venue = booking?.venue || ticket?.venue || "Venue";
  const bookingDate = booking?.booking_date || ticket?.date;
  const createdAt = booking?.created_at;
  const price = booking?.price || ticket?.price;
  const status = booking?.user_status || booking?.status;
  const proofImage = booking?.image;

  return (
    <div className="min-h-screen bg-slate-950/95 text-white p-4 flex flex-col items-center justify-center">
      <img src={logo} alt="Rave Vibe Hub" className="h-16 mb-6" />

      {loading ? (
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Card>
            <CardContent className="p-6 space-y-4">
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card className="w-full max-w-xl text-center bg-red-950/30 border-red-500/30">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <CardTitle>Ticket Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild variant="outline">
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      ) : ticket ? (
        <Card className="w-full max-w-4xl bg-slate-900/80 border border-primary/20 text-white">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="uppercase tracking-widest text-xs text-primary/70">Qr Verification</p>
                <CardTitle className="text-3xl font-bold">{eventTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">Ticket scanned successfully</p>
              </div>
              {ticketNumber && (
                <Badge className="text-base px-4 py-1 bg-primary/20 text-primary border border-primary/40">
                  #{ticketNumber}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Attendee</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="p-2 rounded-full bg-primary/20 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{attendeeName}</p>
                        <p className="text-sm text-muted-foreground">{attendeeEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Contact</p>
                    <div className="space-y-2 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="break-all">{attendeeEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{attendeePhone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Event Details</p>
                    <div className="space-y-2 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span>{formatDate(bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{venue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Payment</p>
                    <div className="space-y-2 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span>Amount Paid: {price ? `PKR ${price}` : "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Status: {status || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* {proofImage && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Payment Proof</p>
                    <img
                      src={proofImage}
                      alt="Payment proof"
                      className="mt-3 rounded-lg border border-white/10 max-h-72 w-full object-cover"
                    />
                  </div>
                )} */}
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30">
                <p className="text-xs text-muted-foreground uppercase">Summary</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Booking ID</p>
                    <p className="text-lg font-semibold">#{booking?.id || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Created At</p>
                    <p className="font-medium">{formatDate(createdAt, { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">QR ID</p>
                    <p className="font-medium">{ticketNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge
                      className={`mt-1 px-3 py-1 ${
                        (status || "").toLowerCase() === "confirm"
                          ? "bg-emerald-500"
                          : (status || "").toLowerCase() === "cancel"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button asChild variant="outline">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default TicketScan;
