import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Zap, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { Navbar } from "@/components/Navbar";
import { isAuthenticated } from "@/lib/auth";
import HomePageEvents from "@/components/HomePageEvents";
import HomePageBlogs from "@/components/HomePageBlogs";
import Footer from "@/components/Footer";

const Index = () => {
  const isAuth = isAuthenticated();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.3)_0%,_transparent_60%)] animate-pulse-neon" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.2)_45deg,_transparent_90deg)] opacity-40" />

        <div className="max-w-6xl mx-auto text-center relative">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            The Underground
            <br />
            <span className="
  text-primary
  md:neon-text          
  max-md:neon-text-mobile
">Awaits</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto">
            Discover exclusive underground raves, connect with the scene, and
            experience the pulse of the night.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="text-sm sm:text-base px-4 sm:px-8 py-3 sm:py-[20px] h-auto font-bold flex items-center justify-center w-full"
              >
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Join the Movement
              </Button>
            </Link>
            <Link to="/events" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="text-sm sm:text-base px-4 sm:px-8 py-3 sm:py-[20px] h-auto w-full sm:w-auto"
              >
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <HomePageEvents />

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background via-card/20 to-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Why <span className="text-primary">QHQ</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl cursor-default gradient-card neon-border hover-lift shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Exclusive Events</h3>
              <p className="text-muted-foreground">
                Access underground raves and secret locations that you won't
                find anywhere else.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl cursor-default gradient-card neon-border hover-lift shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with like-minded ravers and build your crew in the
                underground scene.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl cursor-default gradient-card neon-border hover-lift shadow-[0_0_30px_hsl(330_81%_60%_/_0.1)]">
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

      {/* Latest Blogs Section */}
      <HomePageBlogs />

     {/* CTA Section */}
     <section className="py-20 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <div className="p-12 rounded-3xl gradient-card neon-border bg-gradient-to-br from-primary/30 via-card to-card shadow-[0_0_60px_hsl(330_81%_60%_/_0.4)]">
      
      <h2 className="text-3xl md:text-5xl font-bold mb-6">
        Ready to Dive In?
      </h2>

      <p className="text-xl text-muted-foreground mb-8">
        Join thousands of ravers already vibing with QHQ
      </p>

      <Link to="/signup">
        <Button
          size="lg"
          className="
            font-bold
            h-auto
            px-6 py-3 text-base        /* Mobile */
            sm:px-12 sm:py-[20px] sm:text-lg   /* Desktop */
          "
        >
          Get Started Now
        </Button>
      </Link>

    </div>
  </div>
</section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
