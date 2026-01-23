import { useState } from "react";
import { Logs } from "lucide-react";
import logo from "@/assets/logo.png";
import EditorSidebar from "@/components/sidebar/EditorSidebar";

interface EditorLayoutProps {
  title?: string;
  children: React.ReactNode;
}

export default function EditorLayout({ title, children }: EditorLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden w-full p-4 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
        <img src={logo} className="h-10" alt="Logo" />
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="text-primary"
        >
          <Logs className="h-7 w-7" />
        </button>
      </div>

      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <EditorSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
        </>
      )}

      <EditorSidebar />

      <main className="ml-0 lg:ml-72 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {title && (
            <header>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-sm mt-1">Admin workspace</p>
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
