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
  const TOTAL_STEPS = 4;
  const [loading, setLoading] = useState(false);
  const [pageLoader, setPageLoader] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [vibeDropdownOpen, setVibeDropdownOpen] = useState(false);
  const [eventTypeDropdownOpen, setEventTypeDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [eventTypeOptions, setEventTypeOptions] = useState<string[]>(["All Future Events"]);

  const MAX_SCREENSHOTS = 2;

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    first_name: "",
    last_name: "",
    email: "", // Keep empty, used in setup profile
    gender: "",
    profile_picture: `${mediaUrl}/2025/11/Untitled-design.png`,
    instagram: "",
    insta_screenshots: [] as File[],
    profile_picture_file: null as File | null,
    cnic_picture: "",
    cnic_picture_file: null as File | null,
    age: "",
    rave_resume: "",
    why_join: "",
    vibe: "",
    artists: "",
    vibe_detector: [],
    kicked: "",
    hear_about: "",
    events: "",
    event_types: [] as string[],
    password: "",
    confirm_password: "",
    agree_rules: false,
    agree_rules_1: true, // UI checkbox 1
    agree_rules_2: false, // UI checkbox 2
  });

  useEffect(() => {
    let mounted = true;
    const loadEventTypes = async () => {
      try {
        const res = await fetch(`${apiUrl}/events`);
        const json = await res.json();
        if (!mounted) return;
        const items = Array.isArray(json?.data) ? json.data : [];
        const now = Date.now();
        const titles = items
          .filter((e: any) => {
            const baseDate = String(e?.start_date ?? e?.date ?? "").trim();
            if (!baseDate) return false;

            const startTime = typeof e?.time === "string"
              ? e.time.split("-")[0]?.trim()
              : "";

            const candidates: string[] = [];
            if (startTime) {
              candidates.push(`${baseDate} ${startTime} GMT+0500`);
              candidates.push(`${baseDate} ${startTime}`);
            }
            candidates.push(`${baseDate} GMT+0500`);
            candidates.push(baseDate);

            const parsed = candidates
              .map((candidate) => new Date(candidate))
              .find((d) => !Number.isNaN(d.getTime()));

            return parsed ? parsed.getTime() >= now : false;
          })
          .map((e: any) => String(e?.title ?? "").trim())
          .filter(Boolean);
        const unique = Array.from(new Set(["All Future Events", ...titles]));
        setEventTypeOptions(unique);
      } catch {
        // ignore
      }
    };
    loadEventTypes();
    return () => {
      mounted = false;
    };
  }, []);

  const vibeOptions = [
    "Losing it to techno",
    "Vibing in the back w a cig & cool shades",
    "I show up when it's already chaos",
    "Wherever the bass hits",
    "I am the party",
  ];

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
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

  useEffect(() => {
    setVibeDropdownOpen(false);
    setEventTypeDropdownOpen(false);
  }, [currentStep]);

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

  async function uploadScreenshots(files: File[]) {
    if (!files?.length) return [];
    const uploads = await Promise.all(files.map((file) => uploadScreenshot(file)));
    return uploads.filter(Boolean);
  }

  

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.username.trim()) {
        toast.error("Username is required.");
        return false;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required.");
        return false;
      }
      if (!formData.event_types.length) {
        toast.error("Please select at least one event type.");
        return false;
      }
      if (!formData.full_name.trim()) {
        toast.error("Full name is required.");
        return false;
      }
      if (!formData.gender.trim()) {
        toast.error("Gender is required.");
        return false;
      }
      if (!formData.age) {
        toast.error("Age is required.");
        return false;
      }
      if (!formData.profile_picture_file) {
        toast.error("Profile picture is required.");
        return false;
      }
      if (!formData.cnic_picture_file) {
        toast.error("CNIC picture is required.");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.instagram.trim()) {
        toast.error("Instagram handle is required.");
        return false;
      }
      if (!formData.insta_screenshots?.length) {
        toast.error("Please upload at least one Instagram screenshot.");
        return false;
      }
      if (formData.insta_screenshots.length > MAX_SCREENSHOTS) {
        toast.error(`You can upload a maximum of ${MAX_SCREENSHOTS} screenshots.`);
        return false;
      }
      if (!formData.hear_about.trim()) {
        toast.error("Please tell us how you heard about QHQ.");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.why_join.trim()) {
        toast.error("Please answer why you wanna join the Queue.");
        return false;
      }
      if (!formData.artists.trim()) {
        toast.error("Please add your favorite artists / DJs.");
        return false;
      }
      if (!formData.vibe.trim()) {
        toast.error("Please select your ideal night out vibe.");
        return false;
      }
      if (!formData.vibe_detector.length) {
        toast.error("Please answer the vibe detector question.");
        return false;
      }
      if (!formData.agree_rules_1 || !formData.agree_rules_2) {
        toast.error("Please accept both agreements to continue.");
        return false;
      }
    }

    if (step === 4) {
      if (!formData.password) {
        toast.error("Password is required.");
        return false;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return false;
      }
      if (!formData.confirm_password) {
        toast.error("Confirm password is required.");
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        toast.error("Password and confirm password do not match.");
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true);

    try {
      const [profilePictureUrl, cnicPictureUrl] = await Promise.all([
        uploadScreenshot(formData.profile_picture_file),
        uploadScreenshot(formData.cnic_picture_file),
      ]);

      if (!profilePictureUrl) {
        toast.error("We couldn't upload your profile picture. Please try again.");
        setLoading(false);
        return;
      }

      if (!cnicPictureUrl) {
        toast.error("We couldn't upload your CNIC picture. Please try again.");
        setLoading(false);
        return;
      }

      if (!formData.insta_screenshots?.length) {
        toast.error("Please upload at least one Instagram screenshot.");
        setLoading(false);
        return;
      }

      if (formData.insta_screenshots.length > MAX_SCREENSHOTS) {
        toast.error(`You can upload a maximum of ${MAX_SCREENSHOTS} screenshots.`);
        setLoading(false);
        return;
      }

      const fileUrls = await uploadScreenshots(formData.insta_screenshots);

      if (!fileUrls.length) {
        toast.error("We couldn't upload your screenshots. Please try again.");
        setLoading(false);
        return;
      }

      const {
        insta_screenshots,
        profile_picture_file,
        cnic_picture_file,
        ...rest
      } = formData;

      const payload = {
        ...rest,
        profile_picture: profilePictureUrl,
        cnic_picture: cnicPictureUrl,
        insta_screenshot: fileUrls,
      };
      console.log("Signup payload:", payload);
      // return;
      const res = await registerUser(payload);

      if (res.success && res.token && res.user) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem(
          "token_expiry",
          (Date.now() + 10 * 60 * 1000).toString()
        );
        navigate("/dashboard", { replace: true });
        toast.success("Account created successfully!");
      } else {
        toast.error(res?.message || "Signup failed.");
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
                But before you enter it...
              </h1>
              <p className=" text-center mb-8 text-[#FC0090]">
                Welcome to the application standing between you and a real good time. We’re curating energy, not just numbers — show us who you are. No pressure (okay maybe a little).
              </p>

              <form onSubmit={handleSignup} className="space-y-6 color-form--pinkLabel">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[#E93394] text-sm font-semibold">
                    <span>Step {currentStep} of {TOTAL_STEPS}</span>
                    <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-[#E93394] transition-all duration-300"
                      style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                  </div>
                </div>

                {currentStep === 1 && (
                  <>
                    <div className="flex items-center w-full">
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                      <span className="px-3 text-[#E93394] text-2xl font-[700]">The Basics (30 seconds, promise)</span>
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-2 space-y-2">
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
                          <Label>Full Name</Label>
                          <span className="label2">
                            govt or rave alias, we don’t judge (but govt preferably, pls)
                          </span>
                        </div>

                        <Input
                          type="text"
                          placeholder="Haris Ali"
                          value={formData.full_name}
                          onChange={(e) => {
                            const value = e.target.value;
                            const parts = value.trim().split(" ");

                            const firstName = parts[0] || "";
                            const lastName = parts.slice(1).join(" ");

                            setFormData({
                              ...formData,
                              full_name: value,
                              first_name: firstName,
                              last_name: lastName,
                            });
                          }}
                          className="h-12"
                          required
                        />
                      </div>

                    </div>

                    <div className="flex gap-2">


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

                      <div className="flex-1 space-y-2">
                        <Label>Event Type</Label>
                        <span className="label2"><br />Select one or more</span>

                        <div
                          className="w-full bg-black/40 border border-white/10 text-white rounded-md p-2 flex flex-wrap gap-1 min-h-[48px] cursor-pointer items-center"
                          onClick={() => setEventTypeDropdownOpen((prev) => !prev)}
                        >
                          {formData.event_types.length ? (
                            formData.event_types.map((v) => (
                              <span
                                key={v}
                                className="bg-[#E932A2] text-white px-4 py-[6px] rounded-full flex items-center gap-1 text-sm"
                              >
                                {v}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormData({
                                      ...formData,
                                      event_types: formData.event_types.filter((val) => val !== v),
                                    });
                                  }}
                                  className="text-white hover:text-red-400 text-xs font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-white/50">Select event type(s)</span>
                          )}
                        </div>

                        {eventTypeDropdownOpen && (
                          <div className="absolute z-20 w-full bg-black/90 border border-white/20 mt-1 rounded-md max-h-48 overflow-y-auto">
                            {eventTypeOptions.map((option) => {
                              const selected = formData.event_types.includes(option);
                              return (
                                <div
                                  key={option}
                                  className={`px-3 py-2 cursor-pointer hover:bg-white/10 flex justify-between items-center ${selected ? "bg-white/20 font-semibold" : ""
                                    }`}
                                  onClick={() => {
                                    let current = [...formData.event_types];
                                    if (selected) {
                                      current = current.filter((v) => v !== option);
                                    } else {
                                      current.push(option);
                                    }
                                    setFormData({ ...formData, event_types: current });
                                  }}
                                >
                                  <span>{option}</span>
                                  {selected && <span className="text-sm">{"\u2713"}</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {eventTypeDropdownOpen && (
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setEventTypeDropdownOpen(false)}
                          />
                        )}
                      </div>
                    </div>


                    <div className="flex gap-2">
                      <div className="felx-1 space-y-2 ">
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

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-2">
                          <Label>Gender</Label>
                          <span className="label2">Select your Gender</span>
                        </div>
                        <Select
                          value={
                            formData.gender === "male" || formData.gender === "female"
                              ? formData.gender
                              : formData.gender
                                ? "other"
                                : ""
                          }
                          onValueChange={(value) => {
                            if (value === "other") {
                              setFormData({
                                ...formData,
                                gender: "",
                              });
                            } else {
                              setFormData({
                                ...formData,
                                gender: value,
                              });
                            }
                          }}
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

                    </div>


                    {(formData.gender === "" ||
                      (formData.gender !== "male" && formData.gender !== "female")) && (
                        <div className="space-y-2 mt-2">
                          <div className="flex flex-col gap-2">
                            <Label>Please specify</Label>
                            <span className="label2">Type your gender</span>
                          </div>

                          <Input
                            type="text"
                            placeholder="Type your gender"
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            className="h-12"
                            required
                          />
                        </div>
                      )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                          <Label>Profile Picture</Label>
                          <span className="label2">Upload your profile picture</span>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              profile_picture_file: e.target.files?.[0] || null,
                            }))
                          }
                          required
                        />
                        <div className="label2 text-xs text-white/70">
                          {formData.profile_picture_file
                            ? `Selected: ${formData.profile_picture_file.name}`
                            : "No file selected"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                          <Label>CNIC Picture</Label>
                          <span className="label2">Upload your CNIC image</span>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cnic_picture_file: e.target.files?.[0] || null,
                            }))
                          }
                          required
                        />
                        <div className="label2 text-xs text-white/70">
                          {formData.cnic_picture_file
                            ? `Selected: ${formData.cnic_picture_file.name}`
                            : "No file selected"}
                        </div>
                      </div>
                    </div>


                  </>
                )}

                {currentStep === 2 && (
                  <>
                   <div className="flex items-center w-full">
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                      <span className="px-3 text-[#E93394] text-2xl font-[700]">Social Check (quick glance, not a deep dive)</span>
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                    </div>
<br />

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Instagram Handle</Label>
                        <span className="label2">we might stalk you a little. <i>just a lil.</i></span>
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

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Flex your Instagram</Label>
                        <span className="label2">{`upload a screenshot of your bio + last 9 posts; no influencer vibes required.`} <span
                          className="underline cursor-pointer text-[#FC0090] hover:opacity-80"
                          onClick={() => setOpenModal(true)}
                        >
                          (example)
                        </span></span>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const incomingFiles = Array.from(e.target.files || []);
                          if (incomingFiles.length > MAX_SCREENSHOTS) {
                            toast.error(`You can upload a maximum of ${MAX_SCREENSHOTS} screenshots.`);
                          }

                          const selected = incomingFiles.slice(0, MAX_SCREENSHOTS);
                          setFormData((prev) => ({
                            ...prev,
                            insta_screenshots: selected,
                          }));
                        }}
                        required
                      />
                      <div className="label2 text-xs text-white/70">
                        {`Selected ${formData.insta_screenshots.length}/${MAX_SCREENSHOTS} screenshots`}
                        {formData.insta_screenshots.length > 0 && (
                          <ul className="mt-1 space-y-1">
                            {formData.insta_screenshots.map((file, idx) => (
                              <li key={`${file.name}-${idx}`} className="truncate">
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 ">
                      <div className="flex flex-col gap-2">
                        <Label>How did you hear about QHQ?</Label>
                        <span className="label2">friends, IG, fate, or the voices?</span>
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
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="flex items-center w-full">
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                      <div className="py-10 flex flex-col items-center px-3 text-[#E93394]">
                        <span className="text-3xl font-[700]">Rave Resumé ✨</span>
                        <span className="text font-[500]">(this is the fun part)</span>
                      </div>
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Why do you wanna join the Queue?</Label>
                        <span className="label2">convince us, lightly</span>
                      </div>
                      <textarea
                        className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/40 rounded-md p-3 h-28"
                        value={formData.why_join}
                        onChange={(e) =>
                          setFormData({ ...formData, why_join: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Drop a link / name of your fave music artists / DJs</Label>
                        <span className="label2"><i>We're kinda curious ngl</i></span>
                      </div>
                      <textarea
                        className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/40 rounded-md p-3 h-24"
                        value={formData.artists}
                        onChange={(e) =>
                          setFormData({ ...formData, artists: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2 relative">
                      <Label>Your ideal night out vibe</Label>
                      <span className="label2"><br />Select all that apply</span>

                      <div
                        className="w-full bg-black/40 border border-white/10 text-white rounded-md p-2 flex flex-wrap gap-1 min-h-[48px] cursor-pointer items-center"
                        onClick={() => setVibeDropdownOpen((prev) => !prev)}
                      >
                        {formData.vibe
                          ? formData.vibe.split(", ").map((v) => (
                            <span
                              key={v}
                              className="bg-[#E932A2] text-white px-4 py-[6px] rounded-full flex items-center gap-1 text-sm"
                            >
                              {v}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const current = formData.vibe
                                    .split(", ")
                                    .filter((val) => val !== v);
                                  setFormData({ ...formData, vibe: current.join(", ") });
                                }}
                                className="text-white hover:text-red-400 text-xs font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))
                          : <span className="text-white/50">Select your vibe(s)</span>}
                      </div>

                      {vibeDropdownOpen && (
                        <div className="absolute z-20 w-full bg-black/90 border border-white/20 mt-1 rounded-md max-h-48 overflow-y-auto">
                          {vibeOptions.map((option) => {
                            const selected = formData.vibe.split(", ").includes(option);

                            return (
                              <div
                                key={option}
                                className={`px-3 py-2 cursor-pointer hover:bg-white/10 flex justify-between items-center ${selected ? "bg-white/20 font-semibold" : ""}`}
                                onClick={() => {
                                  let current = formData.vibe.split(", ").filter(Boolean);
                                  if (selected) current = current.filter((v) => v !== option);
                                  else current.push(option);
                                  setFormData({ ...formData, vibe: current.join(", ") });
                                }}
                              >
                                <span>{option}</span>
                                {selected && <span className="text-sm">{"\u2713"}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {vibeDropdownOpen && (
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setVibeDropdownOpen(false)}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Weird Vibe Detector™</Label>
                        <span className="label2">Ever been kicked out of a party? (No judgement. Patterns matter more than lore.)</span>
                        {/* <Label>Ever been kicked out of a party?</Label> */}
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

                    {/* <div className="space-y-2 mt-6">
                      <p className="text-[#E93394] text-[20px] font-bold mb-0">
                        I solemnly swear I’m not a buzzkill and agree to community guidelines:
                      </p>
                      <ul className="mt-1 text-[#E93394] list-disc list-inside space-y-1">
                        <li>Respect personal space & boundaries</li>
                        <li>No harassment, creeper energy, or unsafe behavior</li>
                        <li>No "do you know who I am" vibes</li>
                        <li>Zero tolerance for discrimination of any kind</li>
                        <li>Basically, don’t be a weirdo</li>
                      </ul>
                      <label className="flex gap-3 items-start mt-2">
                        <input
                          type="checkbox"
                          checked={formData.agree_rules_1 || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              agree_rules_1: e.target.checked,
                            })
                          }
                          required
                        />
                        <span className="leading-tight label">
                          I agree. I’m chill. I wanna rave responsibly.
                        </span>
                      </label>
                    </div> */}

                    <div className="space-y-2 mt-6">
                      <p className="text-[#E93394] text-[20px] font-bold mb-0">
                        The Fine Print (aka your vibe pledge)<br />
                        <span>I promise to:</span>
                      </p>
                      <ul
                        className="mt-1 text-[#E93394] list-disc list-inside space-y-1"
                        dangerouslySetInnerHTML={{
                          __html: `
                            <li>I understand that not all applications will be approved (and that's okay)</li>
                            <li>I’m sharing this info willingly and with consent</li>
                            <li>I won’t throw a tantrum if I don’t make the cut</li>
                            <li>My information will stay private and won't be shared anywhere shady</li>
                          `,
                        }}
                      />
                      
                      <label className="flex gap-3 items-start mt-2">
                        <input
                          type="checkbox"
                          checked={formData.agree_rules_2 || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              agree_rules_2: e.target.checked,
                            })
                          }
                          required
                        />
                        <span className="leading-tight label">
                          I’ve read the above and I’m still cool with it. Let’s party.
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="flex items-center w-full">
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                      <span className="px-3 text-[#E93394] text-2xl font-[700]">Set Your Password</span>
                      <span className="flex-grow h-px bg-[#E93394]"></span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Password</Label>
                        <span className="label2">Minimum 8 characters</span>
                      </div>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-2">
                        <Label>Confirm Password</Label>
                        <span className="label2">Re-enter your password</span>
                      </div>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirm_password}
                        onChange={(e) =>
                          setFormData({ ...formData, confirm_password: e.target.value })
                        }
                        className="h-12"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={goBack}
                      className="h-12 text-lg font-bold bg-transparent border border-[#E93394] text-[#E93394] hover:bg-[#E93394]/10"
                    >
                      Back
                    </Button>
                  )}

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={goNext}
                      className="w-full h-12 text-lg font-bold"
                    >
                      Next
                    </Button>
                  ) : (
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
                  )}
                </div>
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



      {/* Modals */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="
        relative bg-black rounded-2xl p-4 w-full shadow-xl
        max-w-3xl
        max-h-[75vh] overflow-y-auto
        md:max-h-none md:overflow-visible
      "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon */}
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-white text-xl hover:opacity-70"
            >
              x
            </button>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <img
                src="/sample1.jpeg"
                alt="Sample 1"
                className="w-full rounded-xl object-cover"
              />

              <img
                src="/sample2.jpeg"
                alt="Sample 2"
                className="w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default Signup;
