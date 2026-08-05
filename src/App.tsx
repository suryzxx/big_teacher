import { useEffect, useRef, useState } from "react";
import { ChevronDown, LibraryBig, LogOut, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { ApiError } from "@/api/http";
import { logout, type TeacherProfile } from "@/api/auth";
import { getStoredProfile, getToken } from "@/api/session";
import { studentAvatarImages } from "@/assets/mock/students";
import { LibraryView } from "@/components/library/LibraryView";
import { ClassView } from "@/components/my-class/ClassView";
import { LoginPage } from "@/components/auth/LoginPage";
import { DropdownMenu, DropdownMenuItem } from "@/components/shared/DropdownMenu";
import { useClickOutside } from "@/lib/useClickOutside";
import type { ClassRoom } from "@/types";

const ACTIVE_VIEW_KEY = "bigread.active-view";
const CURRENT_CLASS_KEY = "bigread.current-class-id";

function getInitialTeacher(): TeacherProfile | null {
  return getToken() ? getStoredProfile() : null;
}

export function App() {
  const [teacher, setTeacher] = useState<TeacherProfile | null>(getInitialTeacher);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [currentClass, setCurrentClass] = useState<ClassRoom | null>(null);
  const [activeView, setActiveView] = useState<"library" | "myclass">(() => {
    const stored = localStorage.getItem(ACTIVE_VIEW_KEY);
    return stored === "library" || stored === "myclass" ? stored : "myclass";
  });
  const [classSwitcherOpen, setClassSwitcherOpen] = useState(false);
  const classSwitcherRef = useRef<HTMLDivElement | null>(null);
  const restoreStarted = useRef(false);
  const displayClassName = currentClass?.name ?? "Class";

  useClickOutside(classSwitcherRef, classSwitcherOpen, () => setClassSwitcherOpen(false));

  // 记住当前所在页面，刷新后停留
  useEffect(() => {
    localStorage.setItem(ACTIVE_VIEW_KEY, activeView);
  }, [activeView]);

  // 登录成功或刷新恢复会话后：拉取一次班级列表，选中存储的班级，否则取第一条。
  useEffect(() => {
    if (!teacher || restoreStarted.current) return;
    restoreStarted.current = true;
    let cancelled = false;
    api
      .getClasses()
      .then((classList) => {
        if (cancelled) return;
        setClasses(classList);
        const storedId = localStorage.getItem(CURRENT_CLASS_KEY);
        const target = classList.find((classRoom) => String(classRoom.id) === storedId) ?? classList[0] ?? null;
        setCurrentClass(target);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.warn("加载班级列表失败", err);
        // token 失效时回到登录页
        if (err instanceof ApiError && err.status === 401) {
          handleLogout();
        }
      });
    return () => {
      cancelled = true;
    };
  }, [teacher]);

  function handleLogin(profile: TeacherProfile) {
    restoreStarted.current = false;
    setTeacher(profile);
  }

  function handleLogout() {
    restoreStarted.current = false;
    logout();
    localStorage.removeItem(CURRENT_CLASS_KEY);
    setClassSwitcherOpen(false);
    setClasses([]);
    setCurrentClass(null);
    setTeacher(null);
  }

  if (!teacher) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-frame">
      <section className="showcase-canvas">
        <div className="app-switcher">
          <div>
            <strong>Big Teacher</strong>
            <span>Teacher workspace</span>
          </div>
          <div className="app-tabs">
            <Button variant={activeView === "library" ? "default" : "ghost"} size="lg" onClick={() => setActiveView("library")}>
              <LibraryBig size={21} />
              Library
            </Button>
            <Button variant={activeView === "myclass" ? "default" : "ghost"} size="lg" onClick={() => setActiveView("myclass")}>
              <UsersRound size={21} />
              MyClass
            </Button>
          </div>
          <div className="teacher-profile-menu" ref={classSwitcherRef} data-open={classSwitcherOpen}>
            <div className="teacher-profile-anchor">
              <span className="teacher-avatar-wrap">
                <img src={studentAvatarImages[9]} alt="Teacher avatar" />
                <Button type="button" variant="ghost" size="icon-sm" className="teacher-logout-button" aria-label="Log out" onClick={handleLogout}>
                  <LogOut size={16} />
                </Button>
              </span>
              <span className="teacher-profile-copy">
                <strong>{teacher.name}</strong>
                <button type="button" className="teacher-class-trigger" aria-label="Switch class" aria-haspopup="listbox" aria-expanded={classSwitcherOpen} onClick={() => setClassSwitcherOpen((open) => !open)}>
                  <span>{displayClassName}</span>
                  <ChevronDown size={16} />
                </button>
              </span>
            </div>
            {classSwitcherOpen && (
              <DropdownMenu align="right" role="listbox" label="Class options">
                {classes.map((classRoom) => (
                  <DropdownMenuItem
                    key={classRoom.id}
                    selected={classRoom.id === currentClass?.id}
                    role="option"
                    aria-selected={classRoom.id === currentClass?.id}
                    onSelect={() => {
                      setCurrentClass(classRoom);
                      localStorage.setItem(CURRENT_CLASS_KEY, String(classRoom.id));
                      setClassSwitcherOpen(false);
                    }}
                  >
                    {classRoom.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
            )}
          </div>
        </div>
        {activeView === "library" ? <LibraryView /> : <ClassView />}
      </section>
    </div>
  );
}
