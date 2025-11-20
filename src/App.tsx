import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "@/components/PublicRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Verify from "@/pages/Verify";
import Events from "@/pages/Events";
import Event from "@/pages/Event";
import Ticket from "@/pages/Ticket";
import NotFound from "@/pages/NotFound";
import WaitingApproval from "@/pages/WaitingApproval";
import OTPVerify from "@/pages/OTPVerify";
import SetupProfile from "@/pages/SetupProfile";
import EventsPage from "@/pages/EventsPage";
import SignleEventPage from "@/pages/SignleEventPage";
import PostsPage from "@/pages/PostsPage";
import SinglePostPage from "@/pages/SinglePostPage";
import ContactPage from "@/pages/Contact";
import { EventsProvider } from "@/context/EventsContext";
import { PostsProvider } from "@/context/PostsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <EventsProvider>
        <PostsProvider>
          <BrowserRouter>
          <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:slug" element={<SignleEventPage />} />
          <Route path="/blogs" element={<PostsPage />} />
          <Route path="/blog/:slug" element={<SinglePostPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route
            path="/waiting-approval"
            element={
              <PublicRoute>
                <WaitingApproval />
              </PublicRoute>
            }
          />

          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <OTPVerify />
              </PublicRoute>
            }
          />

          <Route
            path="/setup-profile"
            element={
              <PublicRoute>
                <SetupProfile />
              </PublicRoute>
            }
          />

          <Route path="/dashboard-events" element={<Events />} />
          <Route path="/dashboard-event/:id" element={<Event />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify"
            element={
              <ProtectedRoute>
                <Verify />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ticket/:id"
            element={
              <ProtectedRoute>
                <Ticket />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </PostsProvider>
      </EventsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
