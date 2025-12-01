"use client";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFormValidation } from "@/lib/useFormValidation";
import { required, email, minLength } from "@/lib/validators";
import { useUserProfile } from "@/context/UserProfileContext";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import parse from 'html-react-parser';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { refetch } = useUserProfile();
  const [showPassword, setShowPassword] = useState(false);

  const googleIcon = `<svg width="100px" height="100px" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/></svg>`

  const redirectPath =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

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

        await refetch();
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(res.data.message || "Login failed!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  type GoogleSignupPrefill = {
    email?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    name?: string;
    picture?: string;
  };

  const redirectToSignupWithGoogleData = (
    profile?: GoogleSignupPrefill,
    fallbackCredential?: string
  ) => {
    try {
      let resolvedProfile = profile;

      if (!resolvedProfile && fallbackCredential) {
        const [, payloadBase64] = fallbackCredential.split(".");
        if (!payloadBase64) {
          throw new Error("Invalid credential payload");
        }

        const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(
          normalized.padEnd(
            normalized.length + ((4 - (normalized.length % 4)) % 4),
            "="
          )
        );
        resolvedProfile = JSON.parse(decoded);
      }

      if (!resolvedProfile) {
        throw new Error("Missing Google profile data");
      }

      const firstName =
        resolvedProfile.firstName ??
        resolvedProfile.first_name ??
        (resolvedProfile.name?.split(" ")[0] ?? "");
      const lastName =
        resolvedProfile.lastName ??
        resolvedProfile.last_name ??
        (resolvedProfile.name?.split(" ").slice(1).join(" ") ?? "");

      const prefillData = {
        email: resolvedProfile.email ?? "",
        firstName,
        lastName,
        name:
          resolvedProfile.name ??
          `${firstName ?? ""} ${lastName ?? ""}`.trim(),
        picture: resolvedProfile.picture ?? "",
      };

      localStorage.setItem("google-signup-prefill", JSON.stringify(prefillData));
      toast.info("Complete your signup to finish creating your account");
      navigate("/signup", { replace: true, state: { fromGoogle: true } });
    } catch (err) {
      console.error("Failed to prepare Google signup prefill", err);
      toast.error("Could not read Google profile. Please sign up manually.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google credential missing. Please try again.");
      return;
    }

    setGoogleLoading(true);

    try {
      const res = await api.post("/google-login", {
        credential: credentialResponse.credential,
      });

      if (res.data?.success && res.data?.token && res.data?.user) {
        toast.success("Logged in with Google");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem(
          "token_expiry",
          (Date.now() + 10 * 60 * 1000).toString()
        );

        await refetch();
        navigate(redirectPath, { replace: true });
      } else if (res.data?.needs_signup) {
        redirectToSignupWithGoogleData(
          res.data?.profile,
          credentialResponse.credential
        );
        return;
      } else {
        redirectToSignupWithGoogleData(undefined, credentialResponse.credential);
        return;
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      const status = error.response?.status;
      if (code === "invalid_token" || status === 401) {
        toast.error("Google token invalid. Please try again.");
        return;
      }

      toast.error(error.response?.data?.message || "Google login failed");
      redirectToSignupWithGoogleData(
        error.response?.data?.profile,
        credentialResponse.credential
      );
      return;
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
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
            <div className="space-y-2 relative">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        value={formState.password.value}
        onChange={(e) => handleChange("password", e.target.value)}
        className="h-12 pr-12" // extra padding for the eye icon
      />
      {/* Eye icon */}
      <button
        type="button"
        className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

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
              disabled={!isValid || loading || googleLoading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
            </Button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="relative w-full flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-lg font-bold pointer-events-none"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    {parse(googleIcon)}
                    <span className="text-sm">Continue with Google</span>
                  </span>
                )}
              </Button>
              <div className="absolute inset-0 opacity-0 w-[175px] m-auto">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  width="100%"
                  shape="pill"
                  theme="outline"
                />
              </div>
            </div>
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
