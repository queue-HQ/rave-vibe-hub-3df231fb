import React from "react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto text-center text-muted-foreground">
        <Link to="/">
          <img src={logo} alt="QHQ Logo" className="h-12 mx-auto mb-6" />
        </Link>
        <div className="mb-2">
          <a href="mailto:hello.jointhequeue@gmail.com">hello.jointhequeue@gmail.com</a>
        </div>
        <p>© 2025 QHQ. All rights reserved. Stay underground.</p>
      </div>
    </footer>
  );
};

export default Footer;
