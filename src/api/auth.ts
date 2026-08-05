import { apiRequest } from "./http";
import { clearSession, setStoredProfile, setToken } from "./session";
import type { TeacherProfile } from "@/types";

export type { TeacherProfile } from "@/types";

export type LoginParams = {
  account: string;
  password: string;
};

/**
 * 教师登录：POST /open/login
 * 成功时保存 token，供后续接口通过 Authorization 头携带。
 */
export async function login(params: LoginParams): Promise<TeacherProfile> {
  const profile = await apiRequest<TeacherProfile>("/open/login", {
    method: "POST",
    body: JSON.stringify(params),
  });
  setToken(profile.token);
  setStoredProfile(profile);
  return profile;
}

export function logout(): void {
  clearSession();
}
