"use client";

import { useAuthStore } from "@/stores/authStore";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { updateProfile } from "@/lib/actions/user-actions";
import { toast } from "sonner";
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
import { User, Mail, Shield, Building, IdCard, GraduationCap } from "lucide-react";

type ProfileFormData = {
    firstName: string;
    lastName: string;
};

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<ProfileFormData>({
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        },
    });

    // Update form when user data loads
    useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName,
                lastName: user.lastName,
            });
        }
    }, [user, form]);

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;

        try {
            const result = await updateProfile(user.id, data);

            if (result.success) {
                // Update local store
                // We need a way to update just part of the user state in authStore
                // For now, re-login (re-hydrate) or just optimistic update is tricky without a specific action
                // Let's manually trigger a reload or update if the store supported it.
                // Assuming we can just update the user object locally for now:

                // Update local store
                setUser({ ...user, ...data });

                toast.success("Profile updated successfully");
                setIsEditing(false);
            } else {
                toast.error(typeof result.error === 'string' ? result.error : "Failed to update profile");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    View and manage your personal information.
                </p>
            </div>
            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
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
                            <Avatar className="h-20 w-20">
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

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        {...form.register("firstName")}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        {...form.register("lastName")}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Email cannot be changed manually. Contact admin for assistance.
                                </p>
                            </div>

                            <div className="flex justify-end pt-2">
                                {isEditing ? (
                                    <div className="space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                form.reset();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button type="button" onClick={() => setIsEditing(true)}>
                                        Edit Details
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Account Details Card (Read-only) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>
                            System information related to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/50">
                            <IdCard className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">User ID</p>
                                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/50">
                            <Shield className="h-5 w-5 mt-0.5 text-muted-foreground" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Role</p>
                                <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                            </div>
                        </div>

                        {/* Conditional fields based on roles could go here */}
                        {user.role === 'student' && (
                            <div className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/50">
                                <GraduationCap className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Student Status</p>
                                    <p className="text-sm text-muted-foreground">Active Student</p>
                                </div>
                            </div>
                        )}

                        {user.role === 'staff' && (
                            <div className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/50">
                                <Building className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Department</p>
                                    <p className="text-sm text-muted-foreground">Industrial Management</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
