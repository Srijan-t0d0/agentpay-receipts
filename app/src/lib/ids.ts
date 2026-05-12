import { hashBytes } from "./hashes";

export async function taskIdBytes(id: string) {
  const bytes = await hashBytes(id);
  return bytes.slice(0, 16);
}

export function prefixedHash(prefix: string, bytes: number[]) {
  return `${prefix}${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function stripHashPrefix(value?: string) {
  return value?.replace(/^[a-z]+_/, "") ?? "";
}
