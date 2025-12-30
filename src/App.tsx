import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicRoute from "@/components/PublicRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
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
import { UserProfileProvider } from "@/context/UserProfileContext";
import BookTicket from "@/pages/BookTicket";
import UserTickets from "@/pages/UserTickets";
import TicketView from "@/pages/TicketView";
import TicketScan from "@/pages/TicketScan";
import EditorDashboard from "@/pages/editor/EditorDashboard";
import EditorEvents from "@/pages/editor/EditorEvents";
import EditorEventForm from "@/pages/editor/EditorEventForm";
import EditorBookings from "@/pages/editor/EditorBookings";
import EditorUsers from "@/pages/editor/EditorUsers";
import EditorUserForm from "@/pages/editor/EditorUserForm";
import EditorViewUserDetails from "@/pages/editor/EditorViewUserDetails";
import EditorMedia from "@/pages/editor/EditorMedia";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <EventsProvider>
          <PostsProvider>
            <UserProfileProvider>
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
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />

              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
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
                path="/book-ticket/:id"
                element={
                  <ProtectedRoute>
                    <BookTicket />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/tickets"
                element={
                  <ProtectedRoute>
                    <UserTickets />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/view-ticket/:id"
                element={
                  <ProtectedRoute>
                    <TicketView />
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

              <Route path="/ticket-scan/:passId" element={<TicketScan />} />

              {/* EDITOR ROUTES */}
              <Route
                path="/editor"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorDashboard />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/events"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorEvents />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/events/new"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorEventForm />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/bookings"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorBookings />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/users"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorUsers />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/users/new"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorUserForm />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/users/:id"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorViewUserDetails />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editor/media"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowed={["administrator"]}>
                      <EditorMedia />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProfileProvider>
        </PostsProvider>
      </EventsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
