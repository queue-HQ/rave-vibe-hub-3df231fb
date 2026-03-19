import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getAdminEvents,
  getAdminBookingFormConfig,
  saveAdminBookingFormConfig,
  type BookingBuilderField,
  type BookingBuilderSection,
  type BookingFormConfig,
} from "@/api/admin";
import { ArrowUp, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";

const FIELD_TYPES: BookingBuilderField["type"][] = ["text", "email", "number", "radio", "checkbox", "select", "textarea", "file"];
const PROTECTED_SECTION_KEY = "personal_information";
const PROTECTED_FIELD_KEYS = ["full_name", "email"];

const createDefaultField = (): BookingBuilderField => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  key: "new_field",
  label: "New Field",
  type: "text",
  required: false,
  enabled: true,
  placeholder: "",
  help_text: "",
  options: [],
  validation: {},
});

const normalizeOptionsText = (text: string) => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelRaw, valueRaw] = line.includes("|") ? line.split("|") : [line, ""];
      const label = labelRaw.trim();
      const value = (valueRaw || label).trim();
      return { label, value };
    });
};

const optionsToText = (options: { label: string; value: string }[] = []) => {
  return options.map((opt) => `${opt.label}|${opt.value}`).join("\n");
};

type EventOption = {
  id: number;
  title: string;
  event_date?: string;
};

