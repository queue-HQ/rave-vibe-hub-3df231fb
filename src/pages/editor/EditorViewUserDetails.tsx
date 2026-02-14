import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getAdminUserDetail, updateAdminUser } from "@/api/admin";
import { apiUrl } from "@/lib/apiURL";

const vibeDetectorOptions = ["Yes", "No", "I plead the fifth"];
const genderOptions = ["male", "female", "other"];
const hearAboutOptions = ["instagram", "facebook", "friends", "events", "other"];
const roleOptions = ["subscriber", "editor", "administrator"];
const statusOptions = ["approved", "pending", "rejected"];
const MAX_SCREENSHOTS = 2;

interface FormState {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  display_name: string;
  role: string;
  account_status: string;
  phone: string;
  address: string;
  bio: string;
  gender: string;
  instagram: string;
  profile_picture: string;
  cnic_picture: string;
  age: string;
  rave_resume: string;
  why_join: string;
  vibe: string;
  artists: string;
  vibe_detector: string[];
  kicked: string;
  hear_about: string;
  events: string;
  agree_rules_1: boolean;
  agree_rules_2: boolean;
  insta_screenshot: string[];
}

const emptyState: FormState = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  display_name: "",
  role: "subscriber",
  account_status: "pending",
  phone: "",
  address: "",
  bio: "",
  gender: "",
  instagram: "",
  profile_picture: "",
  cnic_picture: "",
  age: "",
  rave_resume: "",
  why_join: "",
  vibe: "",
  artists: "",
  vibe_detector: [],
  kicked: "",
  hear_about: "",
  events: "",
  agree_rules_1: false,
  agree_rules_2: false,
  insta_screenshot: [],
};

