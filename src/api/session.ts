import type { TeacherProfile } from "@/types";

const TOKEN_KEY = "bigread.token";
const PROFILE_KEY = "bigread.teacher";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredProfile(): TeacherProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TeacherProfile;
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: TeacherProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
