import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { setupProfile, setPassword } from "@/api/auth";
import { Loader2 } from "lucide-react";

const SetupProfile = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);

  const userPaylod = JSON.parse(localStorage.getItem("user-register-payload"));

  const [formData, setFormData] = useState({
    email: userPaylod?.email || "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const userRegister = localStorage.getItem("user-register");
  const userVerify = localStorage.getItem("user-verify");

  useEffect(() => {
    if (!userRegister && !userPaylod) {
      navigate("/signup");
      return;
    }
    setPageLoader(false);
  }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        setLoading(false);
        return;
      }

      const payload = {
        // ...userPaylod,
        email: formData.email,
        password: formData.password,
      };

      const res = await setPassword(payload);

      if (res.success) {
        localStorage.removeItem("user-register-payload");
        localStorage.removeItem("user-register");
        localStorage.removeItem("user-setup-profile");
        toast.success("Hurray! Account created successfully!");
        navigate("/login");
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Setup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {pageLoader ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
        </div>
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
          <div className="w-full max-w-md relative z-10">
            <div className="gradient-card neon-border rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_40px_hsl(330_81%_60%_/_0.2)] bg-black/40 border border-white/10">
              <div className="flex justify-center mb-8">
                <img src={logo} alt="QHQ Logo" className="h-20 animate-float" />
              </div>

              <h1 className="text-3xl font-bold text-center mb-2">
                Set up Your Profile
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Set your email & password
              </p>

              <form onSubmit={handleSetup} className="space-y-6">
                <div className="space-y-2" style={{ display: "none" }}>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="h-12"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Set Up Profile"
                  )}
                </Button>
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

export default SetupProfile;
