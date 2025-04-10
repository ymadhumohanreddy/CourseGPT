import {
  BookIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  PencilIcon,
  FolderKanbanIcon,
  HelpCircleIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const topNavLinks = [
  { icon: LayoutDashboardIcon, label: "Dashboard", to: "/" },
  { icon: FolderKanbanIcon, label: "Modules", to: "/modules" },
  { icon: BookIcon, label: "Lesson Generator", to: "/generator" },
  { icon: PencilIcon, label: "Content Editor", to: "/editor" },
  { icon: SettingsIcon, label: "Settings", to: "/settings" },
];

const bottomNavLinks = [
  { icon: HelpCircleIcon, label: "Help & Support", to: "/help" },
];

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const renderNavLink = (item: { icon: any; label: string; to: string }) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )
      }
    >
      <item.icon className="h-5 w-5" />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-full bg-card border-r border-border p-4 justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary mb-6">CourseGPT</h1>
          <nav className="space-y-2">
            {topNavLinks.map(renderNavLink)}
          </nav>
        </div>

        <div className="space-y-2">
          {bottomNavLinks.map(renderNavLink)}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOutIcon className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4">
        <button onClick={() => setIsOpen(true)}>
          <MenuIcon className="h-6 w-6 text-primary" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="fixed left-0 top-0 w-64 h-full bg-card border-r border-border p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-primary">CourseGPT</h1>
                <button onClick={() => setIsOpen(false)}>
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="space-y-2">
                {topNavLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="space-y-2">
              {bottomNavLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={async () => {
                  await handleSignOut();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LogOutIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
