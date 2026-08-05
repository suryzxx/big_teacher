// 资源图片存放在阿里云 OSS，接口只返回相对路径（如 files/xxx.jpg），
// 展示时前面拼接 OSS 域名即可访问。
const OSS_BASE_URL = "https://aigc-file-hk.oss-accelerate.aliyuncs.com";

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  const trimmed = path.trim().replace(/^\/+/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${OSS_BASE_URL}/${trimmed}`;
}
