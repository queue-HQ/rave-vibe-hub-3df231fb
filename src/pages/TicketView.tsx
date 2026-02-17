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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./TicketView.module.css";

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


   const contentRef = useRef<HTMLDivElement | null>(null);

  const downloadDivAsPDF = async () => {
    const element = contentRef.current;

    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true, // Allow external images
      backgroundColor: "#0D0D0D",
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const pxPerMm = canvas.width / pageWidth;
    const pageHeightPx = Math.floor(pageHeight * pxPerMm);

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) return;

    tempCanvas.width = canvas.width;

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
      tempCanvas.height = sliceHeight;

      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      

      const sliceImgData = tempCanvas.toDataURL("image/png");
      const sliceHeightMm = (sliceHeight * pageWidth) / canvas.width;

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceImgData, "PNG", 0, 0, pageWidth, sliceHeightMm);

      renderedHeight += sliceHeight;
      pageIndex += 1;
    }

    const safeTicket = ticketNumber || "ticket";
    pdf.save(`ticket-${safeTicket}.pdf`);
  };

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
        

        {/* Ticket Card */}
      
      <div style={{ padding: 0 }}>
      <div
        id="content"
        ref={contentRef}
        style={{
          width: "210mm",
          padding: "20px",
          // border: "1px solid #ccc",
          fontFamily: "Arial",
          backgroundColor: "#0D0D0D",
        }}
      >


<div className="text-center ">
  <img src="/logo.png" alt="Logo" className="w-32 h-auto mx-auto" />
</div>
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1">
            Your Ticket 
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Save this ticket or print it out
          </p>
        </div>

        <div className={styles.printMainDiv}>

          <div className={styles.pdfContentArea}>
              <div className={styles.headingDiv}>
                <h3 className={styles.headingDivh3}>{data?.event_title || "Event Name"}</h3>
                <h5 className={styles.headingDivh5}>#{data?.qr_id}</h5>
              </div>

              <br />

               <div className={styles.headingContent}>
                <div className={styles.pdfContentAreaDiv}>
                  <span>Date & Time:</span>
                  <span className={styles.spanContetn}>{data?.event_date} • {data?.event_time}</span>
                </div>
                <div className={styles.pdfContentAreaDiv}>
                  <span>Location:</span>
                  <span className={styles.spanContetn}>{data?.event_location}</span>
                </div>
                <div className={styles.pdfContentAreaDiv}>
                  <span>Ticket Holder:</span>
                  <span className={styles.spanContetn}>{data?.user_name}</span>
                </div>
              </div>

          </div>

        <div className={`text-center ${styles.pdfQRDiv}`}>
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
      {/* Action Buttons */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 print:hidden ${styles.actionButtons}`}>
          <Button
            variant="outline"
            className="h-12 text-sm sm:text-base"
            onClick={downloadDivAsPDF}
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

      <br />

    </div>
        
      </div>
    )}
  </main>
</div>

  );
};

export default TicketView;
