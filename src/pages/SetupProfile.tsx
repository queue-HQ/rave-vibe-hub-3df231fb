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
import { setupProfile } from "@/api/auth";
import { mediaUrl } from "@/lib/apiURL";
import { Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/apiURL";

console.log("MEDIA URL IN SETUP PROFILE:", apiUrl);

const SetupProfile = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);
  const userPaylod = JSON.parse(localStorage.getItem("user-register-payload"));
  const [formData, setFormData] = useState({
    email: userPaylod?.email || "",
    instagram: "",
    insta_screenshot: null,
    age: "",
    rave_resume: "",
    why_join: "",
    vibe: "",
    artists: "",
    vibe_detector: [],
    kicked: "",
    hear_about: "",
    events: "",
    agree_rules: false,
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const userRegister = localStorage.getItem("user-register");
  const userVerify = localStorage.getItem("user-verify");

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
    setPageLoader(false);
  }, []);

  async function uploadScreenshot(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      "http://localhost/wp-backend/wp-json/app/v1/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.url; // Final hosted URL
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fileUrl = await uploadScreenshot(formData.insta_screenshot);

      // Build final payload
      const payload = {
        ...formData,
        insta_screenshot: fileUrl,
      };
      console.log("FINAL PAYLOAD:", payload);

      const res = await setupProfile(payload);

      if (res.success) {
        localStorage.removeItem("user-register-payload");
        localStorage.removeItem("user-setup-profile");
        toast.success("Hurray! Account created successfully!");
        navigate("/login");
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed!");
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
          {/* BACKGROUND EFFECTS */}
          <div
            className="absolute inset-0 pointer-events-none select-none
       bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.15)_0%,_transparent_60%)]"
          />

          <div
            className="absolute inset-0 pointer-events-none select-none
       bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.08)_80deg,_transparent_150deg)] opacity-40"
          />

          <div className="w-full max-w-xl relative z-10">
            <div
              className="gradient-card neon-border rounded-2xl p-8 
      backdrop-blur-xl shadow-[0_0_40px_hsl(330_81%_60%_/_0.2)]
      bg-black/40 border border-white/10"
            >
              {/* LOGO */}
              <div className="flex justify-center mb-8">
                <img src={logo} alt="QHQ Logo" className="h-20 animate-float" />
              </div>

              {/* TEXT */}
              <h1 className="text-3xl font-bold text-center mb-2">
                Set up Your Profile
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Create your account and discover raves
              </p>

              {/* FORM */}
              <form onSubmit={handleSignup} className="space-y-8">
                {/* TOP GRID - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Handle */}
                  <div className="space-y-2">
                    <Label>Instagram Handle</Label>
                    <Input
                      className="bg-black/40 border border-white/10 text-white placeholder:text-white/40"
                      type="text"
                      placeholder="@yourhandle"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Screenshot */}
                  <div className="space-y-2">
                    <Label>Flex your Instagram</Label>
                    <Input
                      className="bg-black/40 border border-white/10 text-white"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          insta_screenshot: e.target.files[0],
                        })
                      }
                      required
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      className="bg-black/40 border border-white/10 text-white placeholder:text-white/40"
                      type="number"
                      placeholder="21"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Heard About */}
                  <div className="space-y-2">
                    <Label>How did you hear about QHQ?</Label>
                    <Input
                      className="bg-black/40 border border-white/10 text-white placeholder:text-white/40"
                      type="text"
                      placeholder="friends, IG, fate..."
                      value={formData.hear_about}
                      onChange={(e) =>
                        setFormData({ ...formData, hear_about: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* BIG FIELDS - 1 column */}
                <div className="space-y-6">
                  {[
                    {
                      label: "Rave Resume",
                      key: "rave_resume",
                      height: "h-28",
                    },
                    {
                      label: "Why do you wanna join the Queue?",
                      key: "why_join",
                      height: "h-28",
                    },
                    {
                      label: "Your ideal night out vibe",
                      key: "vibe",
                      height: "h-24",
                    },
                    {
                      label: "Your fave music artists / DJs",
                      key: "artists",
                      height: "h-24",
                    },
                  ].map((f, i) => (
                    <div key={i} className="space-y-2">
                      <Label>{f.label}</Label>
                      <textarea
                        className={`w-full bg-black/40 border border-white/10 text-white placeholder:text-white/40 rounded-md p-3 ${f.height}`}
                        value={formData[f.key]}
                        onChange={(e) =>
                          setFormData({ ...formData, [f.key]: e.target.value })
                        }
                        required
                      />
                    </div>
                  ))}

                  {/* Weird vibe detector */}
                  <div className="space-y-2">
                    <Label>Weird Vibe Detector</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {["Yes", "No", "I plead the fifth"].map((text) => (
                        <label key={text} className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={formData.vibe_detector.includes(text)}
                            onChange={(e) => {
                              let newArray = [...formData.vibe_detector];

                              if (e.target.checked) {
                                newArray.push(text);
                              } else {
                                newArray = newArray.filter(
                                  (item) => item !== text
                                );
                              }

                              setFormData({
                                ...formData,
                                vibe_detector: newArray,
                              });
                            }}
                          />
                          {text}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Kicked out radio */}
                  <div className="space-y-2">
                    <Label>Ever been kicked out of a party?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        ["yes", "Yes"],
                        ["no", "No"],
                        ["plead", "I plead the fifth"],
                      ].map(([val, text]) => (
                        <label key={val} className="flex gap-2 items-center">
                          <input
                            type="radio"
                            name="kicked"
                            value={val}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                kicked: e.target.value,
                              })
                            }
                          />
                          {text}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="space-y-2">
                    <Label>Which event(s) do you want to experience?</Label>
                    <textarea
                      className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/40 rounded-md p-3 h-28"
                      value={formData.events}
                      onChange={(e) =>
                        setFormData({ ...formData, events: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Agreement */}
                  <label className="flex gap-3 items-start">
                    <input
                      type="checkbox"
                      checked={formData.agree_rules}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          agree_rules: e.target.checked,
                        })
                      }
                      required
                    />
                    <span className="leading-tight text-white">
                      I solemnly swear I'm not a buzzkill & I agree to community
                      guidelines
                    </span>
                  </label>

                  {/* Password grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Password", key: "password" },
                      { label: "Confirm Password", key: "confirmPassword" },
                    ].map((f, i) => (
                      <div key={i} className="space-y-2">
                        <Label>{f.label}</Label>
                        <Input
                          type="password"
                          className="bg-black/40 border border-white/10 text-white placeholder:text-white/40"
                          value={formData[f.key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [f.key]: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
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
