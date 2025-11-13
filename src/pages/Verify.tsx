import { useState } from "react";
import { Upload, CheckCircle, Clock, AlertCircle, Instagram, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Verify = () => {
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "under-review" | "verified">("pending");

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Account Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Indicator */}
            <div className="flex justify-center mb-8">
              {verificationStatus === "pending" && (
                <div className="text-center">
                  <AlertCircle className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                  <p className="text-xl font-semibold">Verification Pending</p>
                </div>
              )}
              {verificationStatus === "under-review" && (
                <div className="text-center">
                  <Clock className="h-20 w-20 text-blue-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-xl font-semibold">Under Review</p>
                </div>
              )}
              {verificationStatus === "verified" && (
                <div className="text-center">
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                  <p className="text-xl font-semibold">Verified!</p>
                </div>
              )}
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStatus !== "pending" ? "bg-primary" : "bg-muted"
                }`}>
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Submit Verification</p>
                  <p className="text-sm text-muted-foreground">Upload your ID or confirm email</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStatus === "verified" ? "bg-primary" : "bg-muted"
                }`}>
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Review Process</p>
                  <p className="text-sm text-muted-foreground">We verify your information</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  verificationStatus === "verified" ? "bg-primary" : "bg-muted"
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Account Verified</p>
                  <p className="text-sm text-muted-foreground">Full access granted</p>
                </div>
              </div>
            </div>

            <Progress value={
              verificationStatus === "pending" ? 33 :
              verificationStatus === "under-review" ? 66 : 100
            } className="w-full" />

            {/* Verification Options */}
            {verificationStatus === "pending" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary hover:shadow-[0_0_20px_hsl(var(--neon-pink)_/_0.3)] transition-all cursor-pointer group">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-primary group-hover:animate-pulse" />
                  <p className="font-semibold mb-2">Upload ID Document</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Accepted: Driver's License, Passport, National ID
                  </p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Choose File</Button>
                </div>

                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary hover:shadow-[0_0_20px_hsl(var(--neon-pink)_/_0.3)] transition-all cursor-pointer group">
                  <Instagram className="h-12 w-12 mx-auto mb-4 text-primary group-hover:animate-pulse" />
                  <p className="font-semibold mb-2">Instagram Profile Screenshot</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a screenshot of your Instagram profile
                  </p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Choose File</Button>
                </div>

                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary hover:shadow-[0_0_20px_hsl(var(--neon-pink)_/_0.3)] transition-all cursor-pointer group">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-primary group-hover:animate-pulse" />
                  <p className="font-semibold mb-2">Clear Face Picture</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a clear photo showing your face
                  </p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Choose File</Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-muted-foreground mb-4">or</p>
                  <Button
                    variant="outline"
                    className="w-full border-primary/50 hover:bg-primary/10 hover:border-primary"
                    onClick={() => setVerificationStatus("under-review")}
                  >
                    Send Verification Email
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus === "under-review" && (
              <div className="text-center py-8">
                <p className="text-lg mb-4">
                  Your verification is being processed. This usually takes 24-48 hours.
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll notify you via email once the review is complete.
                </p>
              </div>
            )}

            {verificationStatus === "verified" && (
              <div className="text-center py-8">
                <p className="text-lg mb-4">
                  🎉 Congratulations! Your account is now verified.
                </p>
                <Button className="w-full">Go to Dashboard</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
