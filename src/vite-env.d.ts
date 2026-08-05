/// <reference types="vite/client" />

declare global {
  interface Window {
    /** 来自 OSS 上的 const.js：阅读类型选项 */
    READING_TYPE?: Array<{ label: string; value: string }>;
    /** 来自 OSS 上的 const.js：写作体裁选项 */
    WRITING_TYPE?: Array<{ label: string; value: string }>;
    /** 来自 OSS 上的 const.js：音视频学科选项 */
    RESOURCE_OTHER_TYPE?: Array<{ label: string; value: string }>;
  }

  interface ImportMetaEnv {
    readonly VITE_USE_MOCK?: string;
    readonly VITE_API_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
