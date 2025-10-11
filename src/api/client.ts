const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const API_BASIC_USER = import.meta.env.VITE_API_BASIC_USER ?? "";
const API_BASIC_PASSWORD = import.meta.env.VITE_API_BASIC_PASSWORD ?? "";

const defaultHeaders = () => {
  const headers: Record<string, string> = {};

  if (API_BASIC_USER && API_BASIC_PASSWORD) {
    const encoded = btoa(`${API_BASIC_USER}:${API_BASIC_PASSWORD}`);
    headers.Authorization = `Basic ${encoded}`;
  }

  return headers;
};

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData;

const isBlob = (value: unknown): value is Blob =>
  typeof Blob !== "undefined" && value instanceof Blob;

const isArrayBufferLike = (value: unknown): value is ArrayBuffer | ArrayBufferView => {
  if (typeof ArrayBuffer === "undefined") return false;
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
};

const isURLSearchParams = (value: unknown): value is URLSearchParams =>
  typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined>;
}

type SerializableBody = Record<string, unknown> | unknown[];

const shouldSerialize = (value: unknown): value is SerializableBody => {
  if (value === null) return false;
  if (typeof value === "string") return false;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (typeof value !== "object") return false;
  if (isFormData(value) || isBlob(value) || isArrayBufferLike(value) || isURLSearchParams(value)) {
    return false;
  }
  return true;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = new URL(path, API_BASE_URL);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = {
    ...defaultHeaders(),
    ...(options.headers ?? {}),
  };

  let body: BodyInit | undefined;
  const payload = options.body;

  if (payload === undefined || payload === null) {
    body = undefined;
  } else if (
    isFormData(payload) ||
    isBlob(payload) ||
    isArrayBufferLike(payload) ||
    isURLSearchParams(payload)
  ) {
    body = payload as BodyInit;
  } else if (typeof payload === "string") {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "text/plain;charset=UTF-8";
    }
    body = payload;
  } else if (shouldSerialize(payload)) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    body = JSON.stringify(payload);
  } else {
    body = payload as BodyInit;
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    credentials: "include",
    headers,
    body,
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
