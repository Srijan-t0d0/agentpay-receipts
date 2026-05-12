const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function makeId(prefix: string) {
  const source = crypto.randomUUID().replace(/-/g, "");
  return `${prefix}${source.slice(0, 18)}`;
}

export function makeTx() {
  return Array.from({ length: 88 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function hashBytes(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest));
}

export async function hashHex(input: string, prefix = "") {
  const bytes = await hashBytes(input);
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${prefix}${hex}`;
}

export async function taskIdBytes(id: string) {
  const bytes = await hashBytes(id);
  return bytes.slice(0, 16);
}

export function canonicalJson(value: unknown) {
  return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort());
}
