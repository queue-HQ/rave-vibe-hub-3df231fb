import { useEffect, useMemo, useRef, useState } from "react";

import logo from "@/assets/logo.png";
import AppSidebar from "@/components/sidebar/AppSidebar";

import { Download, Printer, Share2, Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBookings } from "@/api/user";
import { useUserProfile } from "@/context/UserProfileContext";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TicketView = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const { user, isLoading } = useUserProfile();
  const { id } = useParams();
  const ticketRef = useRef<HTMLDivElement | null>(null);

  const data = bookings.find((item) => String(item.booking_id) === String(id));

  const ticketNumber = useMemo(() => {
    if (data?.pass_id) return String(data.pass_id);
    if (data?.qr_id) return String(data.qr_id);
    const fallback = data?.booking_id ?? id;
    return fallback ? String(fallback).padStart(8, "0") : "";
  }, [data, id]);

  const qrValue = useMemo(() => {
    if (!ticketNumber) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/ticket-scan/${ticketNumber}`;
  }, [ticketNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!ticketRef.current) return;
    const ticketElement = ticketRef.current;
    const canvas = await html2canvas(ticketElement, {
      scale: Math.min(3, window.devicePixelRatio || 2),
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: -window.scrollY,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = 20;
    const y = Math.max(20, (pageHeight - imgHeight) / 2);

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`ticket-${ticketNumber || "download"}.pdf`);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const data = await getBookings();
        setBookings(data?.data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  console.log("DATA", data);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navbar */}
      <div className="lg:hidden w-full p-4 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
        <img src={logo} className="h-12" alt="Logo" />

        <span
          className="cursor-pointer"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Logs />
        </span>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <AppSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
        </>
      )}
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 p-4 sm:p-6">
        {loadingBookings ? (
          <div className="min-h-screen p-6 flex justify-center items-center">
            <div className="w-full max-w-3xl space-y-6">
              {/* Ticket Header Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>

              {/* Ticket Card Skeleton */}
              <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-52 w-full" />
              </Card>

              {/* Buttons Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>

              <Skeleton className="h-12 w-full" />

              {/* Info Section Skeleton */}
              <Card className="p-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full mt-3" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Your Ticket</h1>
              <p className="text-muted-foreground">
                Save this ticket to your phone or print it out
              </p>
            </div>

            {/* Ticket Card */}
            <Card
              ref={ticketRef}
              className="overflow-hidden mb-6 gradient-card neon-border bg-gradient-to-br from-primary/20 via-card to-card shadow-[0_0_50px_hsl(330_81%_60%_/_0.2)] print:shadow-none print:border print:border-border"
            >
              <CardContent className="p-0">
                {/* Ticket Header */}
                <div className="bg-primary/10 p-6 border-b border-primary/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {/* <Badge className="mb-2">VIP Access</Badge> */}
                      <h2 className="text-2xl font-bold">
                        {data?.event_title || "Event Name"}
                      </h2>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      #{data?.qr_id || "TICKET-ID"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Date & Time</p>
                      <p className="font-semibold">Dec 18, 2024 • 10:00 PM</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-semibold">Brooklyn Warehouse, NY</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        Ticket Holder
                      </p>
                      <p className="font-semibold">Alex Rivera</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Ticket Type</p>
                      <p className="font-semibold">General Admission</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="p-8 text-center ">
                  <div className="inline-block p-0 rounded-lg border border-muted">
                    {qrValue ? (
                      //   <QRCodeCanvas
                      //     value={qrValue}
                      //     size={192}
                      //     includeMargin
                      //     level="H"
                      //     bgColor="#ffffff"
                      //     fgColor="#000000"
                      //     style={{
                      //       width: "192px",
                      //       height: "192px",
                      //       padding: "12px",
                      //       backgroundColor: "#fff",
                      //     }}
                      //   />

                      <QRCodeCanvas
                        value={qrValue}
                        size={160}
                        level="H"
                        // bgColor="#000" // background
                        fgColor="#ec4899" // pink color
                        includeMargin={true}
                        style={{
                          borderRadius: "16px",
                          padding: "1px",
                          //   backgroundColor: "#fff",
                        }}
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-muted-foreground">
                        QR unavailable
                      </div>
                    )}
                  </div>
                  <p className="text-white font-semibold mt-4">
                    Scan to verify ticket
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This QR opens a secure page with attendee details for staff
                    verification.
                  </p>
                </div>

                {/* Ticket Footer */}
                {/* <div className="bg-muted/30 p-6 border-t border-border">
                  <h3 className="font-bold mb-3">Transaction Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Purchase Date</p>
                      <p className="font-semibold">Dec 10, 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-semibold">Visa •••• 4242</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-semibold text-primary">$45.00</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order ID</p>
                      <p className="font-semibold">#ORD-98765</p>
                    </div>
                  </div>
                </div> */}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:hidden">
              <Button
                variant="outline"
                className="h-12"
                onClick={handleDownloadPdf}
              >
                <Download className="mr-2 h-5 w-5" />
                Download
              </Button>
              <Button variant="outline" className="h-12" onClick={handlePrint}>
                <Printer className="mr-2 h-5 w-5" />
                Print
              </Button>
            </div>

            {/* <Button variant="default" className="w-full h-12 print:hidden">
              <Share2 className="mr-2 h-5 w-5" />
              Share Ticket
            </Button> */}

            {/* Important Info */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3 text-primary">
                  Important Information
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Please arrive 30 minutes before the event starts</li>
                  <li>• Valid photo ID required for entry</li>
                  <li>• This ticket is non-transferable and non-refundable</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketView;
