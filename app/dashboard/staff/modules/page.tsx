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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  BookOpen,
  Edit,
  Save,
  Plus,
  Trash2,
  Eye,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Settings,
  FileText,
  Target,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Module, AcademicYear, Semester } from '@/types';

export default function ModulesPage() {
  const { user } = useAuthStore();
  const { modules, students, grades, updateModule } = useAppStore();
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleData, setModuleData] = useState({
    name: '',
    code: '',
    description: '',
    learningOutcomes: '',
    prerequisites: [] as string[],
    credits: 3,
    capacity: 50,
    academicYear: '2024',
    semester: 'S1',
    status: 'active' as 'active' | 'inactive',
  });

  // Get modules taught by current staff member (mock: all modules)
  const staffModules = modules.filter(m => m.academicYear === 'L1');
  const currentModule = modules.find(m => m.id === selectedModule);

  // Get students enrolled in selected module
  const enrolledStudents = students.filter(s => 
    grades.some(g => g.moduleId === selectedModule && g.studentId === s.id)
  );

  const handleEditModule = (module: Module) => {
    setSelectedModule(module.id);
    setModuleData({
      name: module.title,
      code: module.code,
      description: module.description,
      learningOutcomes: Array.isArray(module.learningOutcomes) ? module.learningOutcomes.join('\n') : (module.learningOutcomes || ''),
      prerequisites: module.prerequisites || [],
      credits: module.credits,
      capacity: module.capacity || 50,
      academicYear: module.academicYear as AcademicYear,
      semester: module.semester,
      status: module.status || 'active',
    });
    setIsEditing(true);
  };

  const handleSaveModule = () => {
    if (!selectedModule) return;

    updateModule(selectedModule, {
      ...moduleData,
      academicYear: moduleData.academicYear as AcademicYear,
      semester: moduleData.semester as Semester,
      learningOutcomes: Array.isArray(moduleData.learningOutcomes) 
        ? moduleData.learningOutcomes 
        : moduleData.learningOutcomes.split('\n').filter(outcome => outcome.trim()),
    });

    setIsEditing(false);
    toast.success('Module updated successfully');
  };

  const handleAddModule = () => {
    // Mock add module functionality
    toast.success('New module added successfully');
    setShowAddDialog(false);
    setModuleData({
      name: '',
      code: '',
      description: '',
      learningOutcomes: '',
      prerequisites: [],
      credits: 3,
      capacity: 50,
      academicYear: '2024',
      semester: 'S1',
      status: 'active',
    });
  };

  const filteredModules = staffModules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModuleStats = (moduleId: string) => {
    const moduleGrades = grades.filter(g => g.moduleId === moduleId);
    const enrolledCount = moduleGrades.length;
    const avgGrade = moduleGrades.length > 0 
      ? moduleGrades.reduce((sum, g) => sum + g.points, 0) / moduleGrades.length 
      : 0;
    const passRate = moduleGrades.length > 0
      ? (moduleGrades.filter(g => g.points >= 2.0).length / moduleGrades.length) * 100
      : 0;

    return { enrolledCount, avgGrade, passRate };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your modules, descriptions, and student enrollment
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>My Modules</CardTitle>
          <CardDescription>
            Select a module to view and edit details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map((module) => {
                const stats = getModuleStats(module.id);
                return (
                  <Card 
                    key={module.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedModule === module.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedModule(module.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription>{module.code}</CardDescription>
                        </div>
                        <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                          {module.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {stats.enrolledCount} students
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="h-4 w-4" />
                          {stats.avgGrade.toFixed(1)} avg grade
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4" />
                          {stats.passRate.toFixed(1)}% pass rate
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedModule && currentModule && (
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Module Details</TabsTrigger>
            <TabsTrigger value="students">Enrolled Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Module Information</CardTitle>
                    <CardDescription>
                      Edit module details, learning outcomes, and prerequisites
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveModule}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleEditModule(currentModule)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Module
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Module Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? moduleData.name : currentModule.title}
                        onChange={(e) => isEditing && setModuleData({ ...moduleData, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Module Code</Label>
                      <Input
                        id="code"
                        value={isEditing ? moduleData.code : currentModule.code}
                        onChange={(e) => isEditing && setModuleData({ ...moduleData, code: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Input
                        id="credits"
                        type="number"
                        value={isEditing ? moduleData.credits : currentModule.credits}
                        onChange={(e) => isEditing && setModuleData({ ...moduleData, credits: parseInt(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={isEditing ? moduleData.capacity : (currentModule.capacity || 50)}
                        onChange={(e) => isEditing && setModuleData({ ...moduleData, capacity: parseInt(e.target.value) })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select
                        value={isEditing ? moduleData.academicYear : currentModule.academicYear}
                        onValueChange={(value) => isEditing && setModuleData({ ...moduleData, academicYear: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={isEditing ? moduleData.semester : currentModule.semester}
                        onValueChange={(value) => isEditing && setModuleData({ ...moduleData, semester: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S1">Semester 1</SelectItem>
                          <SelectItem value="S2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Module Description</Label>
                    <Textarea
                      id="description"
                      value={isEditing ? moduleData.description : currentModule.description}
                      onChange={(e) => isEditing && setModuleData({ ...moduleData, description: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Describe the module content, objectives, and scope..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
                    <Textarea
                      id="learningOutcomes"
                      value={isEditing ? moduleData.learningOutcomes : (currentModule.learningOutcomes || []).join('\n')}
                      onChange={(e) => isEditing && setModuleData({ ...moduleData, learningOutcomes: e.target.value })}
                      disabled={!isEditing}
                      rows={6}
                      placeholder="Enter learning outcomes, one per line..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter each learning outcome on a separate line
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Prerequisites</Label>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">
                        Prerequisites: {(currentModule.prerequisites || []).join(', ') || 'None'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Module Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={currentModule.status === 'active' ? 'default' : 'secondary'}>
                        {currentModule.status || 'active'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {currentModule.status === 'active' ? 'Module is active and accepting enrollments' : 'Module is inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  Students currently enrolled in {currentModule.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Pathway</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map((student) => {
                      const grade = grades.find(g => g.moduleId === selectedModule && g.studentId === student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.academicYear}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{student.specialization}</Badge>
                          </TableCell>
                          <TableCell>
                            {grade ? (
                              <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>
                                {grade.letterGrade}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={grade?.isReleased ? 'default' : 'secondary'}>
                              {grade?.isReleased ? 'Released' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Users className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Enrollment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrolledStudents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    of {currentModule.capacity || 50} capacity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const moduleGrades = grades.filter(g => g.moduleId === selectedModule);
                      return moduleGrades.length > 0 
                        ? (moduleGrades.reduce((sum, g) => sum + g.points, 0) / moduleGrades.length).toFixed(1)
                        : '0.0';
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground">Grade points</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(() => {
                      const moduleGrades = grades.filter(g => g.moduleId === selectedModule);
                      return moduleGrades.length > 0
                        ? ((moduleGrades.filter(g => g.points >= 2.0).length / moduleGrades.length) * 100).toFixed(1)
                        : '0.0';
                    })()}%
                  </div>
                  <p className="text-xs text-muted-foreground">Students passed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Performance breakdown for {currentModule.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                    const count = grades.filter(g => g.moduleId === selectedModule && g.letterGrade === grade).length;
                    const percentage = enrolledStudents.length > 0 ? (count / enrolledStudents.length) * 100 : 0;
                    
                    return (
                      <div key={grade} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Grade {grade}</span>
                          <span>{count} students ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Add Module Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module for the current academic year
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-name">Module Name</Label>
                <Input
                  id="new-name"
                  value={moduleData.name}
                  onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })}
                  placeholder="e.g., Software Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-code">Module Code</Label>
                <Input
                  id="new-code"
                  value={moduleData.code}
                  onChange={(e) => setModuleData({ ...moduleData, code: e.target.value })}
                  placeholder="e.g., CS301"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-credits">Credits</Label>
                <Input
                  id="new-credits"
                  type="number"
                  value={moduleData.credits}
                  onChange={(e) => setModuleData({ ...moduleData, credits: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-capacity">Capacity</Label>
                <Input
                  id="new-capacity"
                  type="number"
                  value={moduleData.capacity}
                  onChange={(e) => setModuleData({ ...moduleData, capacity: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={moduleData.description}
                onChange={(e) => setModuleData({ ...moduleData, description: e.target.value })}
                placeholder="Describe the module content and objectives..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-outcomes">Learning Outcomes</Label>
              <Textarea
                id="new-outcomes"
                value={moduleData.learningOutcomes}
                onChange={(e) => setModuleData({ ...moduleData, learningOutcomes: e.target.value })}
                placeholder="Enter learning outcomes, one per line..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddModule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
