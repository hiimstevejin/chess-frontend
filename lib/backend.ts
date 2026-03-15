const DEFAULT_BACKEND_HTTP_URL = "http://127.0.0.1:8000";
const DEFAULT_BACKEND_WS_URL = "ws://127.0.0.1:8000";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getBackendApiBaseUrl() {
  return trimTrailingSlash(
    process.env.BACKEND_API_BASE_URL ??
      process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ??
      DEFAULT_BACKEND_HTTP_URL,
  );
}

export function getBackendWebSocketBaseUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_BACKEND_WS_BASE_URL;
  if (explicitUrl) {
    return trimTrailingSlash(explicitUrl);
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ?? DEFAULT_BACKEND_HTTP_URL;

  try {
    const parsedUrl = new URL(apiBaseUrl);
    parsedUrl.protocol = parsedUrl.protocol === "https:" ? "wss:" : "ws:";
    return trimTrailingSlash(parsedUrl.toString());
  } catch {
    return DEFAULT_BACKEND_WS_URL;
  }
}