export default function EditorViewUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const [cnicPictureFile, setCnicPictureFile] = useState<File | null>(null);
  const [cnicPicturePreview, setCnicPicturePreview] = useState<string>("");
  const [newScreenshots, setNewScreenshots] = useState<File[]>([]);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([]);
  const [newScreenshotPreviews, setNewScreenshotPreviews] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const loadUser = async () => {
      try {
        setLoading(true);
        const res = await getAdminUserDetail(Number(id));
        if (!mounted) return;
        if (!res?.success) {
          toast.error(res?.message || "Failed to load user");
          navigate("/editor/users");
          return;
        }
        const data = res.data;
        const meta = data.meta || {};
        const screenshots = Array.isArray(meta.insta_screenshot)
          ? meta.insta_screenshot.filter((url: unknown) => typeof url === "string")
          : typeof meta.insta_screenshot === "string" && meta.insta_screenshot.trim()
            ? [meta.insta_screenshot.trim()]
            : [];

        setForm({
          email: data.email,
          username: data.username,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          display_name: data.display_name || "",
          role: data.role || "subscriber",
          account_status: data.account_status || "pending",
          phone: meta.phone || "",
          address: meta.address || "",
          bio: meta.bio || "",
          gender: meta.gender || "",
          instagram: meta.instagram || "",
          profile_picture: meta.profile_picture || "",
          cnic_picture: meta.cnic_picture || "",
          age: meta.age ? String(meta.age) : "",
          rave_resume: meta.rave_resume || "",
          why_join: meta.why_join || "",
          vibe: meta.vibe || "",
          artists: meta.artists || "",
          vibe_detector: Array.isArray(meta.vibe_detector) ? meta.vibe_detector : [],
          kicked: meta.kicked || "",
          hear_about: meta.hear_about || "",
          events: meta.events || "",
          agree_rules_1: Boolean(meta.agree_rules_1),
          agree_rules_2: Boolean(meta.agree_rules_2),
          insta_screenshot: screenshots,
        });
        setExistingScreenshots(screenshots);
        setProfilePicturePreview(meta.profile_picture || "");
        setCnicPicturePreview(meta.cnic_picture || "");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load user");
        navigate("/editor/users");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (profilePictureFile) {
      const url = URL.createObjectURL(profilePictureFile);
      setProfilePicturePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setProfilePicturePreview(form.profile_picture || "");
  }, [profilePictureFile, form.profile_picture]);

  useEffect(() => {
    if (cnicPictureFile) {
      const url = URL.createObjectURL(cnicPictureFile);
      setCnicPicturePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setCnicPicturePreview(form.cnic_picture || "");
  }, [cnicPictureFile, form.cnic_picture]);

  useEffect(() => {
    const urls = newScreenshots.map((file) => URL.createObjectURL(file));
    setNewScreenshotPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newScreenshots]);

  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`${apiUrl}/upload`, { method: "POST", body: data });
    if (!res.ok) throw new Error("Failed to upload file");
    const json = await res.json();
    if (!json?.url) throw new Error("Upload did not return a URL");
    return json.url as string;
  };

  const uploadScreenshots = async () => {
    if (!newScreenshots.length) return [];
    const urls = await Promise.all(newScreenshots.map((file) => uploadFile(file)));
    return urls.filter(Boolean);
  };

  const handleChange = (key: keyof FormState, value: string | string[] | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedVibeSet = useMemo(() => new Set(form.vibe_detector), [form.vibe_detector]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      setSaving(true);
      let profilePictureUrl = form.profile_picture;
      if (profilePictureFile) {
        profilePictureUrl = await uploadFile(profilePictureFile);
      }
      let cnicPictureUrl = form.cnic_picture;
      if (cnicPictureFile) {
        cnicPictureUrl = await uploadFile(cnicPictureFile);
      }
      const uploadedScreenshots = await uploadScreenshots();
      const combinedScreenshots = [...existingScreenshots, ...uploadedScreenshots].slice(0, MAX_SCREENSHOTS);

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        display_name: form.display_name,
        role: form.role,
        account_status: form.account_status,
        meta: {
          phone: form.phone,
          address: form.address,
          bio: form.bio,
          gender: form.gender,
          instagram: form.instagram,
          profile_picture: profilePictureUrl,
          cnic_picture: cnicPictureUrl,
          insta_screenshot: combinedScreenshots,
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

      const res = await updateAdminUser(Number(id), payload);
      if (!res?.success) {
        toast.error(res?.message || "Failed to update user");
        return;
      }
      toast.success("User updated");
      setExistingScreenshots(combinedScreenshots);
      setNewScreenshots([]);
      setForm((prev) => ({
        ...prev,
        profile_picture: profilePictureUrl,
        cnic_picture: cnicPictureUrl,
        insta_screenshot: combinedScreenshots,
      }));
    } catch (error: any) {
      toast.error(error?.message || error.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const basicInfoSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={form.email} readOnly disabled />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input value={form.username} readOnly disabled />
      </div>
      <div className="space-y-2">
        <Label>First Name</Label>
        <Input value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Last Name</Label>
        <Input value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Display Name</Label>
        <Input value={form.display_name} onChange={(e) => handleChange("display_name", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Role</Label>
        <Select value={form.role} onValueChange={(value) => handleChange("role", value)}>
          <SelectTrigger>
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
        <Label>Status</Label>
        <Select value={form.account_status} onValueChange={(value) => handleChange("account_status", value)}>
          <SelectTrigger>
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
  );

  const contactSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => handleChange("address", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={form.gender} onValueChange={(value) => handleChange("gender", value)}>
          <SelectTrigger>
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
        <Label>Instagram Handle</Label>
        <Input value={form.instagram} onChange={(e) => handleChange("instagram", e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Bio</Label>
        <Textarea value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} rows={3} />
      </div>
    </div>
  );

  const lifestyleSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Age</Label>
        <Input type="number" value={form.age} onChange={(e) => handleChange("age", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>How did you hear about us?</Label>
        <Select value={form.hear_about} onValueChange={(value) => handleChange("hear_about", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {hearAboutOptions.map((option) => (
              <SelectItem key={option} value={option} className="capitalize">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Rave Resume</Label>
        <Textarea value={form.rave_resume} onChange={(e) => handleChange("rave_resume", e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Why Join?</Label>
        <Textarea value={form.why_join} onChange={(e) => handleChange("why_join", e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Ideal Night Out Vibe</Label>
        <Textarea value={form.vibe} onChange={(e) => handleChange("vibe", e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Favourite Artists / DJs</Label>
        <Textarea value={form.artists} onChange={(e) => handleChange("artists", e.target.value)} rows={3} />
      </div>
    </div>
  );

  const vibeDetectorSection = (
    <div className="space-y-2">
      <Label>Weird Vibe Detector™</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {vibeDetectorOptions.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <Checkbox
              checked={selectedVibeSet.has(option)}
              onCheckedChange={(checked) =>
                handleChange(
                  "vibe_detector",
                  checked
                    ? [...form.vibe_detector, option]
                    : form.vibe_detector.filter((item) => item !== option),
                )
              }
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const statusSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Kicked out of a party?</Label>
        <Input value={form.kicked} onChange={(e) => handleChange("kicked", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Events Interested In</Label>
        <Textarea value={form.events} onChange={(e) => handleChange("events", e.target.value)} rows={3} />
      </div>
    </div>
  );

  const profileSection = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label>Profile Picture</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setProfilePictureFile(file);
          }}
        />
        {profilePicturePreview && (
          <div className="h-32 w-32 overflow-hidden rounded-lg border">
            <button
              type="button"
              className="h-full w-full cursor-zoom-in"
              onClick={() => setActiveImage(profilePicturePreview)}
            >
              <img src={profilePicturePreview} alt="Profile" className="h-full w-full object-cover" />
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <Label>CNIC Picture</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            setCnicPictureFile(file);
          }}
        />
        {cnicPicturePreview && (
          <div className="h-32 w-48 overflow-hidden rounded-lg border">
            <button
              type="button"
              className="h-full w-full cursor-zoom-in"
              onClick={() => setActiveImage(cnicPicturePreview)}
            >
              <img src={cnicPicturePreview} alt="CNIC" className="h-full w-full object-cover" />
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3 lg:col-span-2">
        <Label>Instagram Screenshots (max {MAX_SCREENSHOTS})</Label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            if (existingScreenshots.length + files.length > MAX_SCREENSHOTS) {
              toast.error(`You can only keep ${MAX_SCREENSHOTS} screenshots total.`);
            }
            setNewScreenshots(files.slice(0, MAX_SCREENSHOTS - existingScreenshots.length));
          }}
        />
        <div className="flex flex-wrap gap-3">
          {existingScreenshots.map((url) => (
            <div key={url} className="relative h-24 w-20 overflow-hidden rounded-md border">
              <button
                type="button"
                className="h-full w-full cursor-zoom-in"
                onClick={() => setActiveImage(url)}
              >
                <img src={url} alt="Screenshot" className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                onClick={() => setExistingScreenshots((prev) => prev.filter((item) => item !== url))}
              >
                ×
              </button>
            </div>
          ))}
          {newScreenshotPreviews.map((preview, idx) => (
            <div key={`${preview}-${idx}`} className="relative h-24 w-20 overflow-hidden rounded-md border">
              <button
                type="button"
                className="h-full w-full cursor-zoom-in"
                onClick={() => setActiveImage(preview)}
              >
                <img src={preview} alt="New screenshot" className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                onClick={() =>
                  setNewScreenshots((prev) => prev.filter((_, fileIdx) => fileIdx !== idx))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && setActiveImage(null)}>
          <DialogContent className="max-w-3xl">
            {activeImage && (
              <div className="max-h-[80vh] overflow-hidden rounded-lg border bg-muted">
                <img src={activeImage} alt="Image preview" className="h-full w-full object-contain" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  const agreementsSection = (
    <div className="space-y-3">
      <Label>Community Agreements</Label>
      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3">
          <Checkbox
            checked={form.agree_rules_1}
            onCheckedChange={(checked) => handleChange("agree_rules_1", Boolean(checked))}
          />
          <span>Respect the community guidelines, personal space, and zero harassment policy.</span>
        </label>
        <label className="flex items-start gap-3">
          <Checkbox
            checked={form.agree_rules_2}
            onCheckedChange={(checked) => handleChange("agree_rules_2", Boolean(checked))}
          />
          <span>Understand that violations can result in removal from the platform.</span>
        </label>
      </div>
    </div>
  );

  const content = (
    <div className="space-y-8">
      {basicInfoSection}
      {contactSection}
      {lifestyleSection}
      {vibeDetectorSection}
      {statusSection}
      {profileSection}
      {agreementsSection}
    </div>
  );

  return (
    <EditorLayout title="User Details">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <span className="text-sm text-muted-foreground">Review and edit user information</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{form.display_name || form.username || "User"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>{loading ? <Skeleton className="h-[480px] w-full" /> : content}</CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </EditorLayout>
  );
}
