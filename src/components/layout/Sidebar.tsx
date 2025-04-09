
import { cn } from "@/lib/utils";
import { 
  BookIcon, 
  LayoutDashboardIcon, 
  SettingsIcon, 
  PencilIcon, 
  FolderKanbanIcon,
  HelpCircleIcon,
  LogOutIcon
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  end?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, to, end, onClick }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <aside className="w-64 border-r border-border bg-card h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">CourseGPT</h1>
      </div>
      
      <nav className="flex-1 px-3 py-2 space-y-1">
        <NavItem icon={LayoutDashboardIcon} label="Dashboard" to="/" end />
        <NavItem icon={FolderKanbanIcon} label="Modules" to="/modules" />
        <NavItem icon={BookIcon} label="Lesson Generator" to="/generator" />
        <NavItem icon={PencilIcon} label="Content Editor" to="/editor" />
        <NavItem icon={SettingsIcon} label="Settings" to="/settings" />
      </nav>
      
      <div className="p-3 mt-auto border-t border-border space-y-1">
        <NavItem icon={HelpCircleIcon} label="Help & Support" to="/help" />
        <NavItem icon={LogOutIcon} label="Logout" to="#" onClick={handleSignOut} />
      </div>
    </aside>
  );
};

export default Sidebar;
