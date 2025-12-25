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
import { useToast } from "@/hooks/use-toast";

const SignleEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { events, isLoading, error, refetch } = useEvents();
  const { toast } = useToast();

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

  const capacityLimit = Number(event?.capacity_limit) || 0;
  const bookedTickets = Number(event?.booked_tickets) || 0;
  const availableTickets =
    typeof event?.available_tickets === "number"
      ? event.available_tickets
      : capacityLimit > 0
        ? Math.max(capacityLimit - bookedTickets, 0)
        : null;
  const isSoldOut =
    typeof availableTickets === "number" && availableTickets <= 0;

  const organizerInfo =
    event && typeof event === "object" && typeof event.organizer === "object"
      ? (event.organizer as { name?: string; tagline?: string; avatar?: string })
      : null;

  const organizerName = organizerInfo?.name?.trim() || event?.created_by || "QHQ Events";
  const organizerTagline = organizerInfo?.tagline?.trim() || event?.address || "Event host";
  const organizerAvatar = organizerInfo?.avatar?.trim()
    ? organizerInfo.avatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(organizerName ?? "organizer")}`;
  const organizerInitials = organizerName
    ? organizerName
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "QH";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBuyTicketClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (isSoldOut) {
      e.preventDefault();
      toast({
        title: "Tickets unavailable",
        description: "This event is sold out.",
        variant: "destructive",
      });
    }
  };

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

     console.log('relatedEvents', relatedEvents)

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
      <div className="relative h-[330px] sm:h-80 md:h-96 overflow-hidden">
        <img
          src={heroImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">

            {/* Badge */}
            <Badge className="mb-3 sm:mb-4 text-sm sm:text-base md:text-lg px-3 sm:px-4 py-1 capitalize">
              {checkEventStatus(event?.date, event?.time)}
            </Badge>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
              {event.title}
            </h1>

            {/* Details */}
            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-base md:text-lg">
              {event.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{event.date}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{event.time}</span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
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
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.name ?? "artist"
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

            {/* Related Event */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
                {relatedEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedEvents.map((item) => (
                      <Link
                        key={item.id}
                        to={`/event/${item.slug ?? slugify(String(item.title ?? item.id))
                          }`}
                        className="group block"
                      >
                        <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                          <img
                            src={
                              item.image ??
                              item.feature_image ??
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
         {/* Sidebar */}
<div className="lg:col-span-1">
  <div className="space-y-6 sticky top-[100px] self-start max-h-[calc(100vh-100px)] overflow-y-auto">
    {/* Ticket Card */}
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl font-bold text-primary">
            PKR {event?.price}
          </span>
        </div>

      

        {checkEventStatus(event?.date, event?.time) !== "past" && (
          <Link to={`/book-ticket/${event.id}`} onClick={handleBuyTicketClick}>
            <Button className="w-full h-12 text-lg font-bold">
              {isSoldOut ? "Sold Out" : "Buy Ticket"}
            </Button>
          </Link>
        )}

        <div className="pt-4 border-t border-border space-y-3">

           {/* {capacityLimit ? (
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {Math.max(availableTickets ?? 0, 0)} seats left / {capacityLimit} total
              </span>
            </div>
            {isSoldOut && (
              <p className="text-xs text-destructive">Sold out</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event?.attending_peoples}</span>
          </div>
        )} */}


        {capacityLimit && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{Math.max(availableTickets ?? 0, 0)} ticket left / {capacityLimit} total</span>
            </div>
          )}
          {/* {event?.attending_peoples && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{event?.attending_peoples}</span>
            </div>
          )} */}
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
            <AvatarImage src={organizerAvatar} />
            <AvatarFallback>{organizerInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{organizerName}</p>
            {organizerTagline && (
              <p className="text-sm text-muted-foreground">
                {organizerTagline}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

        </div>
      </div>
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl gradient-card neon-border bg-gradient-to-br from-primary/30 via-card to-card shadow-[0_0_60px_hsl(330_81%_60%_/_0.4)]">

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Think You Belong Here?
            </h2>

            <p className="text-xl text-muted-foreground mb-8">
              Stand in the right line.
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
                Join The Queue
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
