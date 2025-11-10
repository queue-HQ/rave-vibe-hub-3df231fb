import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Share2, Clock, DollarSign, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Event = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200"
          alt="Event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-4 text-lg px-4 py-1">Upcoming</Badge>
            <h1 className="text-5xl font-bold mb-4">Neon Nights: Techno Takeover</h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>December 18, 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>10:00 PM - 4:00 AM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Brooklyn Warehouse, NY</span>
              </div>
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
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Get ready for the most electrifying techno experience of the year! 
                  Neon Nights brings together the underground's finest DJs for a night 
                  of pulsating beats and immersive visuals. This isn't just a party—it's 
                  a journey through sound.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Experience state-of-the-art sound systems, mind-bending light shows, 
                  and a crowd that lives and breathes the underground scene. Limited 
                  capacity ensures an intimate yet explosive atmosphere.
                </p>
              </CardContent>
            </Card>

            {/* Lineup */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Music className="h-6 w-6" />
                  Lineup
                </h2>
                <div className="space-y-4">
                  {["DJ Voltage", "Bass Queen", "Techno Prophet"].map((artist, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist}`} />
                        <AvatarFallback>{artist[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{artist}</p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 ? "Headliner" : "Supporting"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Events */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">You Might Also Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                        <img
                          src={`https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&sig=${i}`}
                          alt="Related event"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <h3 className="font-bold">Bass Revolution {i}</h3>
                      <p className="text-sm text-muted-foreground">Dec {20 + i}, 2024</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Card */}
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary">$45</span>
                  <Badge variant="secondary">250 spots left</Badge>
                </div>

                <Link to="/ticket/1">
                  <Button className="w-full h-12 text-lg font-bold">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Buy Ticket
                  </Button>
                </Link>

                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>

                <Button variant="ghost" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">250 people attending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">6 hours duration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Indoor venue</span>
                  </div>
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
                    <p className="text-sm text-muted-foreground">Underground Collective</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Follow
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event;
