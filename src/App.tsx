import { useRef, useState } from "react";
import { ChevronDown, LibraryBig, LogOut, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api";
import { studentAvatarImages } from "@/assets/mock/students";
import { LibraryView } from "@/components/library/LibraryView";
import { ClassView } from "@/components/my-class/ClassView";
import { useApi } from "@/hooks/useApi";
import { useClickOutside } from "@/lib/useClickOutside";

export function App() {
  const { data: classes = [] } = useApi(() => api.getClasses());
  const [activeView, setActiveView] = useState<"library" | "myclass">("library");
  const [topClassName, setTopClassName] = useState("");
  const [classSwitcherOpen, setClassSwitcherOpen] = useState(false);
  const classSwitcherRef = useRef<HTMLDivElement | null>(null);
  const displayClassName = topClassName || classes[0]?.name || "Class";

  useClickOutside(classSwitcherRef, classSwitcherOpen, () => setClassSwitcherOpen(false));

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
                <Button type="button" variant="ghost" size="icon-sm" className="teacher-logout-button" aria-label="Log out" onClick={() => setClassSwitcherOpen(false)}>
                  <LogOut size={16} />
                </Button>
              </span>
              <span className="teacher-profile-copy">
                <strong>Ms. Charlotte Bennett</strong>
                <button type="button" className="teacher-class-trigger" aria-label="Switch class" aria-haspopup="listbox" aria-expanded={classSwitcherOpen} onClick={() => setClassSwitcherOpen((open) => !open)}>
                  <span>{displayClassName}</span>
                  <ChevronDown size={16} />
                </button>
              </span>
            </div>
            {classSwitcherOpen && (
              <div className="teacher-class-menu" role="listbox" aria-label="Class options">
                {classes.map((classRoom) => (
                  <button key={classRoom.id} type="button" className="teacher-class-option" data-active={classRoom.name === displayClassName} role="option" aria-selected={classRoom.name === displayClassName} onClick={() => { setTopClassName(classRoom.name); setClassSwitcherOpen(false); }}>
                    {classRoom.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {activeView === "library" ? <LibraryView /> : <ClassView />}
      </section>
    </div>
  );
}
