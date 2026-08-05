import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import loginIllustration from "@/assets/login/feedback.png";
import { login, type TeacherProfile } from "@/api/auth";

const REMEMBERED_ACCOUNT_KEY = "bigread.remembered-account";

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21.25 9.14993C18.94 5.51993 15.56 3.42993 12 3.42993C10.22 3.42993 8.49 3.94993 6.91 4.91993C5.33 5.89993 3.91 7.32993 2.75 9.14993C1.75 10.7199 1.75 13.2699 2.75 14.8399C5.06 18.4799 8.44 20.5599 12 20.5599C13.78 20.5599 15.51 20.0399 17.09 19.0699C18.67 18.0899 20.09 16.6599 21.25 14.8399C22.25 13.2799 22.25 10.7199 21.25 9.14993ZM12 16.0399C9.76 16.0399 7.96 14.2299 7.96 11.9999C7.96 9.76993 9.76 7.95993 12 7.95993C14.24 7.95993 16.04 9.76993 16.04 11.9999C16.04 14.2299 14.24 16.0399 12 16.0399Z"
        fill="#171717"
      />
      <path
        d="M11.9999 9.13989C10.4299 9.13989 9.1499 10.4199 9.1499 11.9999C9.1499 13.5699 10.4299 14.8499 11.9999 14.8499C13.5699 14.8499 14.8599 13.5699 14.8599 11.9999C14.8599 10.4299 13.5699 9.13989 11.9999 9.13989Z"
        fill="#171717"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M21.2699 9.18005C20.9799 8.72005 20.6699 8.29005 20.3499 7.89005C19.9799 7.42005 19.2799 7.38005 18.8599 7.80005L15.8599 10.8001C16.0799 11.4601 16.1199 12.2201 15.9199 13.0101C15.5699 14.4201 14.4299 15.5601 13.0199 15.9101C12.2299 16.1101 11.4699 16.0701 10.8099 15.8501C10.8099 15.8501 9.37995 17.2801 8.34995 18.3101C7.84995 18.8101 8.00995 19.6901 8.67995 19.9501C9.74995 20.3601 10.8599 20.5701 11.9999 20.5701C13.7799 20.5701 15.5099 20.0501 17.0899 19.0801C18.6999 18.0801 20.1499 16.6101 21.3199 14.74C22.2699 13.2301 22.2199 10.6901 21.2699 9.18005Z"
        fill="#171717"
      />
      <path
        d="M14.0201 9.97989L9.98014 14.0199C9.47014 13.4999 9.14014 12.7799 9.14014 11.9999C9.14014 10.4299 10.4201 9.13989 12.0001 9.13989C12.7801 9.13989 13.5001 9.46989 14.0201 9.97989Z"
        fill="#171717"
      />
      <path
        d="M18.25 5.74993L14.86 9.13993C14.13 8.39993 13.12 7.95993 12 7.95993C9.76 7.95993 7.96 9.76993 7.96 11.9999C7.96 13.1199 8.41 14.1299 9.14 14.8599L5.76 18.2499H5.75C4.64 17.3499 3.62 16.1999 2.75 14.8399C1.75 13.2699 1.75 10.7199 2.75 9.14993C3.91 7.32993 5.33 5.89993 6.91 4.91993C8.49 3.95993 10.22 3.42993 12 3.42993C14.23 3.42993 16.39 4.24993 18.25 5.74993Z"
        fill="#171717"
      />
      <path d="M14.8601 12.0001C14.8601 13.5701 13.5801 14.8601 12.0001 14.8601C11.9401 14.8601 11.8901 14.8601 11.8301 14.8401L14.8401 11.8301C14.8601 11.8901 14.8601 11.9401 14.8601 12.0001Z" fill="#171717" />
      <path
        d="M21.7699 2.22988C21.4699 1.92988 20.9799 1.92988 20.6799 2.22988L2.22988 20.6899C1.92988 20.9899 1.92988 21.4799 2.22988 21.7799C2.37988 21.9199 2.56988 21.9999 2.76988 21.9999C2.96988 21.9999 3.15988 21.9199 3.30988 21.7699L21.7699 3.30988C22.0799 3.00988 22.0799 2.52988 21.7699 2.22988Z"
        fill="#171717"
      />
    </svg>
  );
}

export function LoginPage({ onLogin }: { onLogin: (profile: TeacherProfile) => void }) {
  const [account, setAccount] = useState(() => localStorage.getItem(REMEMBERED_ACCOUNT_KEY) ?? "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_ACCOUNT_KEY)));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!account.trim() || !password) {
      setError("请输入账号和密码");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const profile = await login({ account: account.trim(), password });
      if (remember) {
        localStorage.setItem(REMEMBERED_ACCOUNT_KEY, account.trim());
      } else {
        localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
      }
      onLogin(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后重试");
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-illustration" aria-hidden="true">
        <img src={loginIllustration} alt="" />
      </div>
      <div className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>【BigRead】管理平台</h1>
          <label className="login-field">
            <span>用户账号</span>
            <input
              type="text"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="请输入账号"
              autoComplete="username"
            />
          </label>
          <label className="login-field login-password">
            <span>密码</span>
            <div className="login-password-control">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>
          <label className="login-remember">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
            <span>记住账号</span>
          </label>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "登录中…" : "登录"}
          </Button>
        </form>
      </div>
    </div>
  );
}
