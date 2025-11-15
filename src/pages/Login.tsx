"use client";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useFormValidation } from "@/lib/useFormValidation";
import { required, email, minLength } from "@/lib/validators";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Use reusable form validation hook
  const { formState, handleChange, getError, isValid } = useFormValidation({
    email: { value: "", validators: [required(), email()] },
    password: { value: "", validators: [required(), minLength(6)] },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return; // prevent submit if form invalid

    setLoading(true);

    try {
      const res = await api.post("/userLogin", {
        email: formState.email.value,
        password: formState.password.value,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Token expires in 10 minute
        localStorage.setItem(
          "token_expiry",
          (Date.now() + 10 * 60 * 1000).toString()
        );

        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <div className="gradient-card neon-border rounded-2xl p-8 backdrop-blur-xl shadow-lg">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="QHQ Logo" className="h-20 animate-float" />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-8">
            Login to access the underground
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formState.email.value}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-12"
              />
              {getError("email") && (
                <p className="text-red-500 text-sm">{getError("email")}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formState.password.value}
                onChange={(e) => handleChange("password", e.target.value)}
                className="h-12"
              />
              {getError("password") && (
                <p className="text-red-500 text-sm">{getError("password")}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login button disabled until form is valid */}
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold"
              disabled={!isValid || loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
            </Button>
            {/* 
            <Button type="button" variant="outline" className="w-full h-12">
              Continue with Google
            </Button> */}
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
