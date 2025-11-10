import { useState } from "react";
import { Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Verify = () => {
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "under-review" | "verified">("pending");

  return (
    <div className="min-h-screen bg-black p-6 flex items-center justify-center">
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
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-semibold mb-2">Upload ID Document</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Accepted: Driver's License, Passport, National ID
                  </p>
                  <Button>Choose File</Button>
                </div>

                <div className="text-center">
                  <p className="text-muted-foreground mb-4">or</p>
                  <Button
                    variant="outline"
                    className="w-full"
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
