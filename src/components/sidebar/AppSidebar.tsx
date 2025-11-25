import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  User,
  Settings,
  LogOut,
  Home,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { logout } from "@/lib/logout";

interface AppSidebarProps {
  isMobile?: boolean;
  onClose?: () => void; // optional callback for mobile close
}

export default function AppSidebar({
  isMobile = false,
  onClose,
}: AppSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onClose) onClose(); // close mobile sidebar
    navigate("/");
  };

  return (
    <aside
      className={`fixed top-0 h-full w-64 bg-card border-r border-primary/20 p-6 shadow-lg ${
        isMobile ? "lg:hidden z-50" : "hidden lg:block"
      }`}
    >
      <div className={`mb-8 flex ${isMobile ? "justify-between" : ""}`}>
        <Link to="/" onClick={onClose}>
          <img src={logo} alt="QHQ Logo" className="h-16" />
        </Link>
        {isMobile && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X /> {/* You can use X icon here */}
          </Button>
        )}
      </div>

      <nav className="space-y-2">
        <Link to="/dashboard" onClick={onClose}>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
        </Link>

        <Link to="/dashboard/profile" onClick={onClose}>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <User className="mr-3 h-5 w-5" />
            My Profile
          </Button>
        </Link>

        <Link to="/events" onClick={onClose}>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Calendar className="mr-3 h-5 w-5" />
            My Events
          </Button>
        </Link>

        <Link to="/dashboard/tickets" onClick={onClose}>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Ticket className="mr-3 h-5 w-5" />
            Bookings
          </Button>
        </Link>

        {/* <Link to="/settings" onClick={onClose}>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Button>
        </Link> */}

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-lg text-destructive"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </nav>
    </aside>
  );
}
