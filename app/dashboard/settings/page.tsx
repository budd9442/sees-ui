"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Lock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, ChangePasswordSchema } from "@/lib/validations/user";
import { changePassword } from "@/lib/actions/user-actions";
import { useAuthStore } from "@/stores/authStore";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuthStore();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const form = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: ChangePasswordSchema) => {
        if (!user) return;

        try {
            const result = await changePassword({ ...data, userId: user.id });
            if (result.success) {
                toast.success("Password updated successfully");
                form.reset();
            } else {
                toast.error(typeof result.error === 'string' ? result.error : "Failed to change password");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        }
    };

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your preferences and account settings.
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="general">
                        <Monitor className="mr-2 h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="mr-2 h-4 w-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the look and feel of the dashboard.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Theme</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Select your preferred theme for the dashboard.
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant={theme === "light" ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setTheme("light")}
                                        title="Light Mode"
                                    >
                                        <Sun className="h-4 w-4" />
                                        <span className="sr-only">Light Mode</span>
                                    </Button>
                                    <Button
                                        variant={theme === "dark" ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setTheme("dark")}
                                        title="Dark Mode"
                                    >
                                        <Moon className="h-4 w-4" />
                                        <span className="sr-only">Dark Mode</span>
                                    </Button>
                                    <Button
                                        variant={theme === "system" ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setTheme("system")}
                                        title="System Theme"
                                    >
                                        <Monitor className="h-4 w-4" />
                                        <span className="sr-only">System Theme</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        {...form.register("currentPassword")}
                                    />
                                    {form.formState.errors.currentPassword && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.currentPassword.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...form.register("newPassword")}
                                    />
                                    {form.formState.errors.newPassword && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.newPassword.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...form.register("confirmPassword")}
                                    />
                                    {form.formState.errors.confirmPassword && (
                                        <p className="text-sm text-destructive">
                                            {form.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Updating..." : "Update Password"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
