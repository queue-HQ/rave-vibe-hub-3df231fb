import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Music,
  Share2,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useEvents } from "@/context/EventsContext";
import slugify from "@/lib/slugify";
import { checkEventStatus } from "@/lib/utils";
import Footer from "@/components/Footer";

const SignleEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { events, isLoading, error, refetch } = useEvents();

  const event = events.find((item) => {
    if (!slug) return false;

    if (item.slug) {
      return item.slug === slug;
    }

    if (item.title) {
      return slugify(String(item.title)) === slug;
    }

    return String(item.id) === slug;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const heroImage =
    event?.feature_image ??
    event?.feature_image ??
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200";

  const relatedEvents = useMemo(() => {
    if (!event) return [];

    const candidates = events.filter(
      (item) => String(item.id) !== String(event.id)
    );

    const byStatus = candidates.filter(
      (item) => event.status && item.status && item.status === event.status
    );

    const byLocation = candidates.filter(
      (item) =>
        event.location && item.location && item.location === event.location
    );

    const prioritized =
      byStatus.length > 0
        ? byStatus
        : byLocation.length > 0
        ? byLocation
        : candidates;

    return prioritized.slice(0, 2);
  }, [events, event]);

  if (isLoading && !event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={refetch}>Retry</Button>
            <Link to="/events">
              <Button variant="outline">Back to Events</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-muted-foreground">Event not found.</p>
            <Link to="/events">
              <Button variant="outline">Browse Events</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={heroImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-4 text-lg px-4 py-1 capitalize">
              {checkEventStatus(event?.date, event?.time)}
            </Badge>
            <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-lg">
              {event.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{event.date}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{event.time}</span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardContent className="p-6">
                {/* <h2 className="text-2xl font-bold mb-4">About This Event</h2> */}
                {event.description ? (
                  <div
                    className="text-muted-foreground leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    Event details are coming soon. Stay tuned for the full
                    experience.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Lineup */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Music className="h-6 w-6" />
                  Lineup
                </h2>
                {Array.isArray(event.lineups) && event.lineups.length > 0 ? (
                  <div className="space-y-4">
                    {event.lineups.map((artist: any) => (
                      <div
                        key={artist.id ?? artist.name}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            className="rounded-full"
                            src={
                              artist.profile_picture ??
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                artist.name ?? "artist"
                              }`
                            }
                          />
                          <AvatarFallback>
                            {artist.name?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">
                            {artist.name ?? "Unknown Artist"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {artist.content ?? "Performer"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Lineup details will be announced soon.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Related Events */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
                {relatedEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedEvents.map((item) => (
                      <Link
                        key={item.id}
                        to={`/event/${
                          item.slug ?? slugify(String(item.title ?? item.id))
                        }`}
                        className="group block"
                      >
                        <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                          <img
                            src={
                              item.image ??
                              item.featured_image ??
                              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
                            }
                            alt={item.title ?? "Related event"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          {item.status && (
                            <Badge
                              className="absolute top-2 right-2 capitalize"
                              variant="secondary"
                            >
                              {item.status}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold">
                          {item.title ?? "Untitled Event"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {(item.date ?? item.start_date) || "Date TBA"}
                          {item.location ? ` • ${item.location}` : ""}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    More events will appear here once similar vibes are
                    available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Card */}
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary">
                    PKR {event?.price}
                  </span>
                  {/* <Badge variant="secondary">
                    {event.attendees ?? 250} spots left
                  </Badge> */}
                </div>

                {checkEventStatus(event?.date, event?.time) == "past" ? (
                  ""
                ) : (
                  <Link to={`/book-ticket/${event.id}`}>
                    <Button className="w-full h-12 text-lg font-bold">
                      Buy Ticket
                    </Button>
                  </Link>
                )}

                {/* <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button> */}

                {/* <Button variant="ghost" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button> */}

                <div className="pt-4 border-t border-border space-y-3">
                  {event?.attending_peoples && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">
                        {event?.attending_peoples}
                      </span>
                    </div>
                  )}
                  {event?.event_duration && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{event?.event_duration}</span>
                    </div>
                  )}
                  {event?.event_type && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{event?.event_type} venue</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Organized by</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=organizer" />
                    <AvatarFallback>QH</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">QHQ Events</p>
                    <p className="text-sm text-muted-foreground">
                      Underground Collective
                    </p>
                  </div>
                </div>
                {/* <Button variant="outline" className="w-full mt-4">
                  Follow
                </Button> */}
              </CardContent>
            </Card>
          </div>
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
      <Footer />
    </div>
  );
};

export default SignleEventPage;
