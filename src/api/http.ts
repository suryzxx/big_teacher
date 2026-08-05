import { getToken } from "./session";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** 后端基础地址：测试/正式环境由 VITE_API_BASE_URL 区分，见 .env.* */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

/** /constants 等不带 /teacher 前缀的根路径接口使用 */
export const CONSTANTS_BASE_URL = API_BASE_URL.replace(/\/teacher\/?$/, "");

type ApiEnvelope<T> = {
  code: number;
  msg?: string;
  data: T;
};

/**
 * 后端统一返回 { code, msg, data }：
 * - code === 200 表示成功，直接解包出 data；
 * - 其他 code 抛出 ApiError，message 使用服务端 msg（如“账号或密码错误”）。
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  // FormData 上传时由浏览器自动带 multipart boundary，不能手动指定 Content-Type。
  if (!(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    // 后端约定 Authorization 直接携带 token（不带 Bearer 前缀）。
    headers.Authorization = token;
  }

  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // Non-JSON error body; keep null.
    }
    const message = (body as { msg?: string } | null)?.msg ?? `Request failed: ${response.status} ${path}`;
    throw new ApiError(message, response.status, body);
  }

  const body = (await response.json()) as ApiEnvelope<T>;
  if (body.code !== 200) {
    throw new ApiError(body.msg ?? `Request failed: ${body.code} ${path}`, body.code, body);
  }
  return body.data;
}
