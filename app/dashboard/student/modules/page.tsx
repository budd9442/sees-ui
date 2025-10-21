'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Search, BookOpen, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { Student, Module } from '@/types';

export default function ModuleRegistrationPage() {
  const { user } = useAuthStore();
  const { students, modules, grades } = useAppStore();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current academic year and semester (locked to current)
  const currentYear = '2025'; // This would come from system settings
  const currentSemester = 'S1'; // This would come from system settings
  
  const currentStudent = students.find((s) => s.email === user?.email) as Student | undefined;

  if (!currentStudent) {
    return <div>Loading...</div>;
  }

  // Get student's completed modules
  const completedModuleCodes = grades
    .filter((g) => g.studentId === currentStudent.studentId && g.grade >= 50)
    .map((g) => g.moduleCode);

  // Get compulsory modules for current student's year and program
  const compulsoryModules = useMemo(() => {
    return modules.filter((module) => {
      // Must be for current student's academic year
      if (module.academicYear !== currentStudent.academicYear) return false;
      
      // Must be for current semester
      if (module.semester !== currentSemester) return false;
      
      // Must be active
      if (!module.isActive) return false;
      
      // Must match student's degree program (if specified)
      if (module.degreeProgram && currentStudent.degreeProgram && 
          module.degreeProgram !== currentStudent.degreeProgram) return false;
      
      // Must match student's specialization (if specified)
      if (module.specialization && currentStudent.specialization && 
          module.specialization !== currentStudent.specialization) return false;
      
      // Must be compulsory (based on guide book data)
      return isCompulsoryModule(module, currentStudent);
    });
  }, [modules, currentStudent, currentSemester]);

  // Get optional modules for current student's year and program
  const optionalModules = useMemo(() => {
    return modules.filter((module) => {
      // Must be for current student's academic year
      if (module.academicYear !== currentStudent.academicYear) return false;
      
      // Must be for current semester
      if (module.semester !== currentSemester) return false;
      
      // Must be active
      if (!module.isActive) return false;
      
      // Must match student's degree program (if specified)
      if (module.degreeProgram && currentStudent.degreeProgram && 
          module.degreeProgram !== currentStudent.degreeProgram) return false;
      
      // Must match student's specialization (if specified)
      if (module.specialization && currentStudent.specialization && 
          module.specialization !== currentStudent.specialization) return false;
      
      // Must be optional (not compulsory)
      if (isCompulsoryModule(module, currentStudent)) return false;
      
      // Search filter
      if (
        searchQuery &&
        !module.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !module.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      
      return true;
    });
  }, [modules, currentStudent, currentSemester, searchQuery]);

  // Helper function to determine if a module is compulsory based on guide book
  function isCompulsoryModule(module: Module, student: Student): boolean {
    const moduleCode = module.code;
    
    // L1 compulsory modules (all students)
    if (student.academicYear === 'L1') {
      const l1Compulsory = [
        'DELT 11232', 'GNCT 11212a', 'INTE 11213', 'INTE 11223', 'MGTE 11233',
        'MGTE 11243', 'PMAT 11212', 'MGTE 12253', 'INTE 12243', 'INTE 12213',
        'INTE 12223', 'MGTE 12263', 'MGTE 12273', 'PMAT 12212'
      ];
      return l1Compulsory.includes(moduleCode);
    }
    
    // L2 compulsory modules
    if (student.academicYear === 'L2') {
      const l2Compulsory = [
        'INTE 21213', 'INTE 21313', 'INTE 21323', 'INTE 21333', 'MGTE 21243',
        'MGTE 21233', 'INTE 21343', 'MGTE 22273', 'INTE 22343', 'INTE 22303',
        'MGTE 22263', 'INTE 22283', 'GNCT 24212a'
      ];
      return l2Compulsory.includes(moduleCode);
    }
    
    // L3 compulsory modules (based on specialization)
    if (student.academicYear === 'L3') {
      const l3Compulsory = [
        'INTE 31356', 'MGTE 31393', 'MGTE 31373', 'GNCT 32216'
      ];
      
      // Add specialization-specific compulsory modules
      if (student.specialization === 'BSE') {
        l3Compulsory.push('MGTE 31293', 'MGTE 31403', 'MGTE 31423');
      } else if (student.specialization === 'OSCM') {
        l3Compulsory.push('MGTE 31413', 'MGTE 31303');
      } else if (student.specialization === 'IS') {
        l3Compulsory.push('INTE 31423', 'INTE 31413', 'INTE 31393');
      }
      
      return l3Compulsory.includes(moduleCode);
    }
    
    // L4 compulsory modules
    if (student.academicYear === 'L4') {
      const l4Compulsory = [
        'MGTE 41323', 'MGTE 41313'
      ];
      
      // Add specialization-specific compulsory modules
      if (student.specialization === 'BSE') {
        l4Compulsory.push('MGTE 41333', 'MGTE 42213');
      } else if (student.specialization === 'OSCM') {
        l4Compulsory.push('MGTE 41343', 'MGTE 42323');
      } else if (student.specialization === 'IS') {
        l4Compulsory.push('INTE 41283', 'MGTE 41303');
      }
      
      return l4Compulsory.includes(moduleCode);
    }
    
    return false;
  }

  // Auto-add compulsory modules to selected modules
  useEffect(() => {
    const compulsoryModuleIds = compulsoryModules.map(m => m.id);
    setSelectedModules(prev => {
      const newSelection = [...prev];
      compulsoryModuleIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  }, [compulsoryModules]);

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
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;
    
    // Check if it's a compulsory module
    if (isCompulsoryModule(module, currentStudent)) {
      toast.error('Compulsory modules cannot be removed');
      return;
    }
    
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        if (selectedCredits + module.credits > maxCredits) {
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
        {/* Current Registration Info */}
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
                  <Badge variant="outline">{currentStudent.academicYear}</Badge>
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
                <Badge variant="outline">{currentStudent.degreeProgram || 'Not Set'}</Badge>
              </div>
              
              {currentStudent.specialization && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Specialization</span>
                  <Badge variant="outline">{currentStudent.specialization}</Badge>
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
          {/* Module Registration Cart */}
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
                  disabled={!isValidSelection}
                >
                  Submit Registration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedModules.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    Loading compulsory modules...
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

                  {/* Compulsory Modules */}
                  {compulsoryModules.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Compulsory Modules</h4>
                      {compulsoryModules.map((module) => (
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
                    const module = modules.find(m => m.id === id);
                    return module && !isCompulsoryModule(module, currentStudent);
                  }).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Selected Optional Modules</h4>
                      {selectedModules
                        .filter(id => {
                          const module = modules.find(m => m.id === id);
                          return module && !isCompulsoryModule(module, currentStudent);
                        })
                        .map((moduleId) => {
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
                  )}
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

          {/* Available Optional Modules */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Available Optional Modules ({optionalModules.length})
            </h2>
            {optionalModules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No optional modules available for {currentStudent.academicYear} {currentSemester}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {optionalModules.map((module) => (
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
