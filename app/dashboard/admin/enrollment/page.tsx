'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  UserPlus,
  Mail,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Student, GradeUpload, GradeUploadError } from '@/types';

export default function EnrollmentPage() {
  const { user } = useAuthStore();
  const { students, addStudent } = useAppStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<GradeUploadError[]>([]);
  const [enrollmentResults, setEnrollmentResults] = useState<any[]>([]);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState<'upload' | 'validate' | 'preview' | 'complete'>('upload');

  // CSV Template structure
  const csvTemplate = [
    {
      studentId: 'STU001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      academicYear: 'L1',
      pathway: 'Software Engineering',
      specialization: 'Frontend Development',
      phone: '+1234567890',
      dateOfBirth: '2000-01-01',
      address: '123 Main St, City, Country',
    },
    {
      studentId: 'STU002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@university.edu',
      academicYear: 'L1',
      pathway: 'Data Science',
      specialization: 'Machine Learning',
      phone: '+1234567891',
      dateOfBirth: '2000-02-01',
      address: '456 Oak Ave, City, Country',
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });

      setCsvData(data);
      validateCSVData(data);
      setEnrollmentStep('validate');
    };
    reader.readAsText(file);
  };

  const validateCSVData = (data: any[]) => {
    const errors: GradeUploadError[] = [];
    const existingStudentIds = students.map(s => s.id);
    const existingEmails = students.map(s => s.email);

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV starts at row 1 and we skip header

      // Required field validation
      if (!row.studentId) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'studentId',
          error: 'Student ID is required',
          value: row.studentId || '',
        });
      }

      if (!row.firstName) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'firstName',
          error: 'First name is required',
          value: row.firstName || '',
        });
      }

      if (!row.lastName) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'lastName',
          error: 'Last name is required',
          value: row.lastName || '',
        });
      }

      if (!row.email) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'email',
          error: 'Email is required',
          value: row.email || '',
        });
      }

      // Email format validation
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'email',
          error: 'Invalid email format',
          value: row.email,
        });
      }

      // Duplicate validation
      if (row.studentId && existingStudentIds.includes(row.studentId)) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'studentId',
          error: 'Student ID already exists',
          value: row.studentId,
        });
      }

      if (row.email && existingEmails.includes(row.email)) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'email',
          error: 'Email already exists',
          value: row.email,
        });
      }

      // Academic year validation
      if (row.academicYear && !['L1', 'L2', 'L3'].includes(row.academicYear)) {
        errors.push({
          row: rowNumber,
          studentId: row.studentId || '',
          field: 'academicYear',
          error: 'Academic year must be L1, L2, or L3',
          value: row.academicYear,
        });
      }

      // Degree program is selected in second year; ignore if present in bulk enrollment
    });

    setValidationErrors(errors);
  };

  const downloadTemplate = () => {
    const csvContent = [
      Object.keys(csvTemplate[0]).join(','),
      ...csvTemplate.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_enrollment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded successfully!');
  };

  const processEnrollment = () => {
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before proceeding');
      return;
    }

    setIsProcessing(true);
    setEnrollmentStep('preview');

    // Simulate processing delay
    setTimeout(() => {
      const results = csvData.map((row, index) => {
        const success = Math.random() > 0.1; // 90% success rate
        return {
          row: index + 2,
          studentId: row.studentId,
          name: `${row.firstName} ${row.lastName}`,
          email: row.email,
          success,
          error: success ? 'Enrolled successfully' : 'Enrollment failed',
          student: success ? {
            id: row.studentId,
            name: `${row.firstName} ${row.lastName}`,
            email: row.email,
            academicYear: row.academicYear || 'L1',
            pathway: row.pathway || 'Software Engineering',
            specialization: row.specialization || 'Frontend Development',
            gpa: 0,
            creditsEarned: 0,
            createdAt: new Date().toISOString(),
          } : null,
        };
      });

      setEnrollmentResults(results);
      setIsProcessing(false);
      setEnrollmentStep('complete');
    }, 2000);
  };

  const confirmEnrollment = () => {
    const successfulEnrollments = enrollmentResults.filter(r => r.success && r.student);
    
    successfulEnrollments.forEach(result => {
      if (result.student) {
        addStudent(result.student);
      }
    });

    toast.success(`${successfulEnrollments.length} students enrolled successfully!`);
    setShowPreviewDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setUploadedFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setEnrollmentResults([]);
    setEnrollmentStep('upload');
    setIsProcessing(false);
  };

  const getErrorCountByField = () => {
    const errorCounts: Record<string, number> = {};
    validationErrors.forEach(error => {
      errorCounts[error.field] = (errorCounts[error.field] || 0) + 1;
    });
    return errorCounts;
  };

  const errorCounts = getErrorCountByField();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Bulk Student Enrollment</h1>
          <p className="text-muted-foreground mt-1">
            Enroll multiple students using CSV upload
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline" onClick={resetForm}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Process</CardTitle>
          <CardDescription>
            Follow these steps to enroll students in bulk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${enrollmentStep === 'upload' ? 'text-blue-600' : enrollmentStep === 'validate' || enrollmentStep === 'preview' || enrollmentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enrollmentStep === 'upload' ? 'bg-blue-100' : enrollmentStep === 'validate' || enrollmentStep === 'preview' || enrollmentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {enrollmentStep === 'validate' || enrollmentStep === 'preview' || enrollmentStep === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">1</span>
                )}
              </div>
              <span className="text-sm font-medium">Upload CSV</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200" />
            
            <div className={`flex items-center space-x-2 ${enrollmentStep === 'validate' ? 'text-blue-600' : enrollmentStep === 'preview' || enrollmentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enrollmentStep === 'validate' ? 'bg-blue-100' : enrollmentStep === 'preview' || enrollmentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {enrollmentStep === 'preview' || enrollmentStep === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">2</span>
                )}
              </div>
              <span className="text-sm font-medium">Validate</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200" />
            
            <div className={`flex items-center space-x-2 ${enrollmentStep === 'preview' ? 'text-blue-600' : enrollmentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enrollmentStep === 'preview' ? 'bg-blue-100' : enrollmentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {enrollmentStep === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">3</span>
                )}
              </div>
              <span className="text-sm font-medium">Preview</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-200" />
            
            <div className={`flex items-center space-x-2 ${enrollmentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${enrollmentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {enrollmentStep === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">4</span>
                )}
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Student Data</CardTitle>
              <CardDescription>
                Upload a CSV file containing student information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload CSV File</h3>
                    <p className="text-muted-foreground">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>

                {uploadedFile && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>File Uploaded</AlertTitle>
                    <AlertDescription>
                      {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Required Fields</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="text-sm text-muted-foreground">
                      • studentId (unique identifier)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • firstName
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • lastName
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • email (valid format)
                    </div>
                    <div className="text-sm text-muted-foreground">
                      • academicYear (L1, L2, L3)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation</CardTitle>
              <CardDescription>
                Review validation results and fix any errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationErrors.length === 0 ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Validation Successful</AlertTitle>
                    <AlertDescription>
                      All {csvData.length} records passed validation. Ready to proceed with enrollment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors Found</AlertTitle>
                      <AlertDescription>
                        {validationErrors.length} errors found in {csvData.length} records
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Error Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(errorCounts).map(([field, count]) => (
                              <div key={field} className="flex justify-between text-sm">
                                <span className="capitalize">{field}</span>
                                <Badge variant="destructive">{count}</Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="mr-2 h-4 w-4" />
                              Download Error Report
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Re-upload Fixed File
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Error Details</CardTitle>
                        <CardDescription>
                          Detailed list of validation errors
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Row</TableHead>
                              <TableHead>Field</TableHead>
                              <TableHead>Error</TableHead>
                              <TableHead>Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {validationErrors.map((error, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{error.row}</TableCell>
                                <TableCell className="capitalize">{error.field}</TableCell>
                                <TableCell className="text-red-600">{error.error}</TableCell>
                                <TableCell className="text-muted-foreground">{error.value}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {validationErrors.length === 0 && (
                  <div className="flex justify-end">
                    <Button onClick={processEnrollment} disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Process Enrollment
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Preview</CardTitle>
              <CardDescription>
                Review students to be enrolled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isProcessing ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium">Processing Enrollment</h3>
                    <p className="text-muted-foreground">Please wait while we process the student data...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{csvData.length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Ready to Enroll</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">{csvData.length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Estimated Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Math.ceil(csvData.length / 10)} min</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Academic Year</TableHead>
                          <TableHead>Pathway</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.studentId}</TableCell>
                            <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{row.academicYear}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{row.pathway}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">Ready</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end">
                      <Button onClick={() => setShowPreviewDialog(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Confirm Enrollment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Results</CardTitle>
              <CardDescription>
                Results of the bulk enrollment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollmentResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>No enrollment results yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{enrollmentResults.length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Successful</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {enrollmentResults.filter(r => r.success).length}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium">Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {enrollmentResults.filter(r => !r.success).length}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollmentResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{result.studentId}</TableCell>
                            <TableCell>{result.name}</TableCell>
                            <TableCell>{result.email}</TableCell>
                            <TableCell>
                              <Badge variant={result.success ? 'default' : 'destructive'}>
                                {result.success ? 'Success' : 'Failed'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {result.message}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Results
                      </Button>
                      <Button>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Welcome Emails
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll {csvData.length} students?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This action will create new student accounts and send welcome emails. 
                This cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="welcome-email">Send Welcome Emails</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes, send welcome emails</SelectItem>
                  <SelectItem value="no">No, skip welcome emails</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEnrollment}>
              <UserPlus className="mr-2 h-4 w-4" />
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
