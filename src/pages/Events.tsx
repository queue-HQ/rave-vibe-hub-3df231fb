import { Link } from "react-router-dom";
import { Plus, Search, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Events = () => {
  const events = [
    {
      id: 1,
      title: "Neon Nights: Techno Takeover",
      date: "Dec 18, 2024",
      location: "Brooklyn Warehouse",
      attendees: 250,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    },
    {
      id: 2,
      title: "Bass in Your Face",
      date: "Dec 22, 2024",
      location: "Underground Club",
      attendees: 180,
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
    },
    {
      id: 3,
      title: "Rave Revolution",
      date: "Dec 15, 2024",
      location: "Secret Location",
      attendees: 320,
      status: "past",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
    },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">
              Manage your created and attending events
            </p>
          </div>
          <Link to="/create-event">
            <Button size="lg" className="font-bold">
              <Plus className="mr-2 h-5 w-5" />
              Create New Event
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-10 h-12"
            />
          </div>
          <select className="px-4 py-2 rounded-lg bg-secondary border border-border">
            <option>All Events</option>
            <option>Upcoming</option>
            <option>Past</option>
            <option>Hosting</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover-lift cursor-pointer group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge
                  className="absolute top-4 right-4"
                  variant={event.status === "upcoming" ? "default" : "secondary"}
                >
                  {event.status}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/event/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Button variant="default" className="flex-1">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
