import { useState, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { resetPassword } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialEmail = useMemo(() => {
    const stateEmail = (location.state as { email?: string } | null)?.email;
    if (stateEmail) return stateEmail;
    const params = new URLSearchParams(location.search);
    return params.get("email") ?? "";
  }, [location]);

  const [formState, setFormState] = useState({
    email: initialEmail,
    code: "",
    password: "",
    confirm_password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.email || !formState.code) {
      toast({
        title: "Code Invalid!",
        description: "Email and reset code are required.",
        variant: "destructive",
      });
      return;
    }

    if (formState.password.length < 8) {
      toast({
        title: "Error!",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (formState.password !== formState.confirm_password) {
      toast({
        title: "Error!",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword({ ...formState });
      if (res?.success) {
        toast({
        title: "Password reset successfully",
        description: "You can now log in with your new password.",
      });
        navigate("/login", { replace: true });
      } else {
        toast({
        title: "Error!",
        description: res?.message || "Unable to reset password",
        variant: "destructive",
      });
      }
    } catch (error: any) {
      toast({
        title: "Error!",
        description: error?.response?.data?.message || "Reset failed",
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
            Set a new password
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter the reset code from your email and choose a new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formState.email}
                onChange={handleChange}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Reset code</Label>
              <Input
                id="code"
                name="code"
                placeholder="Enter the 6-digit code"
                value={formState.code}
                onChange={handleChange}
                className="h-12 tracking-[0.4em] uppercase"
                maxLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formState.password}
                onChange={handleChange}
                className="h-12"
                minLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                name="confirm_password"
                placeholder="••••••••"
                value={formState.confirm_password}
                onChange={handleChange}
                className="h-12"
                minLength={8}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Set new password"}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Didn't get the code?{" "}
            <Link to="/forgot-password" className="text-primary font-semibold">
              Resend
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
