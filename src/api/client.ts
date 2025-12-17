// src/lib/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