export default function EditorBookingFormBuilder() {
  const [config, setConfig] = useState<BookingFormConfig | null>(null);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [openFields, setOpenFields] = useState<string[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sections = useMemo(() => config?.sections || [], [config]);
  const selectedEventNumeric = useMemo(() => {
    const parsed = Number(selectedEventId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const res = await getAdminEvents({ page: 1, per_page: 100, status: "publish" });
      const events = Array.isArray(res?.data) ? res.data : [];
      setEventOptions(
        events.map((item: any) => ({
          id: Number(item.id),
          title: String(item.title || `Event ${item.id}`),
          event_date: item.event_date ? String(item.event_date) : "",
        })),
      );
    } catch {
      setEventOptions([]);
    }
  };

  const loadConfig = async (eventId: number | null = null) => {
    try {
      setLoading(true);
      const res = await getAdminBookingFormConfig(eventId);
      if (res?.success && res.data) {
        setConfig(res.data);
        setOpenSections([]);
        setOpenFields([]);
      } else {
        toast.error(res?.message || "Failed to load booking form config");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load booking form config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadEvents();
      await loadConfig(null);
    })();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const updateSection = (sectionId: string, updater: (section: BookingBuilderSection) => BookingBuilderSection) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
      };
    });
  };

  const updateField = (
    sectionId: string,
    fieldId: string,
    updater: (field: BookingBuilderField) => BookingBuilderField,
  ) => {
    updateSection(sectionId, (section) => ({
      ...section,
      fields: section.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));
  };

  const addField = (sectionId: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      fields: [...section.fields, createDefaultField()],
    }));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    updateSection(sectionId, (section) => ({
      ...section,
      fields: section.fields.filter((field) => {
        const isProtected = section.key === PROTECTED_SECTION_KEY && PROTECTED_FIELD_KEYS.includes(field.key);
        if (isProtected && field.id === fieldId) return true;
        return field.id !== fieldId;
      }),
    }));
  };

  const addSection = () => {
    setConfig((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.sections.length + 1;
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: `section_${Date.now()}`,
            key: `custom_section_${nextIndex}`,
            title: `Custom Section ${nextIndex}`,
            description: "",
            enabled: true,
            fields: [createDefaultField()],
          },
        ],
      };
    });
  };

  const removeSection = (sectionId: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.filter((section) => {
          if (section.id !== sectionId) return true;
          return section.key === PROTECTED_SECTION_KEY;
        }),
      };
    });
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const res = await saveAdminBookingFormConfig(config, selectedEventNumeric);
      if (res?.success && res.data) {
        setConfig(res.data);
        toast.success("Booking form config saved");
      } else {
        toast.error(res?.message || "Failed to save booking form config");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save booking form config");
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionOpen = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    );
  };

  const toggleFieldOpen = (compositeId: string) => {
    setOpenFields((prev) =>
      prev.includes(compositeId) ? prev.filter((id) => id !== compositeId) : [...prev, compositeId],
    );
  };

  if (loading || !config) {
    return (
      <EditorLayout title="Booking Form Builder">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading configuration...
        </div>
      </EditorLayout>
    );
  }

  return (
    <EditorLayout title="Booking Form Builder">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Checkout Form Settings</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadConfig(selectedEventNumeric)} disabled={loading || saving}>
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save & Publish"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <Label className="mb-2 block">Event Scope</Label>
            <div className="grid gap-3 md:max-w-md">
              <Select
                value={selectedEventId}
                onValueChange={async (value) => {
                  setSelectedEventId(value);
                  const parsed = Number(value);
                  const eventId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
                  await loadConfig(eventId);
                }}
                disabled={loading || saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {eventOptions.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      {event.title}{event.event_date ? ` (${event.event_date})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Choose a specific event to customize fields for it, or select All Events to apply common fields everywhere.
              </span>
            </div>
          </div>

          {sections.map((section) => {
            const isSectionOpen = openSections.includes(section.id);
            return (
            <Card key={section.id}>
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    onClick={() => toggleSectionOpen(section.id)}
                  >
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isSectionOpen ? "rotate-180" : ""}`} />
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{section.title || section.key}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">Section key: {section.key}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    {section.key === PROTECTED_SECTION_KEY ? (
                      <span className="text-xs text-muted-foreground">Protected</span>
                    ) : null}
                    {section.key !== PROTECTED_SECTION_KEY ? (
                      <Button variant="destructive" size="sm" onClick={() => removeSection(section.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Remove
                      </Button>
                    ) : null}
                  </div>
                </div>

                {isSectionOpen ? (
                  <>
                  {section.key === PROTECTED_SECTION_KEY ? (
                    <p className="text-xs text-muted-foreground">
                      This section is protected and cannot be removed.
                    </p>
                  ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input value={section.title} onChange={(e) => updateSection(section.id, (s) => ({ ...s, title: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Section Key</Label>
                    <Input
                      value={section.key}
                      onChange={(e) => updateSection(section.id, (s) => ({ ...s, key: e.target.value }))}
                      disabled={section.key === PROTECTED_SECTION_KEY}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{section.key === "payment_information" ? "Payment / Bank Details" : "Section Description"}</Label>
                  <Textarea
                    rows={section.key === "payment_information" ? 6 : 2}
                    value={section.description || ""}
                    onChange={(e) => updateSection(section.id, (s) => ({ ...s, description: e.target.value }))}
                    placeholder={
                      section.key === "payment_information"
                        ? "Bank Details:\nAccount Title: ...\nBank: ...\nAccount Number: ..."
                        : ""
                    }
                  />
                  {section.key === "payment_information" ? (
                    <p className="text-xs text-muted-foreground">
                      Add multiline details here. This will be shown to users exactly as written on checkout.
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={section.enabled}
                    onCheckedChange={(checked) => updateSection(section.id, (s) => ({ ...s, enabled: Boolean(checked) }))}
                    disabled={section.key === PROTECTED_SECTION_KEY}
                  />
                  <span className="text-sm">Section Visible</span>
                </div>
                </>
                ) : null}
              </CardHeader>
              {isSectionOpen ? (
                <CardContent className="space-y-4">
                {section.fields.map((field) => {
                  const fieldCompositeId = `${section.id}.${field.id}`;
                  const isFieldOpen = openFields.includes(fieldCompositeId);
                  return (
                  <div key={field.id} className="rounded-lg border p-4">
                    {section.key === PROTECTED_SECTION_KEY && PROTECTED_FIELD_KEYS.includes(field.key) ? (
                      <p className="mb-2 text-xs text-muted-foreground">This field is protected and cannot be removed.</p>
                    ) : null}
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        onClick={() => toggleFieldOpen(fieldCompositeId)}
                      >
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isFieldOpen ? "rotate-180" : ""}`} />
                        <p className="font-medium truncate">{field.label || field.key}</p>
                      </button>
                      <div>
                        {!(section.key === PROTECTED_SECTION_KEY && PROTECTED_FIELD_KEYS.includes(field.key)) ? (
                          <Button variant="ghost" size="sm" onClick={() => removeField(section.id, field.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Remove Field
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {isFieldOpen ? (
                    <>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Field Label</Label>
                        <Input value={field.label} onChange={(e) => updateField(section.id, field.id, (f) => ({ ...f, label: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Field Key</Label>
                        <Input value={field.key} onChange={(e) => updateField(section.id, field.id, (f) => ({ ...f, key: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: BookingBuilderField["type"]) => updateField(section.id, field.id, (f) => ({ ...f, type: value }))}
                          disabled={section.key === PROTECTED_SECTION_KEY && PROTECTED_FIELD_KEYS.includes(field.key)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Placeholder</Label>
                        <Input value={field.placeholder || ""} onChange={(e) => updateField(section.id, field.id, (f) => ({ ...f, placeholder: e.target.value }))} />
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={field.enabled}
                          onCheckedChange={(checked) => updateField(section.id, field.id, (f) => ({ ...f, enabled: Boolean(checked) }))}
                          disabled={section.key === PROTECTED_SECTION_KEY && PROTECTED_FIELD_KEYS.includes(field.key)}
                        />
                        <span className="text-sm">Field Visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(section.id, field.id, (f) => ({ ...f, required: Boolean(checked) }))}
                          disabled={section.key === PROTECTED_SECTION_KEY && PROTECTED_FIELD_KEYS.includes(field.key)}
                        />
                        <span className="text-sm">Required</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label>Help Text</Label>
                      <Textarea rows={2} value={field.help_text || ""} onChange={(e) => updateField(section.id, field.id, (f) => ({ ...f, help_text: e.target.value }))} />
                    </div>
                    {(field.type === "radio" || field.type === "select" || field.type === "checkbox") && (
                      <div className="mt-3 space-y-2">
                        <Label>Options (one per line: Label|value)</Label>
                        <Textarea
                          rows={4}
                          value={optionsToText(field.options || [])}
                          onChange={(e) => {
                            const parsed = normalizeOptionsText(e.target.value);
                            updateField(section.id, field.id, (f) => ({ ...f, options: parsed }));
                          }}
                        />
                      </div>
                    )}
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Min (number)</Label>
                        <Input
                          type="number"
                          value={field.validation?.min ?? ""}
                          onChange={(e) =>
                            updateField(section.id, field.id, (f) => ({
                              ...f,
                              validation: { ...(f.validation || {}), min: e.target.value === "" ? undefined : Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max (number)</Label>
                        <Input
                          type="number"
                          value={field.validation?.max ?? ""}
                          onChange={(e) =>
                            updateField(section.id, field.id, (f) => ({
                              ...f,
                              validation: { ...(f.validation || {}), max: e.target.value === "" ? undefined : Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Length</Label>
                        <Input
                          type="number"
                          value={field.validation?.minLength ?? ""}
                          onChange={(e) =>
                            updateField(section.id, field.id, (f) => ({
                              ...f,
                              validation: { ...(f.validation || {}), minLength: e.target.value === "" ? undefined : Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Length</Label>
                        <Input
                          type="number"
                          value={field.validation?.maxLength ?? ""}
                          onChange={(e) =>
                            updateField(section.id, field.id, (f) => ({
                              ...f,
                              validation: { ...(f.validation || {}), maxLength: e.target.value === "" ? undefined : Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label>Regex Pattern</Label>
                      <Input
                        value={field.validation?.pattern || ""}
                        onChange={(e) =>
                          updateField(section.id, field.id, (f) => ({
                            ...f,
                            validation: { ...(f.validation || {}), pattern: e.target.value || undefined },
                          }))
                        }
                        placeholder="e.g. ^[A-Za-z ]+$"
                      />
                    </div>
                    </>
                    ) : null}
                  </div>
                );})}

                <Button type="button" variant="outline" onClick={() => addField(section.id)}>
                  <Plus className="mr-1 h-4 w-4" /> Add Field
                </Button>
              </CardContent>
              ) : null}
            </Card>
          );})}

          <Button variant="outline" onClick={addSection}>
            <Plus className="mr-1 h-4 w-4" /> Add Section
          </Button>
        </CardContent>
      </Card>
      {showScrollTop ? (
        <Button
          type="button"
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      ) : null}
    </EditorLayout>
  );
}
