import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import EditorLayout from "@/components/layouts/EditorLayout";
import { createAdminUser, updateAdminUser } from "@/api/admin";
import { apiUrl } from "@/lib/apiURL";

const vibeOptions = [
  "Losing it to techno",
  "Vibing in the back w a cig & cool shades",
  "I show up when it’s already chaos",
  "Wherever the bass hits",
  "I am the party",
];

const vibeDetectorOptions = ["Yes", "No", "I plead the fifth"];
const hearAboutOptions = ["Instagram", "Facebook", "Friends", "Events", "Other"];
const genderOptions = ["male", "female", "other"];
const roleOptions = ["subscriber", "editor", "administrator"];
const statusOptions = ["approved", "pending", "rejected"];
const MAX_SCREENSHOTS = 2;

const initialState = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  display_name: "",
  role: "subscriber",
  account_status: "approved",
  phone: "",
  address: "",
  bio: "",
  gender: "",
  instagram: "",
  profile_picture: "",
  age: "",
  rave_resume: "",
  why_join: "",
  vibe: "",
  artists: "",
  vibe_detector: [] as string[],
  kicked: "",
  hear_about: "",
  events: "",
  agree_rules_1: false,
  agree_rules_2: false,
};

export default function EditorUserForm() {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const [instaScreenshots, setInstaScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (profilePictureFile) {
      const url = URL.createObjectURL(profilePictureFile);
      setProfilePicturePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setProfilePicturePreview(form.profile_picture || "");
  }, [profilePictureFile, form.profile_picture]);

  useEffect(() => {
    const urls = instaScreenshots.map((file) => URL.createObjectURL(file));
    setScreenshotPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [instaScreenshots]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === "full_name") {
      const parts = value.trim().split(" ");
      setForm((prev) => ({
        ...prev,
        display_name: value,
        first_name: parts[0] || prev.first_name,
        last_name: parts.slice(1).join(" "),
      }));
      return;
    }
    if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/[^0-9]/g, "") }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`${apiUrl}/upload`, {
      method: "POST",
      body: data,
    });
    if (!res.ok) {
      throw new Error("Failed to upload file");
    }
    const json = await res.json();
    if (!json?.url) {
      throw new Error("Upload did not return a URL");
    }
    return json.url as string;
  };

  const uploadScreenshotFiles = async () => {
    if (!instaScreenshots.length) {
      throw new Error("Please upload at least one Instagram screenshot");
    }
    const uploads = await Promise.all(instaScreenshots.map((file) => uploadFile(file)));
    return uploads.filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!instaScreenshots.length) {
      toast.error("Please upload at least one Instagram screenshot");
      return;
    }
    if (!form.agree_rules_1 || !form.agree_rules_2) {
      toast.error("Please confirm both agreements");
      return;
    }

    try {
      setSaving(true);
      const profilePictureUrl = profilePictureFile ? await uploadFile(profilePictureFile) : form.profile_picture;
      const screenshotUrls = await uploadScreenshotFiles();

      const basePayload = {
        email: form.email.trim(),
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        display_name: (form.display_name || `${form.first_name} ${form.last_name}`).trim(),
        role: form.role,
        account_status: form.account_status,
      };

      const createRes = await createAdminUser(basePayload);
      if (!createRes?.success) {
        toast.error(createRes?.message || "Failed to create user");
        return;
      }

      const userId = createRes.user_id;
      if (!userId) {
        toast.error("User created but no ID returned. Please refresh and edit manually.");
        return;
      }

      const metaPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        display_name: (form.display_name || `${form.first_name} ${form.last_name}`).trim(),
        role: form.role,
        account_status: form.account_status,
        meta: {
          phone: form.phone,
          address: form.address,
          bio: form.bio,
          gender: form.gender,
          instagram: form.instagram,
          profile_picture: profilePictureUrl,
          insta_screenshot: screenshotUrls,
          age: form.age ? Number(form.age) : "",
          rave_resume: form.rave_resume,
          why_join: form.why_join,
          vibe: form.vibe,
          artists: form.artists,
          vibe_detector: form.vibe_detector,
          kicked: form.kicked,
          hear_about: form.hear_about,
          events: form.events,
          agree_rules_1: form.agree_rules_1,
          agree_rules_2: form.agree_rules_2,
        },
      };

      const updateRes = await updateAdminUser(userId, metaPayload);
      if (!updateRes?.success) {
        toast.warning(updateRes?.message || "User created but meta save failed. Please edit manually.");
      } else {
        toast.success("User created");
      }
      navigate("/editor/users");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || error.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const selectedVibeDetector = useMemo(() => new Set(form.vibe_detector), [form.vibe_detector]);

  return (
    <EditorLayout title="Add User">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Basics</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={form.username} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" value={form.first_name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" value={form.last_name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Full / Display Name</Label>
                <Input id="display_name" name="display_name" value={form.display_name} onChange={handleInputChange} placeholder="Haniyaa Khan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_status">Account Status</Label>
                <Select value={form.account_status} onValueChange={(value) => setForm((prev) => ({ ...prev, account_status: value }))}>
                  <SelectTrigger id="account_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={form.address} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" name="instagram" value={form.instagram} onChange={handleInputChange} placeholder="@handle" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={form.bio} onChange={handleInputChange} rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" min={0} value={form.age} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hear_about">How did you hear about us?</Label>
                <Select value={form.hear_about} onValueChange={(value) => setForm((prev) => ({ ...prev, hear_about: value }))}>
                  <SelectTrigger id="hear_about">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {hearAboutOptions.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rave_resume">Rave Resume</Label>
                <Textarea id="rave_resume" name="rave_resume" value={form.rave_resume} onChange={handleInputChange} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="why_join">Why Join</Label>
                <Textarea id="why_join" name="why_join" value={form.why_join} onChange={handleInputChange} rows={3} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vibe">Ideal Night Out Vibe</Label>
                <Textarea id="vibe" name="vibe" value={form.vibe} onChange={handleInputChange} rows={3} placeholder="Vibing in the back..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artists">Favourite Artists / DJs</Label>
                <Textarea id="artists" name="artists" value={form.artists} onChange={handleInputChange} rows={3} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Weird Vibe Detector™</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {vibeDetectorOptions.map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedVibeDetector.has(option)}
                      onCheckedChange={(checked) => {
                        setForm((prev) => ({
                          ...prev,
                          vibe_detector: checked
                            ? [...prev.vibe_detector, option]
                            : prev.vibe_detector.filter((item) => item !== option),
                        }));
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kicked">Ever been kicked out of a party?</Label>
              <Input id="kicked" name="kicked" value={form.kicked} onChange={handleInputChange} placeholder="Yes/No/Story" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="events">Events Interested In</Label>
              <Textarea id="events" name="events" value={form.events} onChange={handleInputChange} rows={3} />
            </div>
          </CardContent>

          <CardContent className="space-y-6 border-t pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Profile Picture</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProfilePictureFile(file);
                    if (!file) {
                      setForm((prev) => ({ ...prev, profile_picture: "" }));
                    }
                  }}
                />
                {profilePicturePreview && (
                  <div className="h-32 w-32 overflow-hidden rounded-lg border">
                    <img src={profilePicturePreview} alt="Profile preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Instagram Screenshots (max {MAX_SCREENSHOTS})</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    if (files.length > MAX_SCREENSHOTS) {
                      toast.error(`You can upload a maximum of ${MAX_SCREENSHOTS} screenshots.`);
                    }
                    setInstaScreenshots(files.slice(0, MAX_SCREENSHOTS));
                  }}
                />
                <div className="flex gap-3">
                  {screenshotPreviews.map((preview, index) => (
                    <div key={preview} className="relative h-24 w-20 overflow-hidden rounded-md border">
                      <img src={preview} alt={`Screenshot ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                        onClick={() => {
                          setInstaScreenshots((prev) => prev.filter((_, idx) => idx !== index));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Community Agreements</Label>
              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={form.agree_rules_1}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, agree_rules_1: Boolean(checked) }))}
                  />
                  <span>Respect the community guidelines, personal space, and zero harassment policy.</span>
                </label>
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={form.agree_rules_2}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, agree_rules_2: Boolean(checked) }))}
                  />
                  <span>Understand that violations can result in removal from the platform.</span>
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create User"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </EditorLayout>
  );
}
