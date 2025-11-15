import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Zap, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { isAuthenticated } from "@/lib/auth";

const Index = () => {
  const isAuth = isAuthenticated();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-primary/30 z-50 shadow-[0_0_20px_hsl(330_81%_60%_/_0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={logo} alt="QHQ Logo" className="h-12" />

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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.3)_0%,_transparent_60%)] animate-pulse-neon" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.2)_45deg,_transparent_90deg)] opacity-40" />

        <div className="max-w-6xl mx-auto text-center relative">
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            The Underground
            <br />
            <span className="text-primary neon-text">Awaits</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover exclusive underground raves, connect with the scene, and
            experience the pulse of the night.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 h-auto font-bold">
                <Sparkles className="mr-2 h-5 w-5" />
                Join the Movement
              </Button>
            </Link>
            <Link to="/events">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto"
              >
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background via-card/20 to-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why <span className="text-primary">QHQ</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl gradient-card neon-border hover-lift shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Exclusive Events</h3>
              <p className="text-muted-foreground">
                Access underground raves and secret locations that you won't
                find anywhere else.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl gradient-card neon-border hover-lift shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with like-minded ravers and build your crew in the
                underground scene.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl gradient-card neon-border hover-lift shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Instant Tickets</h3>
              <p className="text-muted-foreground">
                Secure your spot with digital tickets delivered instantly to
                your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl gradient-card neon-border bg-gradient-to-br from-primary/30 via-card to-card shadow-[0_0_60px_hsl(330_81%_60%_/_0.4)]">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Dive In?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of ravers already vibing with QHQ
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-lg px-12 py-6 h-auto font-bold">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <img src={logo} alt="QHQ Logo" className="h-12 mx-auto mb-6" />
          <p>© 2024 QHQ. All rights reserved. Stay underground.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
