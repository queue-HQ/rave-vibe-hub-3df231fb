import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditorLayout from "@/components/layouts/EditorLayout";
import { bulkDeleteAdminMedia, deleteAdminMedia, getAdminMedia, uploadPublicFile } from "@/api/admin";
import { toast } from "sonner";
import { Loader2, Trash2, Upload } from "lucide-react";

interface AdminMediaItem {
  id: number;
  title: string;
  url: string;
  mime: string;
  date: string;
}

export default function EditorMedia() {
  const [media, setMedia] = useState<AdminMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState<AdminMediaItem | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadMedia = async (searchQuery = appliedSearch) => {
    try {
      setLoading(true);
      const res = await getAdminMedia({ search: searchQuery || undefined });
      if (res?.success) {
        setMedia(res.data || []);
        setSelectedIds([]);
      } else {
        toast.error(res?.message || "Failed to load media");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const toggleSelected = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const allSelected = media.length > 0 && selectedIds.length === media.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(media.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = search.trim();
    setAppliedSearch(next);
    loadMedia(next);
  };

  const handleDeleteSingle = async (id: number) => {
    const confirmed = window.confirm("Delete this media item?");
    if (!confirmed) return;
    try {
      setDeletingId(id);
      const res = await deleteAdminMedia(id);
      if (res?.success) {
        toast.success("Media deleted");
        setMedia((prev) => prev.filter((m) => m.id !== id));
        setSelectedIds((prev) => prev.filter((x) => x !== id));
      } else {
        toast.error(res?.message || "Failed to delete media");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) {
      toast.error("Select at least one image");
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedIds.length} selected item(s)?`);
    if (!confirmed) return;

    try {
      setBulkDeleting(true);
      const res = await bulkDeleteAdminMedia(selectedIds);
      if (res?.success) {
        const deleted: number[] = Array.isArray(res.deleted) ? res.deleted : selectedIds;
        toast.success(`Deleted ${deleted.length} item(s)`);
        setMedia((prev) => prev.filter((m) => !deleted.includes(m.id)));
        setSelectedIds([]);
      } else {
        toast.error(res?.message || "Failed to delete media");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete media");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFiles.length) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setUploading(true);
      const uploads = await Promise.all(uploadFiles.map((file) => uploadPublicFile(file)));
      const failed = uploads.filter((result) => !result?.success).length;

      if (failed > 0) {
        toast.warning(`${uploadFiles.length - failed} uploaded, ${failed} failed.`);
      } else {
        toast.success(`${uploadFiles.length} image(s) uploaded successfully.`);
      }

      setUploadFiles([]);
      await loadMedia(appliedSearch);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    if (!url) {
      toast.error("Image URL not found");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Image URL copied");
    } catch {
      const tempInput = document.createElement("input");
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      toast.success("Image URL copied");
    }
  };

  return (
    <EditorLayout title="Media Gallery">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Media Library</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting} className="gap-1 p-0">
                <Trash2 className="h-3 w-3" /> Delete Selected ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" onClick={() => loadMedia()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg border p-3">
            <p className="mb-3 text-sm font-medium">Upload Images</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setUploadFiles(Array.from(event.target.files || []))}
                disabled={uploading}
              />
              <Button type="button" onClick={handleUpload} disabled={uploading || uploadFiles.length === 0} className="gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : `Upload${uploadFiles.length ? ` (${uploadFiles.length})` : ""}`}
              </Button>
            </div>
          </div>

          <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[85%]"
            />
            <Button type="submit">Search</Button>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))} />
              <span className="text-sm text-muted-foreground">Select all</span>
            </div>
          </form>
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8 ].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <p className="text-muted-foreground">No media items found.</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="relative border rounded-lg overflow-hidden hover:shadow focus-within:ring-2 focus-within:ring-ring"
                >
                  <div className="absolute left-2 top-2 z-10 flex items-center gap-2">
                    <div
                      className="rounded bg-background/80 backdrop-blur px-1.5 py-1"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => toggleSelected(item.id, Boolean(checked))}
                      />
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 z-10">
                    <Button
                      type="button"
                      variant="destructive"
                      className="p0-i"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(item.id);
                      }}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => setPreviewItem(item.mime.startsWith("image/") ? item : null)}
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {item.mime.startsWith("image/") ? (
                        <img src={item.url} alt={item.title} className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-xs text-muted-foreground p-4 text-center">
                          {item.mime}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{item.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl w-auto">
          <DialogHeader>
            <DialogTitle>{previewItem?.title || "Media Preview"}</DialogTitle>
            <DialogDescription>Click outside or use the close button to dismiss.</DialogDescription>
          </DialogHeader>
          {previewItem && previewItem.mime.startsWith("image/") && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-muted">
                <img src={previewItem.url} alt={previewItem.title} className="w-full object-contain h-[70vh]" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href={previewItem.url} target="_blank" rel="noreferrer" className="text-primary text-sm underline">
                  Open original
                </a>
                <Button type="button" variant="outline" size="sm" onClick={() => handleCopyUrl(previewItem.url)}>
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </EditorLayout>
  );
}
