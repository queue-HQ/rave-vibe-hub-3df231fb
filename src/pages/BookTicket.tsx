import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/context/EventsContext";
import { useUserProfile } from "@/context/UserProfileContext";
import { eventBooking } from "@/api/auth";

// ⬇⬇⬇ Add your upload function here
async function uploadScreenshot(file: File) {
  if (!file) return null;
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("https://admin.theqhq.com/wp-json/app/v1/upload", {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  return json.url;
}
// ⬆⬆⬆ Upload Function

const BookTicket = () => {
  const { user } = useUserProfile();
  const { id } = useParams(); // event ID from URL
  const { events, isLoading } = useEvents();
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("USER", user);

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    nic: user?.nic || "",
    carNumber: user?.car_number || "",
  });

  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || user?.display_name || user?.username || "";

  useEffect(() => {
    setFormData((prev) => ({ ...prev, phone: user?.phone || "" }));
  }, [user?.phone]);

  const event = events.find((item) => String(item.id) === String(id));

  console.log("EVENT", event);

  const capacityLimit = Number(event?.capacity_limit) || 0;
  const bookedTickets = Number(event?.booked_tickets) || 0;
  const availableTickets =
    typeof event?.available_tickets === "number"
      ? event.available_tickets
      : capacityLimit > 0
        ? Math.max(capacityLimit - bookedTickets, 0)
        : null;
  const isSoldOut =
    typeof availableTickets === "number" && availableTickets <= 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSoldOut) {
      toast({
        title: "Tickets unavailable",
        description: "This event is sold out.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentProof) {
      toast({
        title: "Payment proof required",
        description: "Please upload a screenshot.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Upload screenshot
      const proofUrl = await uploadScreenshot(paymentProof);

      const currentDate = new Date().toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
      });

      const finalData = {
        event_id: event?.id,
        date: currentDate,
        phone: formData.phone,
        nic: formData.nic,
        carNumber: formData.carNumber,
        payment_image: proofUrl,
      };

      // API request
      await eventBooking(finalData);

      console.log("Submitted Data:", finalData);

      toast({
        title: "Ticket Booked Successfully! 🎉",
        description: "Your ticket has been confirmed.",
      });

      navigate("/dashboard/tickets");
    } catch (error: any) {
      console.error("Booking Error:", error);

      const apiPayload = error?.response?.data;
      let responseMessage =
        apiPayload?.message ||
        apiPayload?.code ||
        error?.message ||
        "Something went wrong. Try again.";

      if (!apiPayload?.message && apiPayload && typeof apiPayload === "object") {
        responseMessage = JSON.stringify(apiPayload);
      }

      toast({
        title: "Booking failed!",
        description: responseMessage,
        variant: "destructive",
      });
    }
    finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft p-4 sm:p-6 lg:p-8">
  <div className="max-w-5xl mx-auto">

    {/* Back + Title */}
    <div className="mb-4 sm:mb-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-3 sm:mb-4 text-sm sm:text-base"
      >
        ← Back
      </Button>

      <h1 className="text-3xl sm:text-4xl font-bold">Book Your Ticket</h1>

      <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
        Complete your booking details below
      </p>
    </div>

    {/* GRID LAYOUT */}
    <div className="grid gap-6 lg:grid-cols-5">

      {/* LEFT CARD */}
      <Card className="lg:col-span-2 p-5 sm:p-6 rounded-2xl shadow-soft h-fit lg:sticky lg:top-6">
        <div className="space-y-6">

          {/* Image */}
          <img
            src={event?.feature_image || ""}
            alt="Event"
            className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-xl mb-4"
          />

          {/* Event Title */}
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{event?.title}</h2>

          {/* Event Details */}
          <div className="space-y-3 text-sm sm:text-base">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <div>
                <p className="font-semibold">{event?.date}</p>
                <p className="text-muted-foreground">Saturday</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <div>
                <p className="font-semibold">{event?.time}</p>
                <p className="text-muted-foreground">
                  {event?.event_duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-muted-foreground">{event?.venue}</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground text-sm sm:text-base">
                Ticket Price
              </span>
              <span className="text-xl sm:text-2xl font-bold text-primary">
                PKR {event?.price}
              </span>
            </div>

            {capacityLimit ? (
              <p className="text-sm text-muted-foreground">
                {Math.max(availableTickets ?? 0, 0)} seats left out of {capacityLimit}
              </p>) : null}
            {isSoldOut && (
              <p className="text-sm text-destructive font-semibold">
                This event is sold out.
              </p>
            )}
          </div>

        </div>
      </Card>

      {/* RIGHT FORM */}
      <Card className="lg:col-span-3 p-5 sm:p-6 md:p-8 rounded-2xl shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Personal Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} disabled />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email} disabled />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+92 300 0000000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>CNIC Number *</Label>
                <Input
                  placeholder="xxxx-xxxxxx-x"
                  value={formData.nic}
                  onChange={(e) => handleChange("nic", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Car Number Plate (Optional)</Label>
                <Input
                  placeholder="ABC123"
                  value={formData.carNumber}
                  onChange={(e) => handleChange("carNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          <div className="border-t pt-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Payment Information
            </h3>

            <p className="text-sm sm:text-base leading-relaxed">
              <strong>Bank Details:</strong><br />
              Account Title: Mehmood Ahmed<br />
              Bank: Meezan Bank<br />
              Account Number: 99330105878574<br />
              IBAN: PK91MEZN0099330105878574
            </p>

            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 sm:p-8 text-center group cursor-pointer mt-6">
              <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-primary group-hover:animate-pulse" />

              <p className="font-semibold mb-2 text-sm sm:text-base">Proof of Payment</p>

              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Upload a screenshot of your payment receipt
              </p>

              <input
                type="file"
                accept="image/*"
                id="paymentFile"
                className="hidden"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              />

              <Button
                type="button"
                onClick={() =>
                  document.getElementById("paymentFile")?.click()
                }
              >
                Choose File
              </Button>

              {paymentProof && (
                <p className="text-xs sm:text-sm mt-2 text-green-600">
                  Selected: {paymentProof.name}
                </p>
              )}
            </div>
          </div>

          {/* Important Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Important Information
            </h3>

           {Array.isArray(event?.important_information) && event.important_information.length > 0 ? (
                  <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                    {event.important_information.map((point: any, index: number) => (
                      <li key={point.id ?? index} className="flex items-start gap-2">
                        <span className="font-bold text-primary">•</span>
                        <span>{point.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-base text-muted-foreground italic">
                    No important information available.
                  </p>
                )}

           
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 gradient-primary text-white font-semibold rounded-xl text-base sm:text-lg"
            disabled={submitting || isSoldOut}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              isSoldOut ? "Sold Out" : "Complete Booking"
            )}
          </Button>

        </form>
      </Card>
    </div>
  </div>
</div>

  );
};

export default BookTicket;
