// Stored URLs are untrusted even when created by an administrator.
function clean(value) {
  if (typeof value !== "string") return "";
  const input = value.trim();
  if (!input || /[\s\u0000-\u001f\u007f"<>\\]/u.test(input)) return "";
  return input;
}

function parseHttps(input) {
  if (!/^https:\/\//i.test(input)) return null;
  try {
    const url = new URL(input);
    return url.protocol === "https:" && !url.username && !url.password ? url : null;
  } catch { return null; }
}

export function safeImageUrl(value, apiOrigin) {
  const input = clean(value);
  if (!input) return null;
  const external = parseHttps(input);
  if (external) return external.href;
  if (!input.startsWith("/") || input.startsWith("//")) return null;
  try {
    const base = new URL(apiOrigin);
    const url = new URL(input, base);
    if (url.origin !== base.origin || !["https:", "http:"].includes(base.protocol)) return null;
    if (!/^\/(?:api\/files|uploads)\//.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function safeOfferLink(value) {
  const input = clean(value);
  if (!input) return "/contact";
  const external = parseHttps(input);
  if (external) return external.href;
  if (input.startsWith("/") && !input.startsWith("//")) {
    try {
      const url = new URL(input, "https://research-guru.pages.dev");
      if (url.origin === "https://research-guru.pages.dev" && !url.pathname.startsWith("//")) {
        return url.pathname + url.search + url.hash;
      }
    } catch { /* use safe default */ }
  }
  return "/contact";
}
