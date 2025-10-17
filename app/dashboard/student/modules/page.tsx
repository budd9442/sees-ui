'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { PageHeader } from '@/components/layout/page-header';
import { ModuleCard } from '@/components/common/module-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Student, Module } from '@/types';

export default function ModuleRegistrationPage() {
  const { user } = useAuthStore();
  const { students, modules, grades } = useAppStore();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const currentStudent = students.find((s) => s.email === user?.email) as Student | undefined;

  if (!currentStudent) {
    return <div>Loading...</div>;
  }

  // Get student's completed modules
  const completedModuleCodes = grades
    .filter((g) => g.studentId === currentStudent.studentId && g.grade >= 50)
    .map((g) => g.moduleCode);

  // Filter available modules
  const availableModules = useMemo(() => {
    return modules.filter((module) => {
      // Basic filters
      if (!module.isActive) return false;

      // Search filter
      if (
        searchQuery &&
        !module.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !module.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Year filter
      if (yearFilter !== 'all' && module.academicYear !== yearFilter) {
        return false;
      }

      // Semester filter
      if (semesterFilter !== 'all' && module.semester !== semesterFilter) {
        return false;
      }

      // Pathway filter
      if (
        module.degreeProgram &&
        currentStudent.degreeProgram &&
        module.degreeProgram !== currentStudent.degreeProgram
      ) {
        return false;
      }

      // Specialization filter
      if (
        module.specialization &&
        currentStudent.specialization &&
        module.specialization !== currentStudent.specialization
      ) {
        return false;
      }

      return true;
    });
  }, [modules, searchQuery, yearFilter, semesterFilter, currentStudent]);

  // Check if prerequisites are met for a module
  const checkPrerequisites = (module: Module): boolean => {
    return module.prerequisites.every((prereq) =>
      completedModuleCodes.includes(prereq)
    );
  };

  // Calculate total credits
  const selectedCredits = selectedModules.reduce((total, moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    return total + (module?.credits || 0);
  }, 0);

  const maxCredits = 24;
  const minCredits = 12;

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        const module = modules.find((m) => m.id === moduleId);
        if (module && selectedCredits + module.credits > maxCredits) {
          toast.error(`Cannot exceed ${maxCredits} credits per semester`);
          return prev;
        }
        return [...prev, moduleId];
      }
    });
  };

  const handleSubmitRegistration = () => {
    if (selectedCredits < minCredits) {
      toast.error(`Minimum ${minCredits} credits required`);
      return;
    }

    if (selectedCredits > maxCredits) {
      toast.error(`Maximum ${maxCredits} credits allowed`);
      return;
    }

    // Check all prerequisites
    const invalidModules = selectedModules.filter((id) => {
      const module = modules.find((m) => m.id === id);
      return module && !checkPrerequisites(module);
    });

    if (invalidModules.length > 0) {
      toast.error('Some selected modules have unmet prerequisites');
      return;
    }

    toast.success('Module registration submitted successfully!');
    setSelectedModules([]);
  };

  const isValidSelection =
    selectedCredits >= minCredits &&
    selectedCredits <= maxCredits &&
    selectedModules.every((id) => {
      const module = modules.find((m) => m.id === id);
      return module && checkPrerequisites(module);
    });

  return (
    <div>
      <PageHeader
        title="Module Registration"
        description="Browse and register for available modules"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your module search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
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

            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2">L2</SelectItem>
                  <SelectItem value="L3">L3</SelectItem>
                  <SelectItem value="L4">L4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger id="semester">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="S1">Semester 1</SelectItem>
                  <SelectItem value="S2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Degree Program</span>
                <Badge variant="outline">{currentStudent.degreeProgram || 'Not Set'}</Badge>
              </div>
              {currentStudent.specialization && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Specialization</span>
                  <Badge variant="outline">{currentStudent.specialization}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Selected Modules
                  </CardTitle>
                  <CardDescription>
                    {selectedModules.length} module(s) selected • {selectedCredits} credits
                  </CardDescription>
                </div>
                <Button
                  onClick={handleSubmitRegistration}
                  disabled={!isValidSelection}
                >
                  Submit Registration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedModules.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No modules selected. Browse and add modules below.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Credit Summary */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total Credits</p>
                      <p className="text-2xl font-bold">{selectedCredits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Range: {minCredits}-{maxCredits}</p>
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
                              : `Remove ${selectedCredits - maxCredits}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Module List */}
                  <div className="space-y-2">
                    {selectedModules.map((moduleId) => {
                      const module = modules.find((m) => m.id === moduleId);
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {selectedModules.length > 0 && !isValidSelection && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure you have between {minCredits} and {maxCredits} credits selected and all prerequisites are met.
              </AlertDescription>
            </Alert>
          )}

          {/* Available Modules */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Available Modules ({availableModules.length})
            </h2>
            {availableModules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No modules found matching your criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableModules.map((module) => (
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
