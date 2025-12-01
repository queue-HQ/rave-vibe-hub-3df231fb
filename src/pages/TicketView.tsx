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
// import html2pdf from "html2pdf.js";
// import domtoimage from "dom-to-image-more";
// import jsPDF from "jspdf";

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
  try {
    const response = await fetch(
      "https://us1.pdfgeneratorapi.com/api/v4/documents/generate",
      {
        method: "POST",
        headers: {
          "Authorization":
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI3YzBlZmVmODhmZDFkZTQ1ZmQ2OTQzZjAyZWE2NWU3Y2QwMWQ1ODhjOGViMzYyYjgxZGU2YmJhYjFkYWE3ZDkxIiwic3ViIjoibWRzaG9haWIxOTVAZ21haWwuY29tIiwiZXhwIjoxNzY0NTgwNTQyfQ.OvYPuaAAXIpurnjHe1C-STV0FqDcxwJ8fdBmSNSOYpI",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: {
            id: 1564426,
            data: {
              logoUrl: "https://admin.theqhq.com/wp-content/uploads/2025/11/logo.png",
              EventName: data.event_title,
              TicketHolder: data.holder_name || "N/A",
              TicketNumber: ticketNumber,
              DateTime: "Dec 18, 2024 • 10:00 PM",
              Location: "Brooklyn Warehouse, NY",
              qrID: data?.qr_id,
            }
          },
          format: "pdf",
          output: "base64",   // ⭐ IMPORTANT
          name: `ticket-${ticketNumber}`
        }),
      }
    );

    const result = await response.json();
    console.log(result);

    const base64 = result.response;
    if (!base64) {
      console.error("Base64 not returned");
      return;
    }

    downloadBase64Pdf(base64, `ticket-${ticketNumber}.pdf`);
  } catch (err) {
    console.error(err);
  }
};


const downloadBase64Pdf = (base64Data, fileName) => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
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
      <div className="lg:hidden w-full p-3 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
        <img src={logo} className="h-10 sm:h-12" alt="Logo" />

    <span
      className="cursor-pointer"
      onClick={() => setMobileSidebarOpen(true)}
    >
      <Logs className="h-6 w-6" />
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

  {/* Desktop Sidebar */}
  <AppSidebar />

  {/* Main Content */}
  <main className="ml-0 lg:ml-64 px-3 sm:px-6 py-4">
    {loadingBookings ? (
      <div className="min-h-screen p-4 flex justify-center items-center">
        <div className="w-full max-w-xl sm:max-w-2xl space-y-6">
          {/* Ticket Header Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>

          {/* Ticket Card Skeleton */}
          <Card className="p-4 sm:p-6 space-y-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-52 w-full" />
          </Card>

          {/* Buttons Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>

          <Skeleton className="h-12 w-full" />

          {/* Info Section Skeleton */}
          <Card className="p-4 sm:p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      </div>
    ) : (
      <div className="w-full max-w-xl sm:max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1">
            Your Ticket
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Save this ticket or print it out
          </p>
        </div>

        {/* Ticket Card */}
        <Card
          ref={ticketRef}
          className="overflow-hidden mb-6 gradient-card neon-border bg-gradient-to-br from-primary/20 via-card to-card shadow-[0_0_40px_hsl(330_81%_60%_/_0.2)] print:shadow-none print:border print:border-border"
        >
          <CardContent className="p-0">
            {/* Ticket Header */}
            <div className="bg-primary/10 p-4 sm:p-6 border-b border-primary/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {data?.event_title || "Event Name"}
                </h2>

             <Badge
  variant="secondary"
  className="
    hidden          /* mobile: hidden */
    sm:inline-flex   /* desktop: show */
    text-sm sm:text-lg 
    px-3 py-1 sm:px-4 sm:py-2
  "
>
  #{data?.qr_id || "TICKET-ID"}
</Badge>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="sm:hidden">
                      <p className="text-muted-foreground mb-1">Ticket No:</p>
                      <p className="font-semibold">#{data?.qr_id}</p>
                    </div>

                <div>
                  <p className="text-muted-foreground mb-1">Date & Time</p>
                  <p className="font-semibold">Dec 18, 2024 • 10:00 PM</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold">Brooklyn Warehouse, NY</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Ticket Holder</p>
                  <p className="font-semibold">Alex Rivera</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Ticket Type</p>
                  <p className="font-semibold">General Admission</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-6 sm:p-8 text-center">
              <div className="inline-block p-1 rounded-lg border border-muted">
                {qrValue ? (
                  <QRCodeCanvas
                    value={qrValue}
                    size={150}
                    level="H"
                    fgColor="#ec4899"
                    includeMargin={true}
                    style={{ borderRadius: "14px" }}
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-muted-foreground">
                    QR unavailable
                  </div>
                )}
              </div>

              <p className="text-white font-semibold mt-3 sm:mt-4">
                Scan to verify ticket
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This QR opens a secure page for staff verification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 print:hidden">
          <Button
            variant="outline"
            className="h-12 text-sm sm:text-base"
            onClick={handleDownloadPdf}
          >
            <Download className="mr-2 h-5 w-5" /> Download
          </Button>

          <Button
            variant="outline"
            className="h-12 text-sm sm:text-base"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-5 w-5" /> Print
          </Button>
        </div>

        {/* Important Info */}
        <Card className="mt-4">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-bold mb-2 sm:mb-3 text-primary">
              Important Information
            </h3>


          {Array.isArray(data?.important_information) && data.important_information.length > 0 ? (
                  <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                    {data.important_information.map((point: any, index: number) => (
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

          </CardContent>
        </Card>
      </div>
    )}
  </main>
</div>

  );
};

export default TicketView;
