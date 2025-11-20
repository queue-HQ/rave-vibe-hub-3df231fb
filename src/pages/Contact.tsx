import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, SendHorizontal } from "lucide-react";
import logo from "@/assets/logo.png";

const ContactPage = () => {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: connect to backend endpoint
    console.log("Contact form submitted", formState);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(330_81%_60%_/_0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_hsl(330_81%_60%_/_0.15)_60deg,_transparent_180deg)] opacity-40" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <Badge className="px-6 py-2 text-sm uppercase tracking-[0.3em] bg-primary/20 text-primary">Contact</Badge>
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Let's craft the next <span className="text-primary">underground</span> moment.
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Whether you're curating a rave, launching a collab, or just want to vibe with the QHQ crew, drop us a line.
            We'll get back faster than the bass drops.
          </p>
        </div>
      </section>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 mt-[60px]">
        <Card className="bg-card/70 backdrop-blur">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Send us a message</h2>
              <p className="text-muted-foreground">We typically respond within 24 hours.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  placeholder="Your name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                name="subject"
                placeholder="Subject"
                value={formState.subject}
                onChange={handleChange}
              />

              <Textarea
                name="message"
                placeholder="Tell us about your idea, event, or project"
                className="min-h-[150px]"
                value={formState.message}
                onChange={handleChange}
                required
              />

              <Button type="submit" className="w-full h-12 text-lg font-semibold">
                <SendHorizontal className="h-5 w-5 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/70 backdrop-blur">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Talk to a human</h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p>hello@qhq.studio</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <p>+92 300 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Studio</p>
                    <p>Karachi • Lahore • Remote</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Booking & Collaborations</h3>
              <p>
                Need QHQ for an event, immersive experience, or creative direction? We're down for bold ideas and
                late-night brainstorms.
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <a href="mailto:bookings@qhq.studio">bookings@qhq.studio</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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

export default ContactPage;
