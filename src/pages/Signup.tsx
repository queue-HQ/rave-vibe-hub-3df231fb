import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { registerUser } from "@/api/auth";
import { mediaUrl } from "@/lib/apiURL";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    profile_picture: `${mediaUrl}/2025/11/Untitled-design.png`,
  });
  const navigate = useNavigate();
  const userRegister = localStorage.getItem("user-register");
  const userVerify = localStorage.getItem("user-verify");
  const userSetupProfile = localStorage.getItem("user-setup-profile");

  useEffect(() => {
    if (userRegister) {
      setTimeout(() => {
        navigate("/waiting-approval");
      }, 500);
      return;
    }

    if (userVerify) {
      setTimeout(() => {
        navigate("/verify-otp");
      }, 500);
      return;
    }

    if (userSetupProfile) {
      setTimeout(() => {
        navigate("/setup-profile");
      }, 500);
      return;
    }
    setPageLoader(false);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerUser(formData);

      if (res.success) {
        localStorage.setItem("user-register-payload", JSON.stringify(formData));
        localStorage.setItem("user-register", JSON.stringify(res));
        navigate("/waiting-approval");
        console.log("RES:", res);
        toast.success("Account created successfully!");
        setLoading(false);
      } else {
        toast.error("Session expired!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }

    console.log("Signup:", formData);
  };

  return (
    <>
      {pageLoader ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
        </div>
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.2)_0%,_transparent_50%)] animate-pulse-neon" />
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.1)_60deg,_transparent_120deg)] opacity-30" />

          <div className="w-full max-w-md relative z-10">
            <div className="gradient-card neon-border rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_50px_hsl(330_81%_60%_/_0.3)]">
              <div className="flex justify-center mb-8">
                <img src={logo} alt="QHQ Logo" className="h-20 animate-float" />
              </div>

              <h1 className="text-3xl font-bold text-center mb-2">
                Join the Underground
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Create your account and discover raves
              </p>

              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2 flex gap-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 !mt-0">
                    <Label htmlFor="name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>

                {/* Gender dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                {/* <Button type="button" variant="outline" className="w-full h-12">
              Continue with Google
            </Button> */}
              </form>

              <p className="text-center mt-6 text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
