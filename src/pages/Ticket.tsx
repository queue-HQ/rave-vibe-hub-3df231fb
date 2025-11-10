import { Download, Wallet, Printer, Share2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Ticket = () => {
  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Ticket</h1>
          <p className="text-muted-foreground">
            Save this ticket to your phone or print it out
          </p>
        </div>

        {/* Ticket Card */}
        <Card className="overflow-hidden mb-6 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
          <CardContent className="p-0">
            {/* Ticket Header */}
            <div className="bg-primary/10 p-6 border-b border-primary/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className="mb-2">VIP Access</Badge>
                  <h2 className="text-2xl font-bold">Neon Nights: Techno Takeover</h2>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  #QHQ-2024-001
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
                  <p className="text-muted-foreground mb-1">Ticket Holder</p>
                  <p className="font-semibold">Alex Rivera</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Ticket Type</p>
                  <p className="font-semibold">General Admission</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-8 text-center bg-white">
              <div className="inline-block p-6 bg-white rounded-lg">
                <div className="w-48 h-48 bg-black flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-white" />
                </div>
              </div>
              <p className="text-black font-semibold mt-4">
                Scan this code at the entrance
              </p>
            </div>

            {/* Ticket Footer */}
            <div className="bg-muted/30 p-6 border-t border-border">
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
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button variant="outline" className="h-12">
            <Download className="mr-2 h-5 w-5" />
            Download
          </Button>
          <Button variant="outline" className="h-12">
            <Wallet className="mr-2 h-5 w-5" />
            Add to Wallet
          </Button>
          <Button variant="outline" className="h-12">
            <Printer className="mr-2 h-5 w-5" />
            Print
          </Button>
        </div>

        <Button variant="default" className="w-full h-12">
          <Share2 className="mr-2 h-5 w-5" />
          Share Ticket
        </Button>

        {/* Important Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 text-primary">Important Information</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Please arrive 30 minutes before the event starts</li>
              <li>• Valid photo ID required for entry</li>
              <li>• This ticket is non-transferable and non-refundable</li>
              <li>• Screenshots will NOT be accepted - use the digital ticket only</li>
              <li>• Dress code: Rave attire encouraged, comfortable shoes recommended</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ticket;
