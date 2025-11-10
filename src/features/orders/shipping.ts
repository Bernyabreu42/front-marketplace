type ShippingAddressLike = Record<string, unknown> | string | null | undefined;

interface ShippingField {
  key: string;
  label: string;
}

export interface ShippingEntry {
  key: string;
  label: string;
  value: string;
}

const ORDERED_FIELDS: ShippingField[] = [
  { key: "contactName", label: "Nombre de contacto" },
  { key: "contactPhone", label: "Teléfono" },
  { key: "contactEmail", label: "Correo electrónico" },
  { key: "street", label: "Calle" },
  { key: "apartment", label: "Apartamento" },
  { key: "city", label: "Ciudad" },
  { key: "state", label: "Provincia / Estado" },
  { key: "postalCode", label: "Código postal" },
  { key: "country", label: "País" },
  { key: "deliveryNotes", label: "Notas de entrega" },
];

const humanizeKey = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return "";
};

const buildEntriesFromObject = (
  data: Record<string, unknown>
): ShippingEntry[] => {
  const entries: ShippingEntry[] = [];

  ORDERED_FIELDS.forEach(({ key, label }) => {
    const formatted = formatValue(data[key]);
    if (formatted) {
      entries.push({ key, label, value: formatted });
    }
  });

  Object.entries(data).forEach(([key, rawValue]) => {
    if (ORDERED_FIELDS.some((field) => field.key === key)) return;
    const formatted = formatValue(rawValue);
    if (!formatted) return;
    entries.push({
      key,
      label: humanizeKey(key),
      value: formatted,
    });
  });

  return entries;
};

export const mapShippingAddressEntries = (
  address: ShippingAddressLike
): ShippingEntry[] => {
  if (!address) return [];
  if (typeof address === "string") {
    const trimmed = address.trim();
    return trimmed
      ? [{ key: "address", label: "Dirección", value: trimmed }]
      : [];
  }
  if (typeof address === "object") {
    return buildEntriesFromObject(address as Record<string, unknown>);
  }
  return [];
};
