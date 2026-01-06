import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import EditorLayout from "@/components/layouts/EditorLayout";
import { createAdminEvent, getAdminEventDetail, updateAdminEvent, uploadPublicFile } from "@/api/admin";
import { toast } from "sonner";
import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";

type EventFormState = {
  title: string;
  description: string;
  status: string;
  event_date: string;
  start_time: string;
  end_time: string;
  time: string;
  event_venue: string;
  address: string;
  event_price: string;
  feature_image: string;
  attending_peoples: string;
  event_duration: string;
  event_type: string;
  capacity_limit: string;
  organizer_name: string;
  organizer_tagline: string;
  organizer_avatar: string;
  publish_date: string;
};

type LineupForm = {
  name: string;
  content: string;
  profile_picture: string;
};

type ImportantInfoForm = {
  name: string;
  content: string;
};

const statusOptions = [
  { value: "publish", label: "Publish" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
];

const eventTypeOptions = ["Indoor", "Outdoor"];
const timeOptions = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const initialState: EventFormState = {
  title: "",
  description: "",
  status: "publish",
  event_date: "",
  start_time: "",
  end_time: "",
  time: "",
  event_venue: "",
  address: "",
  event_price: "",
  feature_image: "",
  attending_peoples: "",
  event_duration: "",
  event_type: "Indoor",
  capacity_limit: "",
  organizer_name: "",
  organizer_tagline: "",
  organizer_avatar: "",
  publish_date: "",
};

const emptyLineup = (): LineupForm => ({ name: "", content: "", profile_picture: "" });
const emptyImportantInfo = (): ImportantInfoForm => ({ name: "", content: "" });

const formatDateForMeta = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replaceAll("-", "");
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const formatDateDisplay = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const formatTimeLabel = (value: string) => {
  if (!value) return "";
  const [hoursStr, minutesStr] = value.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr ?? 0);
  if (Number.isNaN(hours)) {
    return value;
  }
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
};

const buildTimeRange = (timeField: string, start: string, end: string) => {
  if (timeField.trim()) return timeField.trim();
  const startLabel = formatTimeLabel(start);
  const endLabel = formatTimeLabel(end);
  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  return startLabel || endLabel || "";
};

