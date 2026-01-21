import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/logout";
import logo from "@/assets/logo.png";
import { useUserProfile } from "@/context/UserProfileContext";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Ticket,
  Image as ImageIcon,
  Users,
  UserPlus,
  FileText,
  LogOut,
} from "lucide-react";

interface EditorSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function EditorSidebar({ isMobile = false, onClose }: EditorSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useUserProfile();

  const links = role === "partner"
    ? [
        { to: "/partner", label: "Dashboard", icon: LayoutDashboard },
        { to: "/partner/events", label: "Events", icon: Calendar },
        { to: "/partner/bookings", label: "Bookings", icon: Ticket },
      ]
    : [
        { to: "/editor", label: "Dashboard", icon: LayoutDashboard },
        { to: "/editor/events", label: "Events", icon: Calendar },
        { to: "/editor/events/new", label: "Add Event", icon: PlusCircle },
        { to: "/editor/posts", label: "Posts", icon: FileText },
        { to: "/editor/posts/new", label: "Add Post", icon: PlusCircle },
        { to: "/editor/bookings", label: "Bookings", icon: Ticket },
        { to: "/editor/media", label: "Media Gallery", icon: ImageIcon },
        { to: "/editor/users", label: "All Users", icon: Users },
        { to: "/editor/users/new", label: "Add User", icon: UserPlus },
        { to: "/editor/partners/new", label: "Add Partner", icon: UserPlus },
        { to: "/editor/partners", label: "Partner Lists", icon: Users },
        { to: "/editor/partners/access", label: "Partners Access", icon: Users },
      ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token_expiry");
    if (onClose) onClose();
    navigate("/");
  };

  return (
    <aside
      className={`fixed top-0 h-full w-72 bg-card border-r border-primary/20 p-6 shadow-xl ${
        isMobile ? "lg:hidden z-50" : "hidden lg:block"
      }`}
    >
      <div className={`mb-8 flex ${isMobile ? "justify-between items-center" : "justify-center"}`}>
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <img src={logo} alt="QHQ Logo" className="h-12" />
        </Link>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={onClose}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start text-base ${isActive ? "shadow" : ""}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-base text-destructive"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
