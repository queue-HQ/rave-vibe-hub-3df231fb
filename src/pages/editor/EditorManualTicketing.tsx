import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EditorLayout from "@/components/layouts/EditorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  assignManualTicketToExistingUser,
  createUserAndAssignManualTicket,
  getAdminUsers,
  getManualTicketingUpcomingEvents,
  type ManualTicketingEvent,
  uploadPublicFile,
} from "@/api/admin";

type AdminUserLite = {
  id: number;
  username?: string;
  email?: string;
  display_name?: string;
  role?: string;
};

const initialCreateForm = {
  username: "",
  full_name: "",
  email: "",
  phone: "",
  gender: "",
  event_id: "",
  password: "",
};

export default function EditorManualTicketing() {
  const [events, setEvents] = useState<ManualTicketingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  const [existingSearch, setExistingSearch] = useState("");
  const [existingUsers, setExistingUsers] = useState<AdminUserLite[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedExistingEventId, setSelectedExistingEventId] = useState("");
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [assigningExisting, setAssigningExisting] = useState(false);

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [creatingAndAssigning, setCreatingAndAssigning] = useState(false);

  const selectedUser = useMemo(
    () => existingUsers.find((u) => String(u.id) === selectedUserId),
    [existingUsers, selectedUserId],
  );

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const res = await getManualTicketingUpcomingEvents();
      if (res?.success) {
        setEvents(res.data || []);
      } else {
        toast.error(res?.message || "Failed to load upcoming events");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load upcoming events");
    } finally {
      setEventsLoading(false);
    }
  };

  const searchUsers = async (query = existingSearch) => {
    try {
      setSearchingUsers(true);
      const res = await getAdminUsers({
        page: 1,
        per_page: 20,
        search: query.trim() || undefined,
        status: "approved",
      });
      if (res?.success) {
        const onlySubscribers = (res.data || []).filter((user: AdminUserLite) => {
          const role = String(user.role || "").toLowerCase();
          return role === "subscriber";
        });
        setExistingUsers(onlySubscribers);
      } else {
        toast.error(res?.message || "Failed to load users");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setSearchingUsers(false);
    }
  };

  useEffect(() => {
    loadEvents();
    searchUsers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssignExisting = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    if (!selectedExistingEventId) {
      toast.error("Please select an event");
      return;
    }

    try {
      setAssigningExisting(true);
      const res = await assignManualTicketToExistingUser({
        user_id: Number(selectedUserId),
        event_id: Number(selectedExistingEventId),
        status: "Confirm",
      });
      if (res?.success) {
        toast.success("Ticket assigned successfully");
        setSelectedExistingEventId("");
      } else {
        toast.error(res?.message || "Failed to assign ticket");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to assign ticket");
    } finally {
      setAssigningExisting(false);
    }
  };

  const handleCreateAndAssign = async (event: FormEvent) => {
    event.preventDefault();
    if (!createForm.username.trim() || !createForm.full_name.trim() || !createForm.email.trim()) {
      toast.error("Username, full name and email are required");
      return;
    }
    if (!createForm.password.trim()) {
      toast.error("Password is required");
      return;
    }
    if (!createForm.event_id) {
      toast.error("Please select an event");
      return;
    }

    try {
      setCreatingAndAssigning(true);
      let cnicPictureUrl = "";
      if (cnicFile) {
        const uploadRes = await uploadPublicFile(cnicFile);
        if (!uploadRes?.success || !uploadRes?.url) {
          toast.error(uploadRes?.message || "CNIC upload failed");
          return;
        }
        cnicPictureUrl = uploadRes.url;
      }

      const res = await createUserAndAssignManualTicket({
        username: createForm.username.trim(),
        full_name: createForm.full_name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        gender: createForm.gender,
        cnic_picture: cnicPictureUrl,
        event_id: Number(createForm.event_id),
        password: createForm.password,
        status: "Confirm",
      });

      if (res?.success) {
        toast.success("User created and ticket assigned");
        setCreateForm(initialCreateForm);
        setCnicFile(null);
        searchUsers("");
      } else {
        toast.error(res?.message || "Failed to create user and assign ticket");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create user and assign ticket");
    } finally {
      setCreatingAndAssigning(false);
    }
  };

  return (
    <EditorLayout title="Manual Ticketing">
      <div className="flex gap-3">
        <Button variant={activeTab === "existing" ? "default" : "outline"} onClick={() => setActiveTab("existing")}>
          Existing User
        </Button>
        <Button variant={activeTab === "new" ? "default" : "outline"} onClick={() => setActiveTab("new")}>
          Create User + Assign
        </Button>
      </div>

      {activeTab === "existing" ? (
        <Card>
          <CardHeader>
            <CardTitle>Assign Ticket to Existing User</CardTitle>
            <CardDescription>Select an approved user and assign an event ticket manually.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleAssignExisting}>
              <div className="space-y-2">
                <Label htmlFor="search-user">Find User</Label>
                <div className="flex gap-2">
                  <Input
                    id="search-user"
                    placeholder="Search by name, username or email"
                    value={existingSearch}
                    onChange={(e) => setExistingSearch(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => searchUsers(existingSearch)}
                    disabled={searchingUsers}
                  >
                    {searchingUsers ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingUsers.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.display_name || user.username || user.email || `User #${user.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upcoming Event</Label>
                  <Select value={selectedExistingEventId} onValueChange={setSelectedExistingEventId} disabled={eventsLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={eventsLoading ? "Loading events..." : "Select event"} />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((eventItem) => (
                        <SelectItem key={eventItem.id} value={String(eventItem.id)}>
                          {eventItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedUser && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedUser.display_name || selectedUser.username} ({selectedUser.email || "no email"})
                </p>
              )}

              <Button type="submit" disabled={assigningExisting || eventsLoading}>
                {assigningExisting ? "Assigning..." : "Assign Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create User and Assign Ticket</CardTitle>
            <CardDescription>Fill basic details, create user, and assign ticket in one step.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleCreateAndAssign}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={createForm.username}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={createForm.gender} onValueChange={(value) => setCreateForm((prev) => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>CNIC Picture</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setCnicFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Upcoming Event</Label>
                  <Select
                    value={createForm.event_id}
                    onValueChange={(value) => setCreateForm((prev) => ({ ...prev, event_id: value }))}
                    disabled={eventsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={eventsLoading ? "Loading events..." : "Select event"} />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((eventItem) => (
                        <SelectItem key={eventItem.id} value={String(eventItem.id)}>
                          {eventItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={creatingAndAssigning || eventsLoading}>
                {creatingAndAssigning ? "Creating..." : "Create User and Assign Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </EditorLayout>
  );
}
