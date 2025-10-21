'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Clock,
  Filter,
  Search,
  FileSpreadsheet,
  Send,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { GradeUpload, GradeUploadError, Module } from '@/types';

export default function GradesPage() {
  const getLetterGrade = (grade: number): string => {
    if (grade >= 90) return 'A+';
    if (grade >= 85) return 'A';
    if (grade >= 80) return 'A-';
    if (grade >= 75) return 'B+';
    if (grade >= 70) return 'B';
    if (grade >= 65) return 'B-';
    if (grade >= 60) return 'C+';
    if (grade >= 55) return 'C';
    if (grade >= 50) return 'C-';
    if (grade >= 45) return 'D+';
    if (grade >= 40) return 'D';
    return 'F';
  };
  const { user } = useAuthStore();
  const { modules, grades, students, addGrade, updateGrade } = useAppStore();
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<GradeUploadError[]>([]);
  const [uploadData, setUploadData] = useState<Array<{
    id: string;
    studentId: string;
    studentName: string;
    grade: number;
    points: number;
    credits: number;
    moduleId: string;
    uploadedAt: string;
    uploadedBy: string;
    status: 'draft' | 'validated' | 'released';
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get grades for selected module
  const moduleGrades = grades.filter(g => g.moduleId === selectedModule);
  const currentModule = modules.find(m => m.id === selectedModule);

  // Mock CSV template data
  const csvTemplate = [
    ['Student ID', 'Student Name', 'Grade', 'Points', 'Credits', 'Comments'],
    ['STU001', 'John Doe', 'A', '4.0', '3', 'Excellent work'],
    ['STU002', 'Jane Smith', 'B+', '3.3', '3', 'Good performance'],
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const errors: GradeUploadError[] = [];
      const data: Array<{
        id: string;
        studentId: string;
        studentName: string;
        grade: number;
        points: number;
        credits: number;
        moduleId: string;
        uploadedAt: string;
        uploadedBy: string;
        status: 'draft' | 'validated' | 'released';
      }> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header.toLowerCase().replace(/\s+/g, '')] = values[index];
        });
        
        // Validate data
        const rowErrors: string[] = [];
        
        if (!rowData.studentid) {
          rowErrors.push('Student ID is required');
        }
        
        if (!rowData.grade) {
          rowErrors.push('Grade is required');
        } else if (!['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'IP', 'W'].includes(rowData.grade)) {
          rowErrors.push('Invalid grade format');
        }
        
        if (!rowData.points || isNaN(parseFloat(rowData.points))) {
          rowErrors.push('Points must be a valid number');
        }
        
        if (!rowData.credits || isNaN(parseInt(rowData.credits))) {
          rowErrors.push('Credits must be a valid number');
        }
        
        if (rowErrors.length > 0) {
          errors.push({
            row: i + 1,
            studentId: rowData.studentid || '',
            field: 'general',
            error: rowErrors.join(', '),
          });
        } else {
          data.push({
            id: `UPLOAD_${i}`,
            studentId: rowData.studentid,
            studentName: rowData.studentname || '',
            grade: rowData.grade,
            points: parseFloat(rowData.points),
            credits: parseInt(rowData.credits),
            moduleId: selectedModule,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user?.id || '',
            status: 'draft',
          });
        }
      }
      
      setUploadErrors(errors);
      setUploadData(data);
    };
    
    reader.readAsText(file);
  };

  const handleBulkUpload = () => {
    if (uploadErrors.length > 0) {
      toast.error('Please fix all errors before uploading');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      uploadData.forEach(gradeData => {
        addGrade({
          id: `GRADE_${Date.now()}_${Math.random()}`,
          studentId: gradeData.studentId,
          moduleId: gradeData.moduleId,
          grade: gradeData.grade,
          letterGrade: getLetterGrade(gradeData.grade),
          points: gradeData.points,
          credits: gradeData.credits,
          semester: currentModule?.semester || 'S1',
          academicYear: currentModule?.academicYear || '2025',
          isReleased: false,
          moduleCode: currentModule?.code || '',
          moduleTitle: currentModule?.title || '',
        });
      });
      
      setIsUploading(false);
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadData([]);
      setUploadErrors([]);
      toast.success(`Successfully uploaded ${uploadData.length} grades`);
    }, 2000);
  };

  const handleReleaseGrades = () => {
    const gradesToRelease = moduleGrades.filter(g => selectedGrades.includes(g.id));
    
    gradesToRelease.forEach(grade => {
      updateGrade(grade.id, {
        isReleased: true,
      });
    });
    
    setShowReleaseDialog(false);
    setSelectedGrades([]);
    toast.success(`Released ${gradesToRelease.length} grades`);
  };

  const handleSelectAllGrades = () => {
    if (selectedGrades.length === moduleGrades.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades(moduleGrades.map(g => g.id));
    }
  };

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) 
        ? prev.filter(id => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const downloadTemplate = () => {
    const csvContent = csvTemplate.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grade_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredGrades = moduleGrades.filter(grade => {
    const student = students.find(s => s.id === grade.studentId);
    const term = (searchTerm || '').toLowerCase();
    const studentName = (student?.name || '').toLowerCase();
    const studentId = (grade.studentId || '').toLowerCase();
    return studentName.includes(term) || studentId.includes(term);
  });

  const releasedGrades = moduleGrades.filter(g => g.isReleased);
  const pendingGrades = moduleGrades.filter(g => !g.isReleased);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Grade Management</h1>
          <p className="text-muted-foreground mt-1">
            Upload, manage, and release student grades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Grades
          </Button>
        </div>
      </div>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Module</CardTitle>
          <CardDescription>
            Choose a module to manage grades for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title} - {module.academicYear} {module.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentModule && (
              <div className="space-y-2">
                <Label>Module Information</Label>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium">{currentModule.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentModule.academicYear} {currentModule.semester} • {currentModule.credits} credits
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedModule && (
        <>
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moduleGrades.length}</div>
                <p className="text-xs text-muted-foreground">Enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Grades Uploaded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moduleGrades.length}</div>
                <p className="text-xs text-muted-foreground">All grades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Released</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{releasedGrades.length}</div>
                <p className="text-xs text-muted-foreground">Grades released</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingGrades.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting release</p>
              </CardContent>
            </Card>
          </div>

          {/* Grade Management */}
          <Tabs defaultValue="grades" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grades">All Grades</TabsTrigger>
              <TabsTrigger value="pending">Pending Release</TabsTrigger>
              <TabsTrigger value="released">Released</TabsTrigger>
            </TabsList>

            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Grades</CardTitle>
                  <CardDescription>
                    Manage all grades for {currentModule?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleSelectAllGrades}
                      >
                        {selectedGrades.length === moduleGrades.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      {selectedGrades.length > 0 && (
                        <Button onClick={() => setShowReleaseDialog(true)}>
                          <Send className="mr-2 h-4 w-4" />
                          Release Selected ({selectedGrades.length})
                        </Button>
                      )}
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedGrades.length === moduleGrades.length}
                              onChange={handleSelectAllGrades}
                            />
                          </TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Comments</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGrades.map((grade) => {
                          const student = students.find(s => s.id === grade.studentId);
                          return (
                            <TableRow key={grade.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedGrades.includes(grade.id)}
                                  onChange={() => handleSelectGrade(grade.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{student?.name}</div>
                                  <div className="text-sm text-muted-foreground">{grade.studentId}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>
                                  {grade.letterGrade}
                                </Badge>
                              </TableCell>
                              <TableCell>{grade.points}</TableCell>
                              <TableCell>{grade.credits}</TableCell>
                              <TableCell>
                                <Badge variant={grade.isReleased ? 'default' : 'secondary'}>
                                  {grade.isReleased ? 'Released' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate">
                                  -
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Release</CardTitle>
                  <CardDescription>
                    Grades awaiting release to students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingGrades.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
                        <p>All grades have been released</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedGrades(pendingGrades.map(g => g.id))}
                          >
                            Select All Pending
                          </Button>
                          {selectedGrades.length > 0 && (
                            <Button onClick={() => setShowReleaseDialog(true)}>
                              <Send className="mr-2 h-4 w-4" />
                              Release Selected ({selectedGrades.length})
                            </Button>
                          )}
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedGrades.length === pendingGrades.length}
                                  onChange={() => setSelectedGrades(pendingGrades.map(g => g.id))}
                                />
                              </TableHead>
                              <TableHead>Student</TableHead>
                              <TableHead>Grade</TableHead>
                              <TableHead>Points</TableHead>
                              <TableHead>Comments</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingGrades.map((grade) => {
                              const student = students.find(s => s.id === grade.studentId);
                              return (
                                <TableRow key={grade.id}>
                                  <TableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedGrades.includes(grade.id)}
                                      onChange={() => handleSelectGrade(grade.id)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{student?.name}</div>
                                      <div className="text-sm text-muted-foreground">{grade.studentId}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>
                                      {grade.letterGrade}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{grade.points}</TableCell>
                                  <TableCell>
                                    <div className="max-w-xs truncate">
                                      -
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                          setSelectedGrades([grade.id]);
                                          setShowReleaseDialog(true);
                                        }}
                                      >
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="released" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Released Grades</CardTitle>
                  <CardDescription>
                    Grades that have been released to students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Released Date</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releasedGrades.map((grade) => {
                        const student = students.find(s => s.id === grade.studentId);
                        return (
                          <TableRow key={grade.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{student?.name}</div>
                                <div className="text-sm text-muted-foreground">{grade.studentId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={grade.letterGrade === 'F' ? 'destructive' : 'default'}>
                                {grade.letterGrade}
                              </Badge>
                            </TableCell>
                            <TableCell>{grade.points}</TableCell>
                            <TableCell>
                              {grade.isReleased ? 'Released' : 'Draft'}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                -
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Grades</DialogTitle>
            <DialogDescription>
              Upload grades from a CSV file for {currentModule?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">CSV File</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {uploadErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Errors</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1">
                    {uploadErrors.map((error, index) => (
                      <div key={index} className="text-sm">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {uploadData.length > 0 && (
              <div className="space-y-2">
                <Label>Preview ({uploadData.length} records)</Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadData.slice(0, 5).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.studentId}</TableCell>
                          <TableCell>{item.grade}</TableCell>
                          <TableCell>{item.points}</TableCell>
                          <TableCell>{item.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUpload} 
              disabled={uploadErrors.length > 0 || uploadData.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Grades
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Grades</DialogTitle>
            <DialogDescription>
              Are you sure you want to release {selectedGrades.length} grades to students?
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Once released, students will be able to see their grades. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleaseGrades}>
              <Send className="mr-2 h-4 w-4" />
              Release Grades
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
