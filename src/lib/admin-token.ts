const encoder = new TextEncoder();

function toBase64Url(input: string) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(value: string, secret: string) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createAdminToken(payload: { username: string; expiresAt: number }, secret: string) {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await signValue(body, secret);
  return `${body}.${signature}`;
}

export async function verifyAdminToken(token: string | null | undefined, secret: string) {
  if (!token) return false;

  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = await signValue(body, secret);
  if (signature !== expected) return false;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as { expiresAt?: number };
    return typeof payload.expiresAt === "number" && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}