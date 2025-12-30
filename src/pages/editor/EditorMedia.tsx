import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditorLayout from "@/components/layouts/EditorLayout";
import { getAdminMedia } from "@/api/admin";
import { toast } from "sonner";

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

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await getAdminMedia();
      if (res?.success) {
        setMedia(res.data || []);
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

  return (
    <EditorLayout title="Media Gallery">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Media Library</CardTitle>
          <Button variant="outline" onClick={loadMedia} disabled={loading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : media.length === 0 ? (
            <p className="text-muted-foreground">No media items found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="block border rounded-lg overflow-hidden hover:shadow focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <div className="p-3 text-left">
                    <p className="text-sm font-medium truncate">{item.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title || "Media Preview"}</DialogTitle>
            <DialogDescription>Click outside or use the close button to dismiss.</DialogDescription>
          </DialogHeader>
          {previewItem && previewItem.mime.startsWith("image/") && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-muted">
                <img src={previewItem.url} alt={previewItem.title} className="w-full object-contain" />
              </div>
              <a href={previewItem.url} target="_blank" rel="noreferrer" className="text-primary text-sm underline">
                Open original
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </EditorLayout>
  );
}
