import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditorLayout from "@/components/layouts/EditorLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminPost,
  getAdminPostDetail,
  updateAdminPost,
} from "@/api/admin";
import { uploadPublicFile } from "@/api/admin";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

const POST_STATUSES = ["publish", "draft", "pending", "future", "private"] as const;

const defaultForm = {
  title: "",
  slug: "",
  status: "draft",
  excerpt: "",
  content: "",
  categories: "",
  tags: "",
  feature_image: "",
  feature_image_id: undefined as number | undefined,
};

const normalizeList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function EditorPostForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [featureUploading, setFeatureUploading] = useState(false);
  const featureInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing || !id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getAdminPostDetail(Number(id));
        if (!res?.success || !res.data) {
          toast.error(res?.message || "Unable to load post");
          return;
        }

        const data = res.data;
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          status: data.status || "draft",
          excerpt: data.excerpt || "",
          content: data.content || "",
          categories: Array.isArray(data.categories)
            ? data.categories.map((cat: any) => cat?.name).filter(Boolean).join(", ")
            : "",
          tags: Array.isArray(data.tags)
            ? data.tags.map((tag: any) => tag?.name).filter(Boolean).join(", ")
            : "",
          feature_image: data.featured_image || "",
          feature_image_id: data.featured_image_id || undefined,
        });
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, isEditing]);

  const headerTitle = useMemo(() => (isEditing ? "Edit Post" : "Add Post"), [isEditing]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload: Record<string, unknown> = {
      title: form.title,
      slug: form.slug || undefined,
      status: form.status,
      excerpt: form.excerpt,
      content: form.content,
      feature_image: form.feature_image,
      feature_image_id: form.feature_image_id,
      categories: normalizeList(form.categories),
      tags: normalizeList(form.tags),
    };

    try {
      setSaving(true);
      const res = isEditing
        ? await updateAdminPost(Number(id), payload)
        : await createAdminPost(payload);

      if (res?.success) {
        toast.success(isEditing ? "Post updated" : "Post created");
        navigate("/editor/posts");
      } else {
        toast.error(res?.message || "Unable to save post");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureUpload = async (file?: File | null) => {
    if (!file) return;
    try {
      setFeatureUploading(true);
      const res = await uploadPublicFile(file);
      if (res?.success && res.url) {
        setForm((prev) => ({ ...prev, feature_image: res.url }));
        toast.success("Image uploaded");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setFeatureUploading(false);
    }
  };

  return (
    <EditorLayout title={headerTitle}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Update Post" : "Post Details"}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {loading ? (
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-8">
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="auto-generated from title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {POST_STATUSES.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short summary used across listings"
                  />
                </div>
              </section>

              <section className="space-y-2">
                <Label htmlFor="content">Content (HTML supported)</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Main article body"
                />
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categories">Categories</Label>
                  <Input
                    id="categories"
                    name="categories"
                    value={form.categories}
                    onChange={handleChange}
                    placeholder="Comma separated"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    placeholder="Comma separated"
                  />
                </div>
              </section>

              <section className="space-y-2">
                <Label>Feature Image URL</Label>
                <div className="space-y-2">
                  <Input
                    id="feature_image"
                    name="feature_image"
                    value={form.feature_image}
                    onChange={handleChange}
                    placeholder="https://example.com/cover.jpg"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      ref={featureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleFeatureUpload(event.target.files?.[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => featureInputRef.current?.click()}
                      disabled={featureUploading}
                    >
                      {featureUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload
                        </>
                      )}
                    </Button>
                  </div>
                  {form.feature_image && (
                    <div className="rounded border p-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Preview
                      </p>
                      <img
                        src={form.feature_image}
                        alt="Feature"
                        className="max-h-48 w-full rounded object-cover"
                      />
                    </div>
                  )}
                </div>
              </section>
            </CardContent>
          )}
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Post"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </EditorLayout>
  );
}