export default function EditorEventForm() {
  const [form, setForm] = useState(initialState);
  const [lineups, setLineups] = useState<LineupForm[]>([emptyLineup()]);
  const [importantInfo, setImportantInfo] = useState<ImportantInfoForm[]>([emptyImportantInfo()]);
  const [sliderImages, setSliderImages] = useState<string[]>([""]);
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [featureUploading, setFeatureUploading] = useState(false);
  const [sliderUploadingIndex, setSliderUploadingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const featureInputRef = useRef<HTMLInputElement | null>(null);
  const sliderFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const eventId = id ? Number(id) : null;
  const isEditing = Boolean(eventId);

  const descriptionEditorConfig = useMemo(
    () => ({
      readonly: saving,
      height: 320,
      placeholder: "Describe the event details...",
      uploader: { insertImageAsBase64URI: true },
       // ✅ Default text color black
    style: {
      // color: "#000000",
      backgroundColor: "#141414"
    },
    }),
    [saving],
  );

  const handleDescriptionChange = (value: string) => {
    setForm((prev) => ({ ...prev, description: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const time24ToDisplay = (value: string) => {
    if (!value) return "";
    const [hoursStr, minutesStr = "00"] = value.split(":");
    let hours = Number(hoursStr);
    if (Number.isNaN(hours)) return value;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutesStr.padStart(2, "0")} ${period}`;
  };

  const updateLineupField = (index: number, field: keyof LineupForm, value: string) => {
    setLineups((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const updateInfoField = (index: number, field: keyof ImportantInfoForm, value: string) => {
    setImportantInfo((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const updateSliderImage = (index: number, value: string) => {
    setSliderImages((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const resetForm = () => {
    setForm(initialState);
    setLineups([emptyLineup()]);
    setImportantInfo([emptyImportantInfo()]);
    setSliderImages([""]);
    setEventDate(undefined);
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) return;
    setEventDate(date);
    setForm((prev) => ({ ...prev, event_date: date.toISOString() }));
  };

  const timeDisplayTo24h = (label: string) => {
    if (!label) return "";
    const [time, modifier] = label.split(" ");
    if (!time || !modifier) return label;
    let [hours, minutes] = time.split(":");
    let hrs = parseInt(hours, 10);
    if (modifier === "PM" && hrs !== 12) hrs += 12;
    if (modifier === "AM" && hrs === 12) hrs = 0;
    return `${String(hrs).padStart(2, "0")}:${minutes}`;
  };

  const handleFeatureUpload = async (file?: File) => {
    if (!file) return;
    try {
      setFeatureUploading(true);
      const res = await uploadPublicFile(file);
      if (!res?.success || !res?.url) {
        toast.error(res?.message || "Upload failed");
        return;
      }
      setForm((prev) => ({ ...prev, feature_image: res.url }));
      toast.success("Feature image uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload file");
    } finally {
      setFeatureUploading(false);
      if (featureInputRef.current) {
        featureInputRef.current.value = "";
      }
    }
  };

  const handleSliderUpload = async (index: number, file?: File) => {
    if (!file) return;
    try {
      setSliderUploadingIndex(index);
      const res = await uploadPublicFile(file);
      if (!res?.success || !res?.url) {
        toast.error(res?.message || "Upload failed");
        return;
      }
      updateSliderImage(index, res.url);
      toast.success("Slider image uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload file");
    } finally {
      setSliderUploadingIndex(null);
      const input = sliderFileRefs.current[index];
      if (input) input.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.event_date) {
      toast.error("Event date is required");
      return;
    }

    const sliderPayload = sliderImages.map((url) => url.trim()).filter(Boolean);
    const lineupsPayload = lineups
      .map((lineup, index) => ({
        id: index + 1,
        name: lineup.name.trim(),
        content: lineup.content.trim(),
        profile_picture: lineup.profile_picture.trim(),
      }))
      .filter((item) => item.name || item.content || item.profile_picture);

    const infoPayload = importantInfo
      .map((info) => ({ name: info.name.trim(), content: info.content.trim() }))
      .filter((item) => item.name || item.content);

    const formattedDate = formatDateDisplay(form.event_date);
    const eventDateKey = formatDateForMeta(form.event_date);
    const timeRange = buildTimeRange(form.time, form.start_time, form.end_time);

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      date: formattedDate,
      event_date: eventDateKey,
      start_event_time: form.start_time,
      end_event_time: form.end_time,
      time: timeRange,
      event_venue: form.event_venue,
      address: form.address,
      event_price: form.event_price,
      feature_image: form.feature_image.trim(),
      slider_images: sliderPayload,
      lineups: lineupsPayload,
      important_information: infoPayload,
      attending_peoples: form.attending_peoples,
      event_duration: form.event_duration,
      event_type: form.event_type,
      capacity_limit: form.capacity_limit ? Number(form.capacity_limit) : undefined,
      organizer_name: form.organizer_name,
      organizer_tagline: form.organizer_tagline,
      organizer_avatar: form.organizer_avatar,
      publish_date: form.publish_date,
    };

    try {
      setSaving(true);
      const response = isEditing
        ? await updateAdminEvent(eventId!, payload)
        : await createAdminEvent(payload);
      const res = response;
      if (res?.success) {
        toast.success(isEditing ? "Event updated" : "Event created");
        if (isEditing) {
          navigate("/editor/events");
        } else {
          resetForm();
          navigate("/editor/events");
        }
      } else {
        toast.error(res?.message || "Failed to create event");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const loadEvent = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await getAdminEventDetail(eventId);
      if (!res?.success || !res?.data) {
        toast.error(res?.message || "Failed to load event");
        navigate(-1);
        return;
      }
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        title: data.title || "",
        description: data.description || "",
        status: data.status || "publish",
        event_date: data.event_date || data.date || "",
        start_time: data.start_event_time || "",
        end_time: data.end_event_time || "",
        time: data.time || "",
        event_venue: data.event_venue || "",
        address: data.address || "",
        event_price: data.event_price || "",
        feature_image: data.feature_image || "",
        attending_peoples: data.attending_peoples || "",
        event_duration: data.event_duration || "",
        event_type: data.event_type || "Indoor",
        capacity_limit: data.capacity_limit || "",
        organizer_name: data.organizer_name || "",
        organizer_tagline: data.organizer_tagline || "",
        organizer_avatar: data.organizer_avatar || "",
        publish_date: data.publish_date || "",
      }));
      if (data.event_date) {
        const parsed = new Date(data.event_date.length === 8 ? `${data.event_date.slice(0, 4)}-${data.event_date.slice(4, 6)}-${data.event_date.slice(6)}` : data.event_date);
        if (!isNaN(parsed.getTime())) {
          setEventDate(parsed);
        }
      }
      setLineups(Array.isArray(data.lineups) && data.lineups.length ? data.lineups : [emptyLineup()]);
      setImportantInfo(Array.isArray(data.important_information) && data.important_information.length ? data.important_information : [emptyImportantInfo()]);
      const sliderUrls = Array.isArray(data.slider_image_urls) && data.slider_image_urls.length ? data.slider_image_urls : [""];
      setSliderImages(sliderUrls);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load event");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      loadEvent();
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const headerTitle = useMemo(() => (isEditing ? "Edit Event" : "Add Event"), [isEditing]);

  return (
    <EditorLayout title={headerTitle}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Update Event" : "Event Details"}</CardTitle>
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
              <section className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div>
                  <JoditEditor
                    value={form.description}
                    config={descriptionEditorConfig}
                    onChange={handleDescriptionChange}
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventDate && !form.event_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventDate || form.event_date
                        ? format(eventDate ?? new Date(form.event_date), "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={eventDate} onSelect={handleDateSelect} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time Label</Label>
                <Input id="time" name="time" value={form.time} onChange={handleChange} placeholder="2:00 AM - 4:00 AM" />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={time24ToDisplay(form.start_time)}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, start_time: timeDisplayTo24h(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={time24ToDisplay(form.end_time)}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, end_time: timeDisplayTo24h(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event_venue">Event Venue</Label>
                <Input id="event_venue" name="event_venue" value={form.event_venue} onChange={handleChange} placeholder="Brooklyn Warehouse, NY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_price">Ticket Event Price (PKR)</Label>
                <Input id="event_price" name="event_price" value={form.event_price} onChange={handleChange} placeholder="6899" />
              </div>
              <div className="space-y-2">
                <Label>Feature Image</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="feature_image"
                    name="feature_image"
                    value={form.feature_image}
                    onChange={handleChange}
                    placeholder="https://example.com/banner.jpg"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      ref={featureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFeatureUpload(e.target.files?.[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => featureInputRef.current?.click()}
                      disabled={featureUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" /> {featureUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Slider Images</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setSliderImages((prev) => [...prev, ""])}>
                  Add Image
                </Button>
              </div>
              <div className="space-y-3">
                {sliderImages.map((image, index) => (
                  <div key={`slider-${index}`} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Input value={image} onChange={(e) => updateSliderImage(index, e.target.value)} placeholder="https://example.com/slider.jpg" />
                      {sliderImages.length > 1 && (
                        <Button type="button" variant="ghost" onClick={() => setSliderImages((prev) => prev.filter((_, i) => i !== index))}>
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={(el) => {
                          sliderFileRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSliderUpload(index, e.target.files?.[0])}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => sliderFileRefs.current[index]?.click()}
                        disabled={sliderUploadingIndex === index}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {sliderUploadingIndex === index ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attending_peoples">Attending People Label</Label>
                <Input id="attending_peoples" name="attending_peoples" value={form.attending_peoples} onChange={handleChange} placeholder="253 people attending" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity_limit">Capacity Limit</Label>
                <Input id="capacity_limit" name="capacity_limit" type="number" value={form.capacity_limit} onChange={handleChange} placeholder="253" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_duration">Event Duration</Label>
                <Input id="event_duration" name="event_duration" value={form.event_duration} onChange={handleChange} placeholder="7 Hours" />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={form.event_type} onValueChange={(value) => setForm((prev) => ({ ...prev, event_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="organizer_name">Organizer Name</Label>
                <Input id="organizer_name" name="organizer_name" value={form.organizer_name} onChange={handleChange} />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="organizer_tagline">Organizer Tagline</Label>
                <Input id="organizer_tagline" name="organizer_tagline" value={form.organizer_tagline} onChange={handleChange} />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="organizer_avatar">Organizer Avatar URL</Label>
                <Input id="organizer_avatar" name="organizer_avatar" value={form.organizer_avatar} onChange={handleChange} />
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Important Information</h3>
                  <p className="text-sm text-muted-foreground">Add bullet points that appear on event detail pages.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setImportantInfo((prev) => [...prev, emptyImportantInfo()])}>
                  Add Item
                </Button>
              </div>
              <div className="space-y-4">
                {importantInfo.map((info, index) => (
                  <div key={`info-${index}`} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label>Information #{index + 1}</Label>
                      {importantInfo.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setImportantInfo((prev) => prev.filter((_, i) => i !== index))}>
                          Remove
                        </Button>
                      )}
                    </div>
                    <Input placeholder="Name" value={info.name} onChange={(e) => updateInfoField(index, "name", e.target.value)} />
                    <Textarea placeholder="Content" value={info.content} onChange={(e) => updateInfoField(index, "content", e.target.value)} rows={2} />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">Lineups</h3>
                  <p className="text-sm text-muted-foreground">Add performers with their role and avatar.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setLineups((prev) => [...prev, emptyLineup()])}>
                  Add Performer
                </Button>
              </div>
              <div className="space-y-4">
                {lineups.map((lineup, index) => (
                  <div key={`lineup-${index}`} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label>Performer #{index + 1}</Label>
                      {lineups.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setLineups((prev) => prev.filter((_, i) => i !== index))}>
                          Remove
                        </Button>
                      )}
                    </div>
                    <Input placeholder="Name" value={lineup.name} onChange={(e) => updateLineupField(index, "name", e.target.value)} />
                    <Input placeholder="Role / Content" value={lineup.content} onChange={(e) => updateLineupField(index, "content", e.target.value)} />
                    <Input placeholder="Profile Picture URL" value={lineup.profile_picture} onChange={(e) => updateLineupField(index, "profile_picture", e.target.value)} />
                  </div>
                ))}
              </div>
            </section>

              <section className="space-y-2">
                <Label htmlFor="publish_date">Publish Date (optional)</Label>
                <Input id="publish_date" name="publish_date" type="datetime-local" value={form.publish_date} onChange={handleChange} />
              </section>
            </CardContent>
          )}
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {saving ? "Saving..." : isEditing ? "Update Event" : "Create Event"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </EditorLayout>
  );
}
