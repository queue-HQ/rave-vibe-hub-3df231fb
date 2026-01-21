import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createAdminPartner, uploadPublicFile } from "@/api/admin";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  profile_picture: string;
  password: string;
  confirm_password: string;
};

const initialState: FormState = {
  full_name: "",
  email: "",
  phone: "",
  profile_picture: "",
  password: "",
  confirm_password: "",
};

export default function EditorPartnerForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return (
      form.full_name.trim() &&
      form.email.trim() &&
      form.password.length >= 8 &&
      form.confirm_password.length >= 8
    );
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpload = async (file?: File) => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await uploadPublicFile(file);
      if (!res?.success || !res?.url) {
        toast.error(res?.message || "Upload failed");
        return;
      }
      setForm((prev) => ({ ...prev, profile_picture: res.url! }));
      toast.success("Profile image uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.password || !form.confirm_password) {
      toast.error("Password and confirm password are required");
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Password & Confirm Password do not match");
      return;
    }

    try {
      setSaving(true);
      const res = await createAdminPartner({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        profile_picture: form.profile_picture.trim() || undefined,
        password: form.password,
        confirm_password: form.confirm_password,
      });

      if (res?.success) {
        toast.success(res?.message || "Partner created");
        navigate("/editor/partners");
        return;
      }

      toast.error(res?.message || "Failed to create partner");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create partner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorLayout title="Add Partner">
      <Card>
        <CardHeader>
          <CardTitle>Create Partner Account</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile_picture">Profile Image URL</Label>
                <Input
                  id="profile_picture"
                  name="profile_picture"
                  value={form.profile_picture}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => handleProfileUpload(e.target.files?.[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading || !canSubmit}>
              {saving ? "Creating..." : "Create partner account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </EditorLayout>
  );
}
