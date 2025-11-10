import type { StoreAddress, StoreAddressValue } from "../types";

const EMPTY_ADDRESS: StoreAddress = {
  country: "",
  city: "",
  state: "",
  postalCode: "",
  street: "",
  note: "",
};

const sanitizeField = (value?: string | null): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const createEmptyAddress = (): StoreAddress => ({ ...EMPTY_ADDRESS });

export const normalizeStoreAddress = (
  value: StoreAddressValue
): StoreAddress => {
  if (!value) {
    return createEmptyAddress();
  }

  if (typeof value === "string") {
    const street = sanitizeField(value);
    return {
      ...EMPTY_ADDRESS,
      street: street ?? "",
    };
  }

  return {
    country: sanitizeField(value.country) ?? "",
    city: sanitizeField(value.city) ?? "",
    state: sanitizeField(value.state) ?? "",
    postalCode: sanitizeField(value.postalCode) ?? "",
    street: sanitizeField(value.street) ?? "",
    note: sanitizeField(value.note) ?? "",
  };
};

export const sanitizeStoreAddress = (
  address: StoreAddress
): StoreAddress | null => {
  const sanitized: StoreAddress = {
    country: sanitizeField(address.country),
    city: sanitizeField(address.city),
    state: sanitizeField(address.state),
    postalCode: sanitizeField(address.postalCode),
    street: sanitizeField(address.street),
    note: sanitizeField(address.note),
  };

  const hasValue = Object.values(sanitized).some((value) => value);
  return hasValue ? sanitized : null;
};

export const areAddressesEqual = (
  a: StoreAddress,
  b: StoreAddress
): boolean => {
  const sanitizedA = sanitizeStoreAddress(a);
  const sanitizedB = sanitizeStoreAddress(b);

  if (!sanitizedA && !sanitizedB) return true;
  if (!sanitizedA || !sanitizedB) return false;

  return (
    sanitizedA.country === sanitizedB.country &&
    sanitizedA.city === sanitizedB.city &&
    sanitizedA.state === sanitizedB.state &&
    sanitizedA.postalCode === sanitizedB.postalCode &&
    sanitizedA.street === sanitizedB.street &&
    sanitizedA.note === sanitizedB.note
  );
};

export const formatStoreAddress = (value: StoreAddressValue): string => {
  const address = normalizeStoreAddress(value);

  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .map((part) => sanitizeField(part))
    .filter((part): part is string => Boolean(part));

  const formatted = parts.join(", ");
  const note = sanitizeField(address.note);

  if (formatted && note) {
    return `${formatted} (${note})`;
  }

  return formatted || note || "";
};
