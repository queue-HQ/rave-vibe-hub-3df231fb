import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Calendar, Clock, Loader2, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "@/context/EventsContext";
import { useUserProfile } from "@/context/UserProfileContext";
import { eventBooking, getBookingFormConfig } from "@/api/auth";
import { apiUrl } from "@/lib/apiURL";

type FieldType = "text" | "email" | "number" | "radio" | "checkbox" | "select" | "textarea" | "file";

type BookingField = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  help_text?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
};

type BookingSection = {
  id: string;
  key: string;
  title: string;
  description?: string;
  enabled: boolean;
  fields: BookingField[];
};

type BookingFormConfig = {
  settings?: {
    force_couple_for_male?: boolean;
  };
  sections: BookingSection[];
};

type EventTier = {
  id: number;
  name?: string;
  price?: string | number;
  required_persons?: number;
  requiredPersons?: number;
  gender?: string;
};

type AdditionalPerson = {
  name: string;
  email: string;
  phone: string;
  nic: string;
  gender: string;
};

const DEFAULT_FORM_CONFIG: BookingFormConfig = {
  settings: {
    force_couple_for_male: false,
  },
  sections: [
    {
      id: "personal_information",
      key: "personal_information",
      title: "Personal Information",
      description: "Complete your personal details.",
      enabled: true,
      fields: [
        { id: "pi_name", key: "full_name", label: "Full Name", type: "text", required: true, enabled: true, placeholder: "Your full name" },
        { id: "pi_email", key: "email", label: "Email", type: "email", required: true, enabled: true, placeholder: "you@example.com" },
        { id: "pi_phone", key: "phone", label: "Phone Number", type: "text", required: true, enabled: true, placeholder: "+92 300 0000000" },
        { id: "pi_nic", key: "nic", label: "CNIC Number", type: "text", required: true, enabled: true, placeholder: "xxxx-xxxxxxx-x" },
        { id: "pi_car", key: "carNumber", label: "Car Number Plate", type: "text", required: false, enabled: true, placeholder: "ABC123" },
      ],
    },
    {
      id: "couple_information",
      key: "couple_information",
      title: "Couple Information",
      description: "Fill guest details if attending as couple.",
      enabled: true,
      fields: [
        { id: "ci_name", key: "name", label: "Guest Name", type: "text", required: true, enabled: true, placeholder: "Guest full name" },
        { id: "ci_email", key: "email", label: "Guest Email", type: "email", required: true, enabled: true, placeholder: "guest@example.com" },
        { id: "ci_phone", key: "phone", label: "Guest Phone", type: "text", required: true, enabled: true, placeholder: "+92 300 0000000" },
        { id: "ci_nic", key: "nic", label: "Guest CNIC", type: "text", required: true, enabled: true, placeholder: "xxxx-xxxxxxx-x" },
      ],
    },
    {
      id: "payment_information",
      key: "payment_information",
      title: "Payment Information",
      description: "Add payment details.",
      enabled: true,
      fields: [
        { id: "pay_ref", key: "payment_reference", label: "Payment Reference", type: "text", required: false, enabled: true, placeholder: "Transaction ID" },
      ],
    },
    {
      id: "proof_of_payment",
      key: "proof_of_payment",
      title: "Proof of Payment",
      description: "Upload screenshot of payment receipt.",
      enabled: true,
      fields: [
        { id: "proof_upload", key: "payment_proof", label: "Payment Screenshot", type: "file", required: true, enabled: true },
      ],
    },
  ],
};

const DEFAULT_COUPLE_SECTION = DEFAULT_FORM_CONFIG.sections.find((section) => section.key === "couple_information") as BookingSection;

const getNumericPrice = (value: unknown): number => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.]/g, "");
    return normalized ? Number(normalized) : 0;
  }
  return 0;
};

const formatPriceLabel = (amount: number, fallback?: string) => {
  if (amount > 0) return `PKR ${amount.toLocaleString("en-PK")}`;
  return fallback ?? "N/A";
};

