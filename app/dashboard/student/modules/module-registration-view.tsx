'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ModuleCard } from '@/components/common/module-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, BookOpen, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { registerForModules } from '@/lib/actions/student-actions';
import type { Module } from '@/types';

interface ModuleRegistrationViewProps {
    student: {
        academicYear: string;
        degreeProgram?: string;
        specialization?: string;
    };
    currentSemester: string;
    availableModules: (Module & { isCompulsory: boolean })[];
    registeredModuleIds: string[];
    completedModuleCodes: string[];
    compulsoryModuleIds: string[];
}

export function ModuleRegistrationView({
    student,
    currentSemester,
    availableModules,
    registeredModuleIds,
    completedModuleCodes,
    compulsoryModuleIds
}: ModuleRegistrationViewProps) {
    const router = useRouter();

    // Initialize selection with already registered modules + compulsory modules
    const initialSelection = useMemo(() => {
        const set = new Set([...registeredModuleIds]);
        availableModules.filter(m => m.isCompulsory).forEach(m => set.add(m.id));
        return Array.from(set);
    }, [registeredModuleIds, availableModules]);

    const [selectedModules, setSelectedModules] = useState<string[]>(initialSelection);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter optional modules based on search
    const displayedOptionalModules = useMemo(() => {
        return availableModules.filter((module) => {
            if (module.isCompulsory) return false; // Handled separately

            if (
                searchQuery &&
                !module.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !module.code.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            return true;
        });
    }, [availableModules, searchQuery]);

    const compulsoryModulesList = useMemo(() =>
        availableModules.filter(m => m.isCompulsory),
        [availableModules]);

    // Check if prerequisites are met
    const checkPrerequisites = (module: Module): boolean => {
        return module.prerequisites.every((prereq) =>
            completedModuleCodes.includes(prereq)
        );
    };

    // Calculate total credits
    const selectedCredits = selectedModules.reduce((total, moduleId) => {
        const module = availableModules.find((m) => m.id === moduleId);
        return total + (module?.credits || 0);
    }, 0);

    const maxCredits = 24;
    const minCredits = 12;

    const toggleModule = (moduleId: string) => {
        const module = availableModules.find((m) => m.id === moduleId);
        if (!module) return;

        if (module.isCompulsory) {
            toast.error('Compulsory modules cannot be removed');
            return;
        }

        setSelectedModules((prev) => {
            if (prev.includes(moduleId)) {
                return prev.filter((id) => id !== moduleId);
            } else {
                // if (selectedCredits + module.credits > maxCredits) {
                //     toast.error(`Cannot exceed ${maxCredits} credits per semester`);
                //     return prev;
                // }
                return [...prev, moduleId];
            }
        });
    };

    const handleSubmitRegistration = async () => {
        if (selectedCredits < minCredits) {
            toast.error(`Minimum ${minCredits} credits required`);
            return;
        }

        // if (selectedCredits > maxCredits) {
        //     toast.error(`Maximum ${maxCredits} credits allowed`);
        //     return;
        // }

        // Check all prerequisites
        const invalidModules = selectedModules.filter((id) => {
            const module = availableModules.find((m) => m.id === id);
            return module && !checkPrerequisites(module);
        });

        if (invalidModules.length > 0) {
            toast.error('Some selected modules have unmet prerequisites');
            return;
        }

        setIsSubmitting(true);
        try {
            await registerForModules(selectedModules);
            toast.success('Module registration submitted successfully!');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidSelection =
        selectedCredits >= minCredits &&
        // selectedCredits <= maxCredits && // Removed max limit
        selectedModules.every((id) => {
            const module = availableModules.find((m) => m.id === id);
            return module && checkPrerequisites(module);
        });

    return (
        <div>
            <PageHeader
                title="Module Registration"
                description="Browse and register for available modules"
            />

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Info Column */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Registration Info</CardTitle>
                        <CardDescription>Current semester details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Optional Modules</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Module code or title..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Academic Year</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{student.academicYear}</Badge>
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Current Semester</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{currentSemester}</Badge>
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Degree Program</span>
                                <Badge variant="outline">{student.degreeProgram || 'Not Set'}</Badge>
                            </div>

                            {student.specialization && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Specialization</span>
                                    <Badge variant="outline">{student.specialization}</Badge>
                                </div>
                            )}
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                Compulsory modules are automatically added. Only optional modules can be selected/deselected.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Cart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Module Registration
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedModules.length} module(s) selected • {selectedCredits} credits
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={handleSubmitRegistration}
                                    disabled={!isValidSelection || isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Credit Summary */}
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Total Credits</p>
                                        <p className="text-2xl font-bold">{selectedCredits}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Min: {minCredits}</p>
                                        {isValidSelection ? (
                                            <div className="flex items-center gap-1 text-green-600 mt-1">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">Valid</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-orange-600 mt-1">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {selectedCredits < minCredits
                                                        ? `Add ${minCredits - selectedCredits} more`
                                                        : `Check prerequisites`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Compulsory Modules */}
                                {compulsoryModulesList.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">Compulsory Modules</h4>
                                        {compulsoryModulesList.map((module) => (
                                            <div
                                                key={module.id}
                                                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{module.code}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {module.title}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary">{module.credits} credits</Badge>
                                                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                                                        Compulsory
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Selected Optional Modules */}
                                {selectedModules.filter(id => {
                                    const module = availableModules.find(m => m.id === id);
                                    return module && !module.isCompulsory;
                                }).length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-muted-foreground">Selected Optional Modules</h4>
                                            {selectedModules
                                                .filter(id => {
                                                    const module = availableModules.find(m => m.id === id);
                                                    return module && !module.isCompulsory;
                                                })
                                                .map((moduleId) => {
                                                    const module = availableModules.find((m) => m.id === moduleId);
                                                    if (!module) return null;
                                                    return (
                                                        <div
                                                            key={moduleId}
                                                            className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
                                                        >
                                                            <div>
                                                                <p className="font-medium">{module.code}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {module.title}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge>{module.credits} credits</Badge>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => toggleModule(moduleId)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Optional Modules */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">
                            Available Optional Modules ({displayedOptionalModules.length})
                        </h2>
                        {displayedOptionalModules.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">
                                        No optional modules available for {student.academicYear} {currentSemester} matching your search.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {displayedOptionalModules.map((module) => (
                                    <ModuleCard
                                        key={module.id}
                                        module={module}
                                        isSelected={selectedModules.includes(module.id)}
                                        prerequisitesMet={checkPrerequisites(module)}
                                        onToggleSelect={() => toggleModule(module.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
