import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { isAuthenticated } from "@/lib/auth";
import { Button } from "./ui/button";

export const Navbar = () => {
  const isAuth = isAuthenticated();

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-primary/30 z-50 shadow-[0_0_20px_hsl(330_81%_60%_/_0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="QHQ Logo" className="h-12" />
          </Link>
          <div className="mx-7 flex gap-6">
            <Link to="/events" className="hover:text-[#DD4390]">
              Events
            </Link>
            <Link to="/blogs" className="hover:text-[#DD4390]">
              Blogs
            </Link>
            <Link to="/contact" className="hover:text-[#DD4390]">
              Contact Us
            </Link>
          </div>
        </div>

        {isAuth ? (
          <div className="flex gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="font-bold">
                Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" size="lg">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" className="font-bold">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
