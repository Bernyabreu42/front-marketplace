import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Facebook, Instagram, Save, Twitter, Youtube } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchUserById } from "@/features/users/api";

import { updateStoreDetails } from "./api";
import type {
  StoreBusinessDay,
  StoreBusinessHourEntry,
  StoreBusinessHoursRecord,
  StoreBusinessHoursValue,
} from "./types";
import { useSellerStore } from "./hooks";
import StoreHeader from "./store-header";

type StoreFormState = {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  banner: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
};

const sanitize = (value: string | null | undefined) => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};


const DAY_ORDER: StoreBusinessDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

type DayKey = (typeof DAY_ORDER)[number];

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DAY_DEFAULTS: Record<DayKey, { isOpen: boolean; openTime: string; closeTime: string }> = {
  monday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  tuesday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  wednesday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  thursday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  friday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  saturday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  sunday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
};


type DayHour = {
  day: DayKey;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const createDefaultBusinessHours = (): DayHour[] =>
  DAY_ORDER.map((day) => ({
    day,
    ...DAY_DEFAULTS[day],
  }));

const normalizeBusinessHours = (
  raw: StoreBusinessHoursValue
): DayHour[] => {
  const defaults = createDefaultBusinessHours();
  if (!raw) return defaults;

  const byDay = new Map<DayKey, StoreBusinessHourEntry>();

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const dayValue = (entry as any)?.day;
      if (typeof dayValue !== "string") return;
      const normalizedDay = dayValue.toLowerCase() as DayKey;
      if (!DAY_LABELS[normalizedDay]) return;
      byDay.set(normalizedDay, {
        open: typeof (entry as any)?.open === "string" ? (entry as any).open : "",
        close: typeof (entry as any)?.close === "string" ? (entry as any).close : "",
        closed: (entry as any)?.closed ?? null,
      });
    });
  } else {
    Object.entries(raw).forEach(([dayKey, value]) => {
      const normalizedDay = dayKey.toLowerCase() as DayKey;
      if (!DAY_LABELS[normalizedDay]) return;
      const slot = value as StoreBusinessHourEntry | undefined;
      byDay.set(normalizedDay, {
        open: typeof slot?.open === "string" ? slot!.open : "",
        close: typeof slot?.close === "string" ? slot!.close : "",
        closed: slot?.closed ?? null,
      });
    });
  }

  return defaults.map((item) => {
    const slot = byDay.get(item.day);
    if (!slot) return item;

    const openTime = slot.open && slot.open.length ? slot.open : item.openTime;
    const closeTime = slot.close && slot.close.length ? slot.close : item.closeTime;
    const isOpen = slot.closed === true ? false : true;

    return {
      day: item.day,
      isOpen,
      openTime,
      closeTime,
    };
  });
};

const serializeBusinessHours = (
  hours: DayHour[]
): StoreBusinessHoursRecord =>
  hours.reduce<StoreBusinessHoursRecord>((acc, item) => {
    acc[item.day] = {
      open: item.openTime,
      close: item.closeTime,
      closed: item.isOpen ? false : true,
    };
    return acc;
  }, {} as StoreBusinessHoursRecord);

const businessHoursEquals = (a: DayHour[], b: DayHour[]) =>
  JSON.stringify(a) === JSON.stringify(b);

