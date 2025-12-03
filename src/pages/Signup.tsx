import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { mediaUrl, apiUrl } from "@/lib/apiURL";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "", // Keep empty, used in setup profile
    gender: "",
    profile_picture: `${mediaUrl}/2025/11/Untitled-design.png`,
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
  });

  const navigate = useNavigate();
  const location = useLocation();
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

  const fromGoogleSignup =
    (location.state as { fromGoogle?: boolean } | null)?.fromGoogle ?? false;

  useEffect(() => {
    if (pageLoader || !fromGoogleSignup) return;

    const rawPrefill = localStorage.getItem("google-signup-prefill");
    if (!rawPrefill) return;

    try {
      const parsed = JSON.parse(rawPrefill) as {
        email?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        picture?: string;
      };

      const fallbackNames = parsed.name?.trim().split(" ") ?? [];
      const fallbackFirst = fallbackNames.at(0) ?? "";
      const fallbackLast = fallbackNames.slice(1).join(" ");

      setFormData((prev) => ({
        ...prev,
        username:
          prev.username ||
          (parsed.email ? parsed.email.split("@")[0] : prev.username),
        email: prev.email || parsed.email || "",
        first_name:
          prev.first_name || parsed.firstName || fallbackFirst || prev.first_name,
        last_name:
          prev.last_name || parsed.lastName || fallbackLast || prev.last_name,
        profile_picture: parsed.picture || prev.profile_picture,
      }));

      toast.info("We filled your details from Google. Complete the rest to continue.");
    } catch (err) {
      console.error("Failed to parse google signup prefill", err);
      toast.error("Couldn't auto-fill Google info. Please enter details manually.");
    }
  }, [pageLoader, fromGoogleSignup]);

  async function uploadScreenshot(file) {
    if (!file) return null;
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`${apiUrl}/upload`, {
      method: "POST",
      body: data,
    });
    const json = await res.json();
    return json.url;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fileUrl = await uploadScreenshot(formData.insta_screenshot);

      const payload = {
        ...formData,
        insta_screenshot: fileUrl,
      };
      console.log("Signup payload:", payload);
      // return;
      const res = await registerUser(payload);

      if (res.success) {
        localStorage.setItem("user-register-payload", JSON.stringify(formData));
        localStorage.setItem("user-register", JSON.stringify(res));
        navigate("/waiting-approval");
        toast.success("Account created successfully!");
      } else {
        toast.error("Session expired!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
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
          <div className="absolute inset-0 pointer-events-none select-none bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.2)_0%,_transparent_50%)] animate-pulse-neon" />
          <div className="absolute inset-0 pointer-events-none select-none bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.1)_60deg,_transparent_120deg)] opacity-30" />

          <div className="w-full max-w-[800px] relative z-10">
            <div className="gradient-card neon-border rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_50px_hsl(330_81%_60%_/_0.3)]">
              <div className="flex justify-center mb-8">
                <img
                  src={logo}
                  alt="QHQ Logo"
                  onClick={() => navigate("/")}
                  className="h-20 animate-float cursor-pointer"
                />
              </div>

              <h1 className="text-3xl font-bold text-center mb-2 text-[#FC0090]">
                The Queue.
              </h1>
              <h1 className="text-2xl font-bold text-center mb-2 text-[#FC0090]">
                But before you enter it… 
              </h1>
              <p className=" text-center mb-8 text-[#FC0090]">
                Welcome to the application that stands between you and a real good time. 
We’re curating energy, not just a guest list - so show us who you are. No pressure (but actually yes).
              </p>

              <form onSubmit={handleSignup} className="space-y-6 color-form--pinkLabel">
                {/* Username & Name */}

               <div className="flex items-center w-full">
  <span className="flex-grow h-px bg-[#E93394]"></span>
  <span className="px-3 text-[#E93394] text-2xl font-[700]">The Basics (duh)</span>
  <span className="flex-grow h-px bg-[#E93394]"></span>
</div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col gap-2">
                      <Label>Username</Label>
                    <span className="label2">Enter your username</span>
                    </div>
                    <Input
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
                  <div className="flex-1 space-y-2">
                   
                    <div className="flex flex-col gap-2">
                      <Label>Email</Label>
                    <span className="label2">so we can hit you up if you pass the vibe check</span>
                    </div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                   
                     <div className="flex flex-col gap-2">
                       <Label>First Name</Label>
                    <span className="label2">govt or rave alias, we don’t judge (but govt preferably, pls)</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col gap-2">
                       <Label>Last Name</Label>
                    <span className="label2">govt or rave alias, we don’t judge (but govt preferably, pls)</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                   
                     <div className="flex flex-col gap-2">
                      <Label>Gender</Label>
                    <span className="label2">Select your Gender</span>
                    </div>
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
                  <div className="flex-1 space-y-2">
                     <div className="flex flex-col gap-2">
                      <Label>Instagram Handle</Label>
                    <span className="label2">we might stalk you a little. just a lil. </span>
                    </div>
                    <Input
                      type="text"
                      placeholder="@yourhandle"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                     <div className="flex flex-col gap-2">
                      <Label>Flex your Instagram</Label>
                    <span className="label2">{`For verification and safety, please upload a screenshot of your Instagram making sure your bio and 9 recent posts are visible. We wanna see how cool you are (no really) <3`}</span>
                    </div>
                    <Input
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

              

                {/* Merged Setup Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2 ">
                    <div className="flex flex-col gap-2">
                      <Label>Age</Label>
                    <span className="label2">we know it doesn't matter, but tell us (just in case hehe) </span>
                    </div>
                    <Input
                      type="number"
                      placeholder="21"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 ">
                    <div className="flex flex-col gap-2">
                      <Label>How did you hear about QHQ?</Label>
                    <span className="label2">Friends, IG, fate, alien radio signals? also do u think we're cool? 👉👈</span>
                    </div>
                    <Input
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

                   <div className="flex items-center w-full">
  <span className="flex-grow h-px bg-[#E93394]"></span>
  <span className="px-3 text-[#E93394] text-3xl font-[700]">Rave resume (but chill)</span>
  <span className="flex-grow h-px bg-[#E93394]"></span>
</div>

                {/* Textareas */}
                {[
                  { label: "Rave Resume", label2: "Tell us what makes you Queue-core. ", key: "rave_resume", height: "h-28" },
                  {
                    label: "Why do you wanna join the Queue?",
                    label2: "Don't overthink it. Just keep it ✨real✨",
                    key: "why_join",
                    height: "h-28",
                  },
                  {
                    label: "Your ideal night out vibe",
                    label2: "",
                    key: "vibe",
                    height: "h-24",
                  },
                  {
                    label: "Drop a link / name of your fave music artists / DJs",
                    label2: "We're kinda curious ngl",
                    key: "artists",
                    height: "h-24",
                  },
                  {
                    label: "Which event(s) do you want to experience?",
                    label2: "Tell us what makes you Queue-core. ",
                    key: "events",
                    height: "h-28",
                  },
                ].map((f, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Label>{f.label}</Label>
                    <span className="label2">{f.label2}</span>
                    </div>
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

                {/* Vibe Detector */}
                <div className="space-y-2">
                   <div className="flex flex-col gap-2">
                      <Label>Weird Vibe Detector™</Label>
                    <span className="label2">Let’s be real. We’ve all met someone who ruins the mood. Don’t be that person.
Answer honestly, or risk eternal side-eyes from the rave gods. </span>
<Label>Ever been kicked out of a party?</Label>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {["Yes", "No", "I plead the fifth"].map((text) => (
                      <label key={text} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          checked={formData.vibe_detector.includes(text)}
                          onChange={(e) => {
                            let newArray = [...formData.vibe_detector];
                            if (e.target.checked) newArray.push(text);
                            else
                              newArray = newArray.filter(
                                (item) => item !== text
                              );
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

                {/* Kicked Out */}
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
                            setFormData({ ...formData, kicked: e.target.value })
                          }
                        />
                        {text}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Agree rules */}
                <p className="text-[#E93394] text-[20px] font-bold mb-0"> I solemnly swear I’m not a buzzkill and agree to community guidelines:</p>
                <p className="mt-0 text-[#E93394]">• Respect personal space & boundaries<br />
• No harassment, creeper energy, or unsafe behavior<br />
• No "do you know who I am" vibes <br />
• Zero tolerance for discrimination of any <br />
• Basically, don’t be a weirdo</p>

<h1 className="text-[#E93394] text-[20px] font-bold mb-0">The Fine Print (yeah, read it)</h1>
<p
  className="mt-0 text-[#E93394]"
  dangerouslySetInnerHTML={{
    __html: `
      • I understand that not all applications will be approved (and that’s okay </3)<br />
      • I’m sharing this info willingly and with consent<br />
      • I won’t throw a tantrum if I don’t make the cut<br />
      • My information will stay private and won’t be shared anywhere shady 👀 
    `,
  }}
></p>
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
                  <span className="leading-tight label">
                   I agree. I’m chill. I wanna rave responsibly.<br />
                  I’ve read the above and I’m still cool with it. Let’s party.
                  </span>
                </label>

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
