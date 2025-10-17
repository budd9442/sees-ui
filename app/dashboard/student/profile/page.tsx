'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  School,
  GraduationCap,
  Award,
  Edit,
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { students } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);

  const student = students.find(s => s.id === user?.id);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 University Ave, Campus City, CA 12345',
    bio: 'Passionate computer science student with a focus on software engineering and AI.',
    emergencyContact: 'Jane Doe - +1 (555) 987-6543',
    linkedIn: 'linkedin.com/in/alice-johnson',
    github: 'github.com/alicej',
  });

  const academicInfo = {
    studentId: student?.studentId || 'ST2024001',
    level: student?.academicYear || 'L2',
    pathway: student?.specialization || 'Software Engineering',
    specialization: student?.specialization || 'Business Software Engineering',
    advisor: 'Dr. Michael Smith',
    enrollmentDate: '2022-09-01',
    expectedGraduation: '2026-06-01',
    currentGPA: student?.currentGPA || 3.45,
    cumulativeCredits: 120,
    completedCredits: 60,
  };

  const achievements = [
    {
      id: 1,
      title: "Dean's List",
      description: 'Academic excellence for 2 consecutive semesters',
      date: '2023-12-01',
      icon: Award,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      id: 2,
      title: 'Hackathon Winner',
      description: 'First place in University Hackathon 2023',
      date: '2023-10-15',
      icon: Trophy,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 3,
      title: 'Perfect Attendance',
      description: 'No missed classes in Fall 2023',
      date: '2023-12-20',
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50',
    },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const getInitials = () => {
    return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and academic details
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic Info</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Profile Picture */}
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{academicInfo.studentId}</p>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="mb-6" />

              {!isEditing ? (
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">First Name</Label>
                      <p className="font-medium">{profileData.firstName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Last Name</Label>
                      <p className="font-medium">{profileData.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Phone</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{profileData.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{profileData.address}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Bio</Label>
                    <p className="text-sm">{profileData.bio}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Emergency Contact</Label>
                    <p className="font-medium">{profileData.emergencyContact}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">LinkedIn</Label>
                      <p className="font-medium text-sm">{profileData.linkedIn}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">GitHub</Label>
                      <p className="font-medium text-sm">{profileData.github}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input
                      id="emergency"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        value={profileData.linkedIn}
                        onChange={(e) => setProfileData({ ...profileData, linkedIn: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="github">GitHub Profile</Label>
                      <Input
                        id="github"
                        value={profileData.github}
                        onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Your academic progress and enrollment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{academicInfo.currentGPA.toFixed(2)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-muted-foreground">+0.15 from last semester</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {academicInfo.completedCredits}/{academicInfo.cumulativeCredits}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Completed</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{academicInfo.level}</div>
                      <p className="text-xs text-muted-foreground mt-1">Current Level</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Student ID</Label>
                    <p className="font-medium">{academicInfo.studentId}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Academic Level</Label>
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{academicInfo.level}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Degree Pathway</Label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{academicInfo.pathway}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Specialization</Label>
                    <p className="font-medium">{academicInfo.specialization}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Academic Advisor</Label>
                    <p className="font-medium">{academicInfo.advisor}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Enrollment Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {new Date(academicInfo.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Expected Graduation</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {new Date(academicInfo.expectedGraduation).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Academic Standing</Label>
                    <Badge variant="default" className="w-fit">Good Standing</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Awards</CardTitle>
              <CardDescription>
                Your academic achievements and recognitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.id} className="flex gap-4 p-4 rounded-lg border">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${achievement.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some settings require verification through your university email.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Security</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Notifications</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Email Preferences
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      SMS Alerts
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Privacy</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Profile Visibility
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Data Export
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}