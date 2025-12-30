import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import EditorLayout from "@/components/layouts/EditorLayout";
import { createAdminEvent } from "@/api/admin";
import { toast } from "sonner";

const initialState = {
  title: "",
  description: "",
  status: "publish",
  date: "",
  time: "",
  venue: "",
  address: "",
  price: "",
};

export default function EditorEventForm() {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      setSaving(true);
      const res = await createAdminEvent(form);
      if (res?.success) {
        toast.success("Event created");
        setForm(initialState);
        navigate("/editor/events");
      } else {
        toast.error(res?.message || "Failed to create event");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditorLayout title="Add Event">
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" value={form.date} onChange={handleChange} placeholder="2025-01-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" name="time" value={form.time} onChange={handleChange} placeholder="9:00 PM" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" name="venue" value={form.venue} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" value={form.price} onChange={handleChange} placeholder="PKR 5000" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Event"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </EditorLayout>
  );
}
