import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Zap,
  Sparkles,
  Music,
  DollarSign,
  Share2,
  Clock,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Input } from "@/components/ui/input";
import { useEvents } from "@/context/EventsContext";
import slugify from "@/lib/slugify";
import { checkEventStatus } from "@/lib/utils";

const EventsPage = () => {
  const { events, isLoading, error } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const hasEvents = events.length > 0;

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const eventStatus = checkEventStatus(event?.date, event?.time);
      const matchesStatus =
        statusFilter === "all" || eventStatus === statusFilter;

      const searchableFields = [event.title, event.venue, event.location];
      const matchesSearch =
        query.length === 0 ||
        searchableFields.some((field) =>
          typeof field === "string"
            ? field.toLowerCase().includes(query)
            : false
        );

      return matchesStatus && matchesSearch;
    });
  }, [events, searchQuery, statusFilter]);

  const hasFilteredEvents = filteredEvents.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.3)_0%,_transparent_60%)] animate-pulse-neon" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.2)_45deg,_transparent_90deg)] opacity-40" />

        <div className="max-w-6xl mx-auto text-center relative">
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            Where the Underground
            <br />
            <span className="text-primary neon-text">Evolves</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Find exclusive underground events and step into the future of
            nightlife.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6 h-auto font-bold">
                <Sparkles className="mr-2 h-5 w-5" />
                Join the Movement
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto mt-[50px]">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-lg bg-secondary border border-border"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && !hasEvents && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              Loading events...
            </div>
          )}

          {error && !isLoading && (
            <div className="col-span-full text-center text-destructive py-12">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasEvents && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No events available right now. Check back later!
            </div>
          )}

          {!isLoading && !error && hasEvents && !hasFilteredEvents && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No events match your search or filters.
            </div>
          )}

          {filteredEvents.map((event) => {
            const eventSlug =
              event.slug ??
              (event.title ? slugify(String(event.title)) : String(event.id));
            const eventStatus = checkEventStatus(event?.date, event?.time);

            return (
              <Card
                key={event.id}
                className="overflow-hidden hover-lift cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      event.feature_image ??
                      event.feature_image ??
                      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
                    }
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  <Badge
                    className="absolute top-4 right-4 capitalize"
                    variant={
                      event.status === "upcoming" ? "default" : "secondary"
                    }
                  >
                    {eventStatus}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {(event.date || event.start_date) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date ?? event.start_date}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                    {event.attending_peoples && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attending_peoples}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/event/${eventSlug}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

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

export default EventsPage;
