"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { 
    User, Mail, Shield, Building, IdCard, GraduationCap, 
    Phone, Linkedin, Github, MapPin, AlignLeft, AlertCircle, 
    Moon, Sun, Monitor, Lock 
} from "lucide-react";
import { z } from "zod";

import { useAuthStore } from "@/stores/authStore";
import { updateProfile, changePassword, getLoginHistory } from "@/lib/actions/user-actions";
import { changePasswordSchema, ChangePasswordSchema, updateUserSchema } from "@/lib/validations/user";
import { TwoFactorSettings } from "@/components/auth/TwoFactorSettings";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const profileUpdateSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional().or(z.literal("")),
    linkedin: z.string().optional().or(z.literal("")),
    github: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    bio: z.string().optional().or(z.literal("")),
    emergency_contact: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileUpdateSchema>;

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const { theme, setTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loginHistory, setLoginHistory] = useState<any[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Prevent hydration mismatch for theme
    useEffect(() => {
        setMounted(true);
    }, []);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            phone: user?.phone || "",
            linkedin: user?.linkedin || "",
            github: user?.github || "",
            address: user?.address || "",
            bio: user?.bio || "",
            emergency_contact: user?.emergency_contact || "",
        },
    });

    const passwordForm = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Update form when user data loads
    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || "",
                linkedin: user.linkedin || "",
                github: user.github || "",
                address: user.address || "",
                bio: user.bio || "",
                emergency_contact: user.emergency_contact || "",
            });
        }
    }, [user, profileForm]);

    const onProfileSubmit = async (data: ProfileFormData) => {
        if (!user) {
            toast.error("You must be logged in to update your profile");
            return;
        }

        console.log("Submitting profile update:", data);

        try {
            const result = await updateProfile(user.id, data);

            if (result.success) {
                // Important: Ensure we don't lose existing user properties not in the form
                const updatedUser = { ...user, ...data };
                setUser(updatedUser);
                toast.success("Profile updated successfully");
                setIsEditing(false);
            } else {
                const errorMsg = typeof result.error === 'string' ? result.error : "Failed to update profile";
                toast.error(errorMsg);
                console.error("Profile update failed:", result.error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred during save");
            console.error("Profile submit exception:", error);
        }
    };

    const onPasswordSubmit = async (data: ChangePasswordSchema) => {
        if (!user) return;

        try {
            const result = await changePassword({ ...data, userId: user.id });
            if (result.success) {
                toast.success("Password updated successfully");
                passwordForm.reset();
            } else {
                toast.error(typeof result.error === 'string' ? result.error : "Failed to change password");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    const fetchLoginHistory = async () => {
        setIsLoadingHistory(true);
        const result = await getLoginHistory();
        if (result.success && result.data) {
            setLoginHistory(result.data);
            setIsHistoryOpen(true);
        } else {
            toast.error("Could not load login history");
        }
        setIsLoadingHistory(false);
    };

    if (!user || !mounted) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    View and manage your personal information.
                </p>
            </div>
            <Separator />
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                    {/* Personal Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Your primary identification details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-6">
                                <Avatar className="h-20 w-20 border">
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback className="text-xl bg-primary/10">
                                        <User className="h-10 w-10 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            {...profileForm.register("firstName")}
                                            disabled={!isEditing}
                                        />
                                        {profileForm.formState.errors.firstName && (
                                            <p className="text-xs text-destructive">{profileForm.formState.errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            {...profileForm.register("lastName")}
                                            disabled={!isEditing}
                                        />
                                        {profileForm.formState.errors.lastName && (
                                            <p className="text-xs text-destructive">{profileForm.formState.errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            value={user.email}
                                            disabled
                                            className="pl-9 bg-muted/50"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                        Account email is managed by administration
                                    </p>
                                </div>

                                <div className="flex justify-start pt-4">
                                    {isEditing ? (
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    profileForm.reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="flex-1" disabled={profileForm.formState.isSubmitting}>
                                                {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button type="button" className="w-full" onClick={() => setIsEditing(true)}>
                                            Edit Profile Details
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact & Socials Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact & Socials</CardTitle>
                            <CardDescription>
                                Extended contact and professional information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            className="pl-9"
                                            {...profileForm.register("phone")}
                                            disabled={!isEditing}
                                            placeholder="+94 XX XXX XXXX"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                                    <div className="relative">
                                        <AlertCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="emergency_contact"
                                            className="pl-9"
                                            {...profileForm.register("emergency_contact")}
                                            disabled={!isEditing}
                                            placeholder="Name / Phone"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="linkedin"
                                            className="pl-9"
                                            {...profileForm.register("linkedin")}
                                            disabled={!isEditing}
                                            placeholder="linkedin.com/in/..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub</Label>
                                    <div className="relative">
                                        <Github className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="github"
                                            className="pl-9"
                                            {...profileForm.register("github")}
                                            disabled={!isEditing}
                                            placeholder="github.com/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Residential Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        className="pl-9"
                                        {...profileForm.register("address")}
                                        disabled={!isEditing}
                                        placeholder="Full address"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <textarea
                                        id="bio"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...profileForm.register("bio")}
                                        disabled={!isEditing}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize the look and feel of your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Theme Preference</Label>
                                <p className="text-xs text-muted-foreground">Select light, dark, or system theme.</p>
                            </div>
                            <div className="flex items-center gap-1 bg-background p-1 rounded-md border border-border/50">
                                <Button
                                    variant={theme === "light" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setTheme("light")}
                                    className="h-8 w-8 p-0"
                                >
                                    <Sun className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={theme === "dark" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setTheme("dark")}
                                    className="h-8 w-8 p-0"
                                >
                                    <Moon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={theme === "system" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setTheme("system")}
                                    className="h-8 w-8 p-0"
                                >
                                    <Monitor className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your security credentials.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="currentPassword" title="Current Password">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    size={1}
                                    {...passwordForm.register("currentPassword")}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...passwordForm.register("newPassword")}
                                        className="h-8 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="confirmPassword">Confirm</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...passwordForm.register("confirmPassword")}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                className="w-full mt-2"
                                disabled={passwordForm.formState.isSubmitting}
                            >
                                {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Security Section */}
            {(user.role === 'admin' || user.role === 'staff') && (
                <div className="grid gap-6 md:grid-cols-2">
                    <TwoFactorSettings />
                    <Card className="border-border/40">
                        <CardHeader>
                            <CardTitle>Session Security</CardTitle>
                            <CardDescription>Manage active sessions and security logs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Your last login was on {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'N/A'}.
                            </p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={fetchLoginHistory}
                                disabled={isLoadingHistory}
                            >
                                {isLoadingHistory ? "Loading..." : "View Login History"}
                            </Button>

                            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Login History</DialogTitle>
                                        <DialogDescription>
                                            Recent successful login attempts for your account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="h-[400px] pr-4 mt-4">
                                        {loginHistory.length > 0 ? (
                                            <div className="space-y-3">
                                                {loginHistory.map((log) => (
                                                    <div key={log.log_id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                                        <Shield className="h-4 w-4 mt-1 text-primary" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </p>
                                                            <div className="flex flex-col gap-0.5">
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Monitor className="h-3 w-3" /> {log.ip_address || 'Unknown IP'}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground line-clamp-1">
                                                                    {log.user_agent || 'Unknown Device'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No recent login history found.
                                            </div>
                                        )}
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
