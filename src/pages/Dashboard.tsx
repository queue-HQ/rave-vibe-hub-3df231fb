import { Link, useNavigate } from "react-router-dom";
import { Calendar, Ticket, User, Settings, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { logout } from "@/lib/logout";

const Dashboard = () => {
  const userName = "Alex";

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-primary/20 p-6 hidden lg:block shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
        <div className="mb-8">
          <img src={logo} alt="QHQ Logo" className="h-16" />
        </div>

        <nav className="space-y-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-lg">
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" className="w-full justify-start text-lg">
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="ghost" className="w-full justify-start text-lg">
              <Calendar className="mr-3 h-5 w-5" />
              My Events
            </Button>
          </Link>
          <Link to="/tickets">
            <Button variant="ghost" className="w-full justify-start text-lg">
              <Ticket className="mr-3 h-5 w-5" />
              Tickets
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start text-lg">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </Link>
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

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="text-primary">{userName}</span> 🎉
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to discover the underground scene?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="gradient-card neon-border hover-lift bg-gradient-to-br from-primary/10 via-card to-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Events</span>
                  <Calendar className="h-6 w-6 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Next event in 3 days
                </p>
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
                <p className="text-4xl font-bold text-accent">12</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ready to party
                </p>
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
                <p className="text-4xl font-bold">3</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You're a host!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
