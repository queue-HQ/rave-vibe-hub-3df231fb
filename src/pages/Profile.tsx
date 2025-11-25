import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Lock, Edit, Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AppSidebar from "@/components/sidebar/AppSidebar";
import logo from "@/assets/logo.png";
import { useUserProfile } from "@/context/UserProfileContext";
import { updateUserProfile, updatePassword } from "@/api/user";
import { toast } from "sonner";
import api from "@/lib/axios";
import { getInitials } from "@/lib/utils";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, isLoading, refetch } = useUserProfile();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    username: "",
    image: "",
    pictureFile: null as File | null,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  console.log('USER:', user)

  useEffect(() => {
    if (!user) return;

    setProfile((prev) => ({
      ...prev,
      name: (user.first_name + " " + user.last_name) || (user.username as string) || "",
      email: (user.email as string) || "",
      phone: (user.phone as string) || "",
      address: (user.address as string) || "",
      bio: (user.bio as string) || "",
      username: (user.username as string) || "",
      image:
        ((user.profile_picture as string) || (user.image as string) || "") ?? "",
      pictureFile: null,
    }));
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        image: reader.result as string,
        pictureFile: file,
      }));
    };

    reader.readAsDataURL(file);
  };

  const uploadProfileImage = async () => {
    if (!profile.pictureFile) return profile.image;

    const formData = new FormData();
    formData.append("file", profile.pictureFile);

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data?.url) {
      return res.data.url as string;
    }
    throw new Error("Image upload failed");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProfile) return;

    try {
      setSavingProfile(true);

      let uploadedImage = profile.image;
      if (profile.pictureFile) {
        uploadedImage = await uploadProfileImage();
      }

      const payload = {
        phone: profile.phone,
        address: profile.address,
        bio: profile.bio,
        profile_picture: uploadedImage,
      };

      const res = await updateUserProfile(payload);
      if (res?.success) {
        toast.success("Profile updated");
        setIsEditing(false);
        setProfile((prev) => ({
          ...prev,
          pictureFile: null,
          image: uploadedImage,
          phone: payload.phone,
          address: payload.address,
          bio: payload.bio,
        }));
        await refetch();
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (changingPassword) return;
    if (!passwordData.current || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    try {
      setChangingPassword(true);
      const res = await updatePassword({
        email: profile.email,
        old_password: passwordData.current,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword,
      });

      if (res?.success) {
        toast.success("Password updated successfully");
        localStorage.setItem("token", res.token);
        setPasswordData({ current: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navbar */}
      <div className="lg:hidden w-full p-4 flex justify-between items-center bg-card border-b border-primary/20 shadow-md">
        <img src={logo} className="h-12" alt="Logo" />

        <span onClick={() => setMobileSidebarOpen(true)}>
          <Logs />
        </span>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <AppSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
        </>
      )}
      {/* Sidebar */}
      <AppSidebar />
      

      {/* Main Content */}
      <main className="ml-0 lg:ml-64 p-4 sm:p-6">
        <div className="max-w-6xl  mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={profile.image} />
                  {/* {getInitials(profile?.name)} */}
                  <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                </Avatar>

                {isEditing && (
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="block text-sm"
                    />
                  </div>
                )}

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <Badge variant="default" className="bg-primary">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                  <Button onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={profile.username} disabled />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={profile.address}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {isEditing && (
                <Button onClick={handleSave} className="w-full" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          {/* <Card className="mb-6">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {["Techno", "House", "Drum & Bass", "EDM", "Psytrance"].map(
                    (genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="cursor-pointer"
                      >
                        {genre}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notification Settings</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Email notifications for new events</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>SMS reminders for upcoming events</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, current: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                />
              </div>
              <Button onClick={handlePasswordUpdate} disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