const normalizeString = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const normalizeGender = (value: unknown) => {
  const gender = String(value || "").toLowerCase().trim();
  return ["male", "female", "other"].includes(gender) ? gender : "";
};

async function uploadFile(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch(`${apiUrl}/upload`, {
    method: "POST",
    body: data,
  });
  const json = await res.json();
  if (!json?.url) throw new Error("File upload failed");
  return String(json.url);
}

const pickValue = (source: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value === undefined || value === null || value === "") continue;
    return String(value);
  }
  return "";
};

export default function BookTicket() {
  const { user } = useUserProfile();
  const { id } = useParams();
  const { events, isLoading } = useEvents();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [formConfig, setFormConfig] = useState<BookingFormConfig>(DEFAULT_FORM_CONFIG);
  const [dynamicValues, setDynamicValues] = useState<Record<string, Record<string, any>>>({});
  const [fileValues, setFileValues] = useState<Record<string, File | null>>({});
  const [loadingFormConfig, setLoadingFormConfig] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null);
  const [additionalPersons, setAdditionalPersons] = useState<AdditionalPerson[]>([]);

  const event = events.find((item) => String(item.id) === String(id));
  const userGender = normalizeGender((user as any)?.gender);
  const accountStatus = String((user as any)?.status || "").toLowerCase();
  const isAccountApproved = accountStatus === "approved";

  const availableTiers: EventTier[] = useMemo(() => {
    const active = (event as any)?.active_tiers;
    const all = (event as any)?.tier_packages;
    const tiers = Array.isArray(active) && active.length ? active : Array.isArray(all) ? all : [];
    return tiers.filter((tier: any) => {
      const tierGender = normalizeGender(tier?.gender);
      if (!tierGender) return true;
      if (!userGender) return true;
      return tierGender === userGender;
    });
  }, [event, userGender]);

  const selectedTier = useMemo(() => {
    if (!availableTiers.length) return null;
    if (selectedTierIndex !== null && selectedTierIndex >= 0 && selectedTierIndex < availableTiers.length) {
      return availableTiers[selectedTierIndex] ?? null;
    }
    if (!selectedTierId) return availableTiers[0] ?? null;
    return availableTiers.find((tier) => Number(tier.id) === Number(selectedTierId)) ?? availableTiers[0] ?? null;
  }, [availableTiers, selectedTierId, selectedTierIndex]);

  const requiredPersons = Math.max(1, Number(selectedTier?.required_persons ?? selectedTier?.requiredPersons ?? 1) || 1);
  const selectedTierGender = normalizeGender(selectedTier?.gender);
  const isGroupTier = requiredPersons > 2;
  const showCoupleSection = requiredPersons === 2 && selectedTierGender === "";

  useEffect(() => {
    if (!selectedTier) return;
    console.log("[BookTicket] Selected tier:", selectedTier);
    console.log("[BookTicket] Tier computed:", {
      requiredPersons,
      selectedTierGender,
      isGroupTier,
      showCoupleSection,
    });
  }, [selectedTier, requiredPersons, selectedTierGender, isGroupTier, showCoupleSection]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tierParam = Number(params.get("tier") || 0);
    const tierIndexParam = Number(params.get("tierIndex") ?? -1);
    if (!Number.isNaN(tierIndexParam) && tierIndexParam >= 0) {
      setSelectedTierIndex(tierIndexParam);
    } else {
      setSelectedTierIndex(null);
    }
    if (tierParam) {
      setSelectedTierId(tierParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (availableTiers.length && selectedTierIndex !== null) {
      const clampedIndex = Math.min(Math.max(selectedTierIndex, 0), availableTiers.length - 1);
      if (clampedIndex !== selectedTierIndex) {
        setSelectedTierIndex(clampedIndex);
      }
      return;
    }
    if (availableTiers.length && !selectedTierId) {
      setSelectedTierId(Number(availableTiers[0]?.id || 0) || null);
    }
  }, [availableTiers, selectedTierId, selectedTierIndex]);

  useEffect(() => {
    if (!isGroupTier) {
      setAdditionalPersons([]);
      return;
    }
    const count = Math.max(0, requiredPersons - 1);
    setAdditionalPersons((prev) => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ name: "", email: "", phone: "", nic: "", gender: "" });
      }
      return next.slice(0, count);
    });
  }, [isGroupTier, requiredPersons]);

  const capacityLimit = Number(event?.capacity_limit) || 0;
  const bookedTickets = Number(event?.booked_tickets) || 0;
  const availableTickets = typeof event?.available_tickets === "number"
    ? event.available_tickets
    : capacityLimit > 0
      ? Math.max(capacityLimit - bookedTickets, 0)
      : null;

  const isSoldOut = typeof availableTickets === "number" && availableTickets <= 0;
  const baseTicketPrice = useMemo(() => {
    const tierPrice = getNumericPrice(selectedTier?.price);
    if (tierPrice > 0) return tierPrice;
    return getNumericPrice((event as any)?.price);
  }, [event, selectedTier]);

  const sectionsForRender = useMemo(() => {
    const sections = Array.isArray(formConfig.sections) ? [...formConfig.sections] : [];
    if (showCoupleSection && !sections.some((section) => section.key === "couple_information")) {
      sections.splice(1, 0, DEFAULT_COUPLE_SECTION);
    }
    return sections;
  }, [formConfig.sections, showCoupleSection]);

  const enabledSections = useMemo(
    () =>
      (sectionsForRender || []).filter((section) => {
        if (section.key === "couple_information") return showCoupleSection;
        if (!section.enabled) return false;
        return true;
      }),
    [sectionsForRender, showCoupleSection],
  );

  const initializeValues = (config: BookingFormConfig) => {
    const initialValues: Record<string, Record<string, any>> = {};

    const sections = Array.isArray(config.sections) ? [...config.sections] : [];
    if (showCoupleSection && !sections.some((section) => section.key === "couple_information")) {
      sections.splice(1, 0, DEFAULT_COUPLE_SECTION);
    }

    for (const section of sections) {
      if (section.key !== "couple_information" && !section.enabled) continue;
      if (section.key === "couple_information" && !showCoupleSection) continue;
      initialValues[section.key] = {};
      for (const field of section.fields || []) {
        if (!field.enabled) continue;

        if (field.type === "checkbox" && field.options && field.options.length > 0) {
          initialValues[section.key][field.key] = [];
        } else if (field.type === "checkbox") {
          initialValues[section.key][field.key] = false;
        } else {
          initialValues[section.key][field.key] = "";
        }
      }
    }

    if (initialValues.personal_information) {
      initialValues.personal_information.full_name =
        normalizeString(user?.first_name && user?.last_name ? `${user?.first_name} ${user?.last_name}` : user?.display_name || user?.username);
      initialValues.personal_information.email = normalizeString(user?.email);
      initialValues.personal_information.phone = normalizeString((user as any)?.phone);
      initialValues.personal_information.nic = normalizeString((user as any)?.nic);
      initialValues.personal_information.carNumber = normalizeString((user as any)?.car_number);
    }

    setDynamicValues(initialValues);
  };

  useEffect(() => {
    if (!showCoupleSection) return;
    setDynamicValues((prev) => {
      if (prev?.couple_information) return prev;
      const section = DEFAULT_COUPLE_SECTION;
      const nextSection: Record<string, any> = {};
      for (const field of section.fields || []) {
        if (!field.enabled) continue;
        nextSection[field.key] = "";
      }
      return {
        ...prev,
        couple_information: nextSection,
      };
    });
  }, [showCoupleSection]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingFormConfig(true);
        const res = await getBookingFormConfig(id);
        const config = res?.success && res?.data ? res.data : DEFAULT_FORM_CONFIG;
        setFormConfig(config);
        initializeValues(config);
      } catch {
        setFormConfig(DEFAULT_FORM_CONFIG);
        initializeValues(DEFAULT_FORM_CONFIG);
      } finally {
        setLoadingFormConfig(false);
      }
    };

    loadConfig();
  }, [id, user?.email]);

  const setFieldValue = (sectionKey: string, fieldKey: string, value: any) => {
    setDynamicValues((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const updateAdditionalPerson = (index: number, field: keyof AdditionalPerson, value: string) => {
    setAdditionalPersons((prev) =>
      prev.map((person, i) => (i === index ? { ...person, [field]: value } : person))
    );
  };

  const validateForm = () => {
    for (const section of enabledSections) {
      for (const field of section.fields || []) {
        if (!field.enabled) continue;

        const fieldCompositeKey = `${section.key}.${field.key}`;
        const value = dynamicValues?.[section.key]?.[field.key];

        if (field.type === "file") {
          const file = fileValues[fieldCompositeKey];
          if (field.required && !file) {
            return `${field.label} is required.`;
          }
          continue;
        }

        if (field.required) {
          if (field.type === "checkbox" && field.options && field.options.length > 0) {
            if (!Array.isArray(value) || value.length === 0) return `${field.label} is required.`;
          } else if (field.type === "checkbox") {
            if (!value) return `${field.label} is required.`;
          } else if (String(value || "").trim() === "") {
            return `${field.label} is required.`;
          }
        }

        const textValue = String(value ?? "");
        const validation = field.validation || {};

        if (textValue && field.type === "email") {
          const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue);
          if (!emailOk) return `${field.label} must be a valid email.`;
        }

        if (textValue && field.type === "number") {
          const num = Number(textValue);
          if (Number.isNaN(num)) return `${field.label} must be a number.`;
          if (validation.min !== undefined && num < validation.min) return `${field.label} must be >= ${validation.min}.`;
          if (validation.max !== undefined && num > validation.max) return `${field.label} must be <= ${validation.max}.`;
        }

        if (textValue && validation.minLength !== undefined && textValue.length < validation.minLength) {
          return `${field.label} must be at least ${validation.minLength} characters.`;
        }

        if (textValue && validation.maxLength !== undefined && textValue.length > validation.maxLength) {
          return `${field.label} must be at most ${validation.maxLength} characters.`;
        }

        if (textValue && validation.pattern) {
          try {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(textValue)) {
              return `${field.label} format is invalid.`;
            }
          } catch {
            return `${field.label} has invalid validation pattern in admin config.`;
          }
        }
      }
    }

    return "";
  };

  const renderField = (section: BookingSection, field: BookingField) => {
    const value = dynamicValues?.[section.key]?.[field.key];
    const compositeKey = `${section.key}.${field.key}`;

    if (!field.enabled) return null;

    if (field.type === "textarea") {
      return (
        <div className="space-y-2" key={compositeKey}>
          <Label>{field.label}{field.required ? " *" : ""}</Label>
          <Textarea
            value={normalizeString(value)}
            onChange={(e) => setFieldValue(section.key, field.key, e.target.value)}
            placeholder={field.placeholder || ""}
            rows={3}
          />
          {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div className="space-y-2" key={compositeKey}>
          <Label>{field.label}{field.required ? " *" : ""}</Label>
          <Select value={normalizeString(value)} onValueChange={(val) => setFieldValue(section.key, field.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((option) => (
                <SelectItem key={`${compositeKey}.${option.value}`} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
        </div>
      );
    }

    if (field.type === "radio") {
      return (
        <div className="space-y-2" key={compositeKey}>
          <Label>{field.label}{field.required ? " *" : ""}</Label>
          <div className="space-y-2">
            {(field.options || []).map((option) => (
              <label key={`${compositeKey}.${option.value}`} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={compositeKey}
                  value={option.value}
                  checked={normalizeString(value) === option.value}
                  onChange={() => setFieldValue(section.key, field.key, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
        </div>
      );
    }

    if (field.type === "checkbox") {
      const hasOptions = Boolean(field.options && field.options.length > 0);

      if (hasOptions) {
        const selectedValues: string[] = Array.isArray(value) ? value : [];

        return (
          <div className="space-y-2" key={compositeKey}>
            <Label>{field.label}{field.required ? " *" : ""}</Label>
            <div className="space-y-2">
              {(field.options || []).map((option) => (
                <label key={`${compositeKey}.${option.value}`} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((item) => item !== option.value);
                      setFieldValue(section.key, field.key, next);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
          </div>
        );
      }

      return (
        <div className="space-y-2" key={compositeKey}>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={Boolean(value)} onCheckedChange={(checked) => setFieldValue(section.key, field.key, Boolean(checked))} />
            <span>{field.label}{field.required ? " *" : ""}</span>
          </label>
          {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
        </div>
      );
    }

    if (field.type === "file") {
      const file = fileValues[compositeKey];
      return (
        <div className="space-y-2" key={compositeKey}>
          <Label>{field.label}{field.required ? " *" : ""}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFileValues((prev) => ({ ...prev, [compositeKey]: selected }));
            }}
          />
          {file ? <p className="text-xs text-green-600">Selected: {file.name}</p> : null}
          {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
        </div>
      );
    }

    return (
      <div className="space-y-2" key={compositeKey}>
        <Label>{field.label}{field.required ? " *" : ""}</Label>
        <Input
          type={field.type === "number" ? "number" : field.type}
          value={normalizeString(value)}
          onChange={(e) => setFieldValue(section.key, field.key, e.target.value)}
          placeholder={field.placeholder || ""}
        />
        {field.help_text ? <p className="text-xs text-muted-foreground">{field.help_text}</p> : null}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAccountApproved) {
      toast({
        title: "Account pending approval",
        description: "Your account is pending approval. You can book tickets once you are approved.",
        variant: "destructive",
      });
      return;
    }

    if (isSoldOut) {
      toast({ title: "Tickets unavailable", description: "This event is sold out.", variant: "destructive" });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }

    if (availableTiers.length > 0 && !selectedTier) {
      toast({ title: "Validation Error", description: "Please select a tier.", variant: "destructive" });
      return;
    }

    const tierGender = normalizeGender((selectedTier as any)?.gender);
    if (tierGender && userGender && tierGender !== userGender) {
      toast({ title: "Validation Error", description: "Selected tier is not available for your gender.", variant: "destructive" });
      return;
    }

    if (isGroupTier) {
      const expected = Math.max(0, requiredPersons - 1);
      if (additionalPersons.length !== expected) {
        toast({ title: "Validation Error", description: `Please add exactly ${expected} additional person(s).`, variant: "destructive" });
        return;
      }

      let hasFemale = false;
      for (let i = 0; i < additionalPersons.length; i += 1) {
        const person = additionalPersons[i];
        if (!person.name.trim()) {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} name is required.`, variant: "destructive" });
          return;
        }
        if (!person.email.trim()) {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} email is required.`, variant: "destructive" });
          return;
        }
        if (!person.phone.trim()) {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} phone is required.`, variant: "destructive" });
          return;
        }
        if (!person.nic.trim()) {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} CNIC is required.`, variant: "destructive" });
          return;
        }
        const personGender = normalizeGender(person.gender);
        if (!personGender) {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} gender is required.`, variant: "destructive" });
          return;
        }
        if (personGender === "female") hasFemale = true;

        if (tierGender === "female" && personGender !== "female") {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} must be female.`, variant: "destructive" });
          return;
        }
        if (tierGender === "other" && personGender !== "other") {
          toast({ title: "Validation Error", description: `Additional person ${i + 1} must be other.`, variant: "destructive" });
          return;
        }
      }

      if (tierGender === "male" && !hasFemale) {
        toast({ title: "Validation Error", description: "At least one additional person must be female.", variant: "destructive" });
        return;
      }
    }

    try {
      setSubmitting(true);

      const payloadSections: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(dynamicValues || {}));
      const uploadedUrls: string[] = [];

      for (const section of enabledSections) {
        for (const field of section.fields || []) {
          if (!field.enabled || field.type !== "file") continue;
          const fileKey = `${section.key}.${field.key}`;
          const file = fileValues[fileKey];
          if (!file) continue;
          const fileUrl = await uploadFile(file);
          uploadedUrls.push(fileUrl);
          if (!payloadSections[section.key]) payloadSections[section.key] = {};
          payloadSections[section.key][field.key] = fileUrl;
        }
      }

      const personalValues = payloadSections.personal_information || {};
      const coupleValues = payloadSections.couple_information || {};

      const coupleHasAny = Object.values(coupleValues).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        return String(value ?? "").trim() !== "";
      });

      const coupleDetails = showCoupleSection && coupleHasAny
        ? {
            name: pickValue(coupleValues, ["name", "full_name"]),
            email: pickValue(coupleValues, ["email"]),
            phone: pickValue(coupleValues, ["phone", "phone_number"]),
            nic: pickValue(coupleValues, ["nic", "cnic"]),
            carNumber: pickValue(coupleValues, ["carNumber", "car_number"]),
          }
        : null;

      if (showCoupleSection) {
        const requiredKeys: (keyof NonNullable<typeof coupleDetails>)[] = ["name", "email", "phone", "nic"];
        const missing = requiredKeys.filter((key) => !String(coupleDetails?.[key] || "").trim());
        if (missing.length) {
          toast({
            title: "Validation Error",
            description: "Couple information is required for this tier.",
            variant: "destructive",
          });
          return;
        }
      }

      const isCoupleBooking = showCoupleSection && Boolean(coupleDetails);
      const groupMultiplier = isGroupTier ? requiredPersons : isCoupleBooking ? 2 : 1;
      const totalPrice = baseTicketPrice * groupMultiplier;

      const paymentProofUrl =
        pickValue(payloadSections.proof_of_payment || {}, ["payment_proof", "proof", "screenshot"]) ||
        (uploadedUrls[0] || "");

      const currentDate = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

      const finalData = {
        event_id: event?.id,
        tier_id: selectedTier?.id,
        tier_index: selectedTierIndex,
        date: currentDate,
        phone: pickValue(personalValues, ["phone", "phone_number"]),
        nic: pickValue(personalValues, ["nic", "cnic"]),
        carNumber: pickValue(personalValues, ["carNumber", "car_number"]),
        payment_image: paymentProofUrl,
        additionalPerson: isGroupTier ? null : coupleDetails,
        couple_details: isGroupTier ? null : coupleDetails,
        additional_persons: isGroupTier ? additionalPersons : undefined,
        is_couple_booking: isCoupleBooking,
        ticket_price: totalPrice,
        dynamic_form: payloadSections,
      };

      await eventBooking(finalData);

      toast({ title: "Ticket Booked Successfully!", description: "Your booking has been submitted." });
      navigate("/dashboard/tickets");
    } catch (error: any) {
      const apiPayload = error?.response?.data;
      let responseMessage = apiPayload?.message || apiPayload?.code || error?.message || "Something went wrong. Try again.";
      if (!apiPayload?.message && apiPayload && typeof apiPayload === "object") {
        responseMessage = JSON.stringify(apiPayload);
      }
      toast({ title: "Booking failed", description: responseMessage, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loadingFormConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 sm:mb-4 text-sm sm:text-base">
            Back
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold">Book Your Ticket</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Complete your booking details below</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 p-5 sm:p-6 rounded-2xl shadow-soft h-fit lg:sticky lg:top-6">
            <div className="space-y-6">
              <img src={event?.feature_image || ""} alt="Event" className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-xl mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{event?.title}</h2>
              <div className="space-y-3 text-sm sm:text-base">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div>
                    <p className="font-semibold">{event?.date}</p>
                    <p className="text-muted-foreground">Saturday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div>
                    <p className="font-semibold">{event?.time}</p>
                    <p className="text-muted-foreground">{event?.event_duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-muted-foreground">{event?.venue}</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground text-sm sm:text-base">Ticket Price</span>
                  <span className="text-xl sm:text-xl font-bold text-primary">{formatPriceLabel(baseTicketPrice, event?.price)}</span>
                </div>
                {selectedTier ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Tier: {selectedTier.name || `Tier #${selectedTier.id}`}</p>
                    <p>Required Persons: {requiredPersons}</p>
                    <p>Gender: {selectedTier.gender ? selectedTier.gender : "Any"}</p>
                  </div>
                ) : null}
                {capacityLimit ? (
                  <p className="text-sm text-muted-foreground">{Math.max(availableTickets ?? 0, 0)} seats left out of {capacityLimit}</p>
                ) : null}
                {isSoldOut ? <p className="text-sm text-destructive font-semibold">This event is sold out.</p> : null}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-3 p-5 sm:p-6 md:p-8 rounded-2xl shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* {availableTiers.length > 0 ? (
                <div className="border-t pt-6 first:border-t-0 first:pt-0">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Select Tier</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tier</Label>
                      <Select
                        value={selectedTier ? String(selectedTier.id) : ""}
                        onValueChange={(value) => setSelectedTierId(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTiers.map((tier) => (
                            <SelectItem key={tier.id} value={String(tier.id)}>
                              {tier.name || `Tier #${tier.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tier Details</Label>
                      <div className="rounded-lg border p-3 text-sm space-y-1">
                        <p>Price: {formatPriceLabel(baseTicketPrice, String((selectedTier as any)?.price || ""))}</p>
                        {selectedTier?.gender ? <p className="capitalize">Gender: {selectedTier.gender}</p> : <p>Gender: Any</p>}
                        <p>Required Persons: {requiredPersons}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null} */}

             

              {enabledSections.map((section) => (
                <div key={section.id} className="border-t pt-6 first:border-t-0 first:pt-0">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{section.title}</h3>
                  {section.description ? (
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{section.description}</p>
                  ) : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    {(section.fields || []).filter((field) => field.enabled).map((field) => (
                      <div key={`${section.key}.${field.key}`} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                        {renderField(section, field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

               {isGroupTier ? (
                <div className="border-t pt-6 first:border-t-0 first:pt-0">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Additional Persons</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add {Math.max(0, requiredPersons - 1)} additional person(s).
                  </p>
                  <div className="space-y-4">
                    {additionalPersons.map((person, index) => (
                      <div key={`additional-${index}`} className="rounded-lg border p-4 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={person.name}
                            onChange={(e) => updateAdditionalPerson(index, "name", e.target.value)}
                            placeholder="Full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            value={person.email}
                            onChange={(e) => updateAdditionalPerson(index, "email", e.target.value)}
                            placeholder="name@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={person.phone}
                            onChange={(e) => updateAdditionalPerson(index, "phone", e.target.value)}
                            placeholder="+92 300 0000000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CNIC</Label>
                          <Input
                            value={person.nic}
                            onChange={(e) => updateAdditionalPerson(index, "nic", e.target.value)}
                            placeholder="xxxx-xxxxxxx-x"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Gender</Label>
                          <Select
                            value={person.gender}
                            onValueChange={(value) => updateAdditionalPerson(index, "gender", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">male</SelectItem>
                              <SelectItem value="female">female</SelectItem>
                              <SelectItem value="other">other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white font-semibold rounded-xl text-base sm:text-lg"
                disabled={submitting || isSoldOut}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : isSoldOut ? "Sold Out" : "Complete Booking"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
