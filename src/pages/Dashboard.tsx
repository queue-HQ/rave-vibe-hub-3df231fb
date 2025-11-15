import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  User,
  Settings,
  LogOut,
  Home,
  X,
  Logs,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { logout } from "@/lib/logout";
import { getUserProfile } from "@/api/user";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AppSidebar from "@/components/sidebar/AppSidebar";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();

        if (res.success) {
          setUserName(res.user.display_name || res.user.username);
        } else {
          toast.error("Session expired!");
          logout();
          navigate("/");
        }
      } catch (err) {
        logout();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navbar */}
      <div className="lg:hidden w-full p-4 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
        <img src={logo} className="h-12" alt="Logo" />

        <span onClick={() => setMobileSidebarOpen(true)}>
          <Logs />
        </span>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <AppSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
        </>
      )}
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {loading ? (
              <>
                <Skeleton className="h-10 w-72 mb-3" />
                <Skeleton className="h-6 w-96" />
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, <span className="text-primary">{userName}</span>{" "}
                  🎉
                </h1>
                <p className="text-muted-foreground text-lg">
                  Ready to discover the underground scene?
                </p>
              </>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="gradient-card neon-border hover-lift bg-gradient-to-br from-primary/10 via-card to-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Events</span>
                  <Calendar className="h-6 w-6 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-32 mt-3" />
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-primary">5</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Next event in 3 days
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card neon-border hover-lift bg-gradient-to-br from-primary/10 via-card to-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tickets Owned</span>
                  <Ticket className="h-6 w-6 text-accent" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-4 w-24 mt-3" />
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-accent">12</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ready to party
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card neon-border hover-lift bg-gradient-to-br from-primary/5 via-card to-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Events Created</span>
                  <User className="h-6 w-6" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-4 w-28 mt-3" />
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You're a host!
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            Underground Rave #{i}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Dec {15 + i}, 2024 • Brooklyn Warehouse
                          </p>
                        </div>
                      </div>

                      <Link to={`/event/${i}`}>
                        <Button>View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