export function SellerStorePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [form, setForm] = useState<StoreFormState>({
    name: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    logo: "",
    banner: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });
  const [businessHours, setBusinessHours] = useState<DayHour[]>(() => createDefaultBusinessHours());

  const userProfileQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId!),
    enabled: Boolean(userId),
  });

  const storeId = userProfileQuery.data?.data.store?.id;
  const storeQuery = useSellerStore(storeId);
  const store = storeQuery.data?.data;

  const originalBusinessHours = useMemo(
    () => normalizeBusinessHours(store?.businessHours ?? null),
    [store?.businessHours]
  );

  useEffect(() => {
    if (!store) return;
    setForm({
      name: store.name ?? "",
      tagline: store.tagline ?? "",
      description: store.description ?? "",
      email: store.email ?? "",
      phone: store.phone ?? "",
      address: store.address ?? "",
      website: store.website ?? "",
      logo: store.logo ?? "",
      banner: store.banner ?? "",
      facebook: store.facebook ?? "",
      instagram: store.instagram ?? "",
      twitter: store.twitter ?? "",
      youtube: store.youtube ?? "",
    });
  }, [store]);

  useEffect(() => {
    setBusinessHours(originalBusinessHours);
  }, [originalBusinessHours]);

  const hasChanges = useMemo(() => {
    if (!store) return false;
    return (Object.keys(form) as Array<keyof StoreFormState>).some((key) => {
      const formValue = sanitize(form[key]);
      const original = sanitize(store[key] as string | null | undefined);
      return formValue !== original;
    });
  }, [form, store]);

  const businessHoursChanged = useMemo(
    () => !businessHoursEquals(businessHours, originalBusinessHours),
    [businessHours, originalBusinessHours]
  );

  const mutation = useMutation({
    mutationFn: async (payload: Partial<StoreFormState>) => {
      if (!storeId) throw new Error("No se encontro la tienda asociada");
      return updateStoreDetails(storeId, payload);
    },
    onSuccess: (response) => {
      setFeedback({
        type: "success",
        message: response.message ?? "Tienda actualizada",
      });
      queryClient.invalidateQueries({ queryKey: ["seller", "store", storeId] });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos actualizar la tienda";
      setFeedback({ type: "error", message });
    },
  });

  const businessHoursMutation = useMutation({
    mutationFn: async (payload: StoreBusinessHoursRecord) => {
      if (!storeId) throw new Error("No se encontro la tienda asociada");
      return updateStoreDetails(storeId, { businessHours: payload });
    },
    onSuccess: (response) => {
      if (response.data?.businessHours !== undefined) {
        setBusinessHours(normalizeBusinessHours(response.data.businessHours));
      }
      setFeedback({
        type: "success",
        message: response.message ?? "Horarios de atencion actualizados",
      });
      queryClient.invalidateQueries({
        queryKey: ["seller", "store", storeId],
      });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["user", userId] });
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos actualizar los horarios";
      setFeedback({ type: "error", message });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!store) {
      setFeedback({
        type: "error",
        message: "No pudimos cargar la informacion de la tienda.",
      });
      return;
    }

    const payload: Record<string, string | null> = {};
    (Object.keys(form) as Array<keyof StoreFormState>).forEach((key) => {
      const formValue = sanitize(form[key]);
      const original = sanitize(store[key] as string | null | undefined);
      if (formValue !== original) {
        payload[key] = formValue;
      }
    });

    if (Object.keys(payload).length === 0) {
      setFeedback({ type: "error", message: "No hay cambios para guardar." });
      return;
    }

    mutation.mutate(payload);
  };

  const handleHourChange = (
    day: DayKey,
    field: "isOpen" | "openTime" | "closeTime",
    value: string | boolean
  ) => {
    setBusinessHours((prev) =>
      prev.map((item) => {
        if (item.day !== day) return item;
        if (field === "isOpen") {
          return { ...item, isOpen: Boolean(value) };
        }
        if (field === "openTime") {
          return { ...item, openTime: String(value) };
        }
        return { ...item, closeTime: String(value) };
      })
    );
  };

  const handleSaveBusinessHours = () => {
    if (!storeId) {
      setFeedback({
        type: "error",
        message: "No se encontro la tienda asociada",
      });
      return;
    }

    if (!businessHoursChanged) {
      return;
    }

    setFeedback(null);
    const payload = serializeBusinessHours(businessHours);
    businessHoursMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Perfil de mi tienda
        </h1>
        <p className="text-sm text-muted-foreground">
          Personaliza la apariencia y la informacion de tu tienda
        </p>
      </div>

      <StoreHeader />

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
        </TabsList>

        {feedback && (
          <div
            className={`mb-4 rounded-md p-3 text-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Store Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Update the main information that your customers see.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input
                      id="store-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Awesome store"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-tagline">Tagline</Label>
                    <Input
                      id="store-tagline"
                      value={form.tagline}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, tagline: e.target.value }))
                      }
                      placeholder="We bring the best products"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-description">Description</Label>
                  <Textarea
                    id="store-description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Tell your customers about your store"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="store@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Phone</Label>
                    <Input
                      id="store-phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="(+00) 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Address</Label>
                    <Input
                      id="store-address"
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="123 Bakery Street"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-website">Website</Label>
                  <Input
                    id="store-website"
                    value={form.website}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, website: e.target.value }))
                    }
                    placeholder="https://yourstore.com"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={!hasChanges || mutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Social Media
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect your social media profiles to your store.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="flex items-center gap-3">
                  <Facebook className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="https://facebook.com/your-page"
                    value={form.facebook}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, facebook: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="https://instagram.com/your-profile"
                    value={form.instagram}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        instagram: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Twitter className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="https://twitter.com/your-handle"
                    value={form.twitter}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, twitter: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Youtube className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="https://youtube.com/your-channel"
                    value={form.youtube}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, youtube: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={!hasChanges || mutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {mutation.isPending ? "Saving..." : "Save Social Media"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Business Hours
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set your store's operating hours for each day of the week.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessHours.map(({ day, isOpen, openTime, closeTime }) => {
                const label = DAY_LABELS[day];
                return (
                  <div
                    key={day}
                    className="grid grid-cols-3 items-center gap-4 rounded-md border p-4 md:grid-cols-4"
                  >
                    <Label className="font-medium capitalize md:col-span-1">
                      {label}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`switch-${day}`}
                        checked={isOpen}
                        onCheckedChange={(checked) =>
                          handleHourChange(day, "isOpen", checked)
                        }
                      />
                      <Label htmlFor={`switch-${day}`}>
                        {isOpen ? "Open" : "Closed"}
                      </Label>
                    </div>
                    <div
                      className={`col-span-3 mt-2 grid grid-cols-2 items-center gap-2 md:col-span-2 md:mt-0 ${
                        !isOpen ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <Input
                        type="time"
                        value={openTime}
                        onChange={(e) =>
                          handleHourChange(day, "openTime", e.target.value)
                        }
                      />
                      <Input
                        type="time"
                        value={closeTime}
                        onChange={(e) =>
                          handleHourChange(day, "closeTime", e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-end">
                <Button
                  onClick={handleSaveBusinessHours}
                  disabled={
                    !businessHoursChanged || businessHoursMutation.isPending
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {businessHoursMutation.isPending
                    ? "Saving..."
                    : "Save Business Hours"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

