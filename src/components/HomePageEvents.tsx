import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { useEvents } from "@/context/EventsContext";
import { checkEventStatus } from "@/lib/utils";

function HomePageEvents() {
  const { events, isLoading, error } = useEvents();

  if (isLoading) {
    return (
      <section className="py-20 px-6 text-center">
        <p className="text-lg text-muted-foreground">Loading events...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-6 text-center">
        <p className="text-lg text-red-500">Failed to load events.</p>
      </section>
    );
  }

  // Filter upcoming events only
  //   const upcomingEvents = events
  //     .filter((event) => new Date(event.date) >= new Date()) // future events
  //     .sort((a, b) => new Date(a.date) - new Date(b.date)) // sort ascending
  //     .slice(0, 3); // first 3 events

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date()) // future events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // sort ascending
    .slice(0, 3); // first 3 events

  return (
    <section className="pt-20 px-6">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
        Upcoming <span className="text-primary">Events</span>
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {upcomingEvents.map((event) => {
          const eventSlug = event.slug;
          const eventStatus = checkEventStatus(event?.date, event?.time);

          return (
            // <Card
            //   key={event.id}
            //   className="overflow-hidden hover-lift cursor-pointer group"
            // >
            //   <div className="relative h-48 overflow-hidden">
            //     <img
            //       src={
            //         event.feature_image ??
            //         "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
            //       }
            //       alt={event.title}
            //       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            //     />
            //     <Badge
            //       className="absolute top-4 right-4 capitalize"
            //       variant="default"
            //     >
            //       upcoming
            //     </Badge>
            //   </div>

            //   <CardContent className="p-6">
            //     <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
            //       {event.title}
            //     </h3>

            //     <div className="space-y-2 text-sm text-muted-foreground mb-4">
            //       {event.date && (
            //         <div className="flex items-center gap-2">
            //           <Calendar className="h-4 w-4" />
            //           <span>{event.date}</span>
            //         </div>
            //       )}
            //       {event.venue && (
            //         <div className="flex items-center gap-2">
            //           <MapPin className="h-4 w-4" />
            //           <span>{event.venue}</span>
            //         </div>
            //       )}
            //       {event.attending_peoples && (
            //         <div className="flex items-center gap-2">
            //           <Users className="h-4 w-4" />
            //           <span>{event.attending_peoples}</span>
            //         </div>
            //       )}
            //     </div>

            //     <div className="flex gap-2">
            //       <Link to={`/event/${eventSlug}`} className="flex-1">
            //         <Button variant="outline" className="w-full">
            //           View Details
            //         </Button>
            //       </Link>
            //     </div>
            //   </CardContent>
            // </Card>

             <Card
              key={event.id}
              className="overflow-hidden hover-lift  group flex flex-col h-full"
            >
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={
                    event.feature_image ??
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
            
                <Badge
                  className="absolute top-4 right-4 capitalize cursor-default"
                  variant={event.status === "upcoming" ? "default" : "secondary"}
                >
                  {eventStatus}
                </Badge>
              </div>
            
              <CardContent className="p-6 flex flex-col flex-1">
                <Link to={`/event/${eventSlug}`}><h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {event.title}
                </h3></Link>
            
                <div className="space-y-2 text-sm text-muted-foreground mb-4 cursor-default">
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
            
                <div className="mt-auto flex gap-2">
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

      {/* View More Button */}
      <div className="flex justify-center mt-12">
        <Link to="/events">
          <Button size="lg" className="text-lg px-8 py-[20px] h-auto font-bold">
            View More
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default HomePageEvents;
