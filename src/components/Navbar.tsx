import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { isAuthenticated } from "@/lib/auth";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react"; // hamburger & close icons

export const Navbar = () => {
  const isAuth = isAuthenticated();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-primary/30 z-50 shadow-[0_0_20px_hsl(330_81%_60%_/_0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Desktop Menu */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="QHQ Logo" className="h-12" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-6 mx-7">
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

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-4">
          {isAuth ? (
            <Link to="/dashboard">
              <Button size="lg" className="font-bold">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-primary/30 px-6 py-4 space-y-4">
          <Link
            to="/events"
            className="block hover:text-[#DD4390]"
            onClick={() => setIsOpen(false)}
          >
            Events
          </Link>
          <Link
            to="/blogs"
            className="block hover:text-[#DD4390]"
            onClick={() => setIsOpen(false)}
          >
            Blogs
          </Link>
          <Link
            to="/contact"
            className="block hover:text-[#DD4390]"
            onClick={() => setIsOpen(false)}
          >
            Contact Us
          </Link>

          {isAuth ? (
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              <Button size="lg" className="w-full font-bold">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="lg" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <Button size="lg" className="w-full font-bold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
