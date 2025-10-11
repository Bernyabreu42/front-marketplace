import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface GeneralSettings {
  marketplaceName: string;
  supportEmail: string;
  defaultCurrency: string;
  timezone: string;
  description: string;
}

interface OrderSettings {
  autoAcceptNewStores: boolean;
  autoCapturePayments: boolean;
  requireManualReview: boolean;
  lowStockThreshold: number;
}

interface NotificationSettings {
  emailAlerts: boolean;
  slackAlerts: boolean;
  dailyDigest: boolean;
  digestHour: string;
}

interface SecuritySettings {
  enforce2FA: boolean;
  sessionTimeoutHours: number;
  lockAfterFailedAttempts: number;
  allowPasswordless: boolean;
}

interface AdminSettingsForm {
  general: GeneralSettings;
  orders: OrderSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

const DEFAULT_SETTINGS: AdminSettingsForm = {
  general: {
    marketplaceName: "CommerceHub",
    supportEmail: "soporte@commercehub.com",
    defaultCurrency: "DOP",
    timezone: "America/Santo_Domingo",
    description: "Marketplace B2B centrado en tiendas locales y comercios especializados.",
  },
  orders: {
    autoAcceptNewStores: true,
    autoCapturePayments: false,
    requireManualReview: true,
    lowStockThreshold: 10,
  },
  notifications: {
    emailAlerts: true,
    slackAlerts: false,
    dailyDigest: true,
    digestHour: "08:00",
  },
  security: {
    enforce2FA: false,
    sessionTimeoutHours: 24,
    lockAfterFailedAttempts: 5,
    allowPasswordless: false,
  },
};

export function AdminSettingsPage() {
  const [form, setForm] = useState<AdminSettingsForm>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const currencies = useMemo(
    () => [
      { code: "DOP", label: "Peso dominicano" },
      { code: "USD", label: "Dólar estadounidense" },
      { code: "EUR", label: "Euro" },
      { code: "MXN", label: "Peso mexicano" },
    ],
    []
  );

  const timezones = useMemo(
    () => [
      "America/Santo_Domingo",
      "America/Bogota",
      "America/Mexico_City",
      "America/New_York",
      "UTC",
    ],
    []
  );

  const handleGeneralChange = (
    field: keyof GeneralSettings
  ) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        general: {
          ...prev.general,
          [field]: value,
        },
      }));
    };

  const handleOrdersToggle = (field: keyof OrderSettings) => (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      orders: {
        ...prev.orders,
        [field]: checked,
      },
    }));
  };

  const handleNotificationsToggle = (field: keyof NotificationSettings) => (
    checked: boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: checked,
      },
    }));
  };

  const handleSecurityToggle = (field: keyof SecuritySettings) => (
    checked: boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: checked,
      },
    }));
  };

  const handleOrdersNumber = (field: keyof OrderSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setForm((prev) => ({
        ...prev,
        orders: {
          ...prev.orders,
          [field]: Number.isNaN(value) ? prev.orders[field] : value,
        },
      }));
    };

  const handleSecurityNumber = (field: keyof SecuritySettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);
      setForm((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          [field]: Number.isNaN(value) ? prev.security[field] : value,
        },
      }));
    };

  const handleDigestHourChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        digestHour: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Preferencias actualizadas");
    } catch (error) {
      toast.error("No pudimos guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    toast.info("Preferencias restablecidas");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Cargando configuraciones...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configuración general
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra las preferencias globales, notificaciones y seguridad del marketplace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Información general</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="general-name">Nombre del marketplace</Label>
            <Input
              id="general-name"
              value={form.general.marketplaceName}
              onChange={handleGeneralChange("marketplaceName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="general-email">Correo de soporte</Label>
            <Input
              id="general-email"
              type="email"
              value={form.general.supportEmail}
              onChange={handleGeneralChange("supportEmail")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="general-currency">Moneda por defecto</Label>
            <select
              id="general-currency"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
              value={form.general.defaultCurrency}
              onChange={handleGeneralChange("defaultCurrency")}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="general-timezone">Zona horaria</Label>
            <select
              id="general-timezone"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm"
              value={form.general.timezone}
              onChange={handleGeneralChange("timezone")}
            >
              {timezones.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="general-description">Descripción</Label>
            <Textarea
              id="general-description"
              value={form.general.description}
              onChange={handleGeneralChange("description")}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Pedidos y catálogos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">
                  Aceptar nuevas tiendas automáticamente
                </p>
                <p className="text-xs text-muted-foreground">
                  Si está deshabilitado, las solicitudes quedarán pendientes hasta una revisión manual.
                </p>
              </div>
              <Switch
                checked={form.orders.autoAcceptNewStores}
                onCheckedChange={handleOrdersToggle("autoAcceptNewStores")}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Capturar pagos automáticamente</p>
                <p className="text-xs text-muted-foreground">
                  Si está deshabilitado, los pagos quedarán en estado pendiente hasta confirmación manual.
                </p>
              </div>
              <Switch
                checked={form.orders.autoCapturePayments}
                onCheckedChange={handleOrdersToggle("autoCapturePayments")}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Revisar pedidos de alto riesgo</p>
                <p className="text-xs text-muted-foreground">
                  Solicita aprobación manual si el sistema de fraude detecta anomalías.
                </p>
              </div>
              <Switch
                checked={form.orders.requireManualReview}
                onCheckedChange={handleOrdersToggle("requireManualReview")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-low-stock">Aviso de stock bajo</Label>
              <Input
                id="order-low-stock"
                type="number"
                min={0}
                value={form.orders.lowStockThreshold}
                onChange={handleOrdersNumber("lowStockThreshold")}
              />
              <p className="text-xs text-muted-foreground">
                Se notificará a los vendedores cuando el inventario esté por debajo de este número.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Alertas por correo electrónico</p>
                <p className="text-xs text-muted-foreground">
                  Recibirás avisos inmediatos cuando ocurran eventos críticos.
                </p>
              </div>
              <Switch
                checked={form.notifications.emailAlerts}
                onCheckedChange={handleNotificationsToggle("emailAlerts")}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Alertas a Slack</p>
                <p className="text-xs text-muted-foreground">
                  Envía eventos operativos al canal del equipo.
                </p>
              </div>
              <Switch
                checked={form.notifications.slackAlerts}
                onCheckedChange={handleNotificationsToggle("slackAlerts")}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Resumen diario</p>
                <p className="text-xs text-muted-foreground">
                  Resumen consolidado con pedidos y métricas relevantes.
                </p>
              </div>
              <Switch
                checked={form.notifications.dailyDigest}
                onCheckedChange={handleNotificationsToggle("dailyDigest")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digest-hour">Hora del resumen diario</Label>
              <Input
                id="digest-hour"
                type="time"
                value={form.notifications.digestHour}
                onChange={handleDigestHourChange}
                disabled={!form.notifications.dailyDigest}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-semibold">Seguridad</CardTitle>
          <Badge variant="outline">Recomendado</Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Forzar 2FA para administradores</p>
                <p className="text-xs text-muted-foreground">
                  Solicita un segundo factor al acceder al panel administrativo.
                </p>
              </div>
              <Switch
                checked={form.security.enforce2FA}
                onCheckedChange={handleSecurityToggle("enforce2FA")}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">Permitir acceso sin contraseña</p>
                <p className="text-xs text-muted-foreground">
                  Habilita links mágicos para usuarios verificados.
                </p>
              </div>
              <Switch
                checked={form.security.allowPasswordless}
                onCheckedChange={handleSecurityToggle("allowPasswordless")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Duración de sesión (horas)</Label>
              <Input
                id="session-timeout"
                type="number"
                min={1}
                value={form.security.sessionTimeoutHours}
                onChange={handleSecurityNumber("sessionTimeoutHours")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lock-attempts">Intentos fallidos antes de bloqueo</Label>
              <Input
                id="lock-attempts"
                type="number"
                min={1}
                value={form.security.lockAfterFailedAttempts}
                onChange={handleSecurityNumber("lockAfterFailedAttempts")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
