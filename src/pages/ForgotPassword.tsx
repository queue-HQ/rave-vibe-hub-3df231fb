import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { requestPasswordReset } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      toast({
        title: "Error!",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(email.trim());
      if (res?.success) {
        toast({
        title: res?.message || "Reset code sent!",
        description: "Check your inbox for the verification code.",
      });
        navigate("/reset-password", { state: { email: email.trim() } });
      } else {
        toast({
        title: "Error!",
        description: res?.message || "Unable to send reset code.",
        variant: "destructive",
      });
      }
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error?.response?.data?.message || "Failed to send reset code.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="gradient-card neon-border rounded-2xl p-8 backdrop-blur-xl shadow-lg">
          <div className="flex justify-center mb-8">
            <img
              src={logo}
              alt="QHQ Logo"
              onClick={() => navigate("/")}
              className="h-20 animate-float cursor-pointer"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">
            Forgot Password?
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter the email linked to your account. We'll send you a reset code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending code..." : "Send reset code"}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-semibold">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
