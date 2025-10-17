'use client';

import { useState } from 'react';
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
  GraduationCap,
  Users,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Calendar,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HODPathwaysPage() {
  const { user } = useAuthStore();
  const { students, pathwayDemand } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPathway, setSelectedPathway] = useState('all');
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [targetPathway, setTargetPathway] = useState('');
  const [allocationReason, setAllocationReason] = useState('');

  // Available pathways
  const availablePathways = [
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Mobile Development',
    'Web Development',
    'Artificial Intelligence',
    'Cloud Computing',
    'Game Development',
  ];

  // Filter students
  const filteredStudents = students.filter(student => {
    const term = (searchTerm || '').toLowerCase();
    const name = `${student.firstName} ${student.lastName}`.toLowerCase();
    const studentId = (student.studentId || '').toLowerCase();
    const email = (student.email || '').toLowerCase();
    
    const matchesSearch = name.includes(term) || studentId.includes(term) || email.includes(term);
    const matchesYear = selectedYear === 'all' || student.academicYear === selectedYear;
    const matchesPathway = selectedPathway === 'all' || student.specialization === selectedPathway;

    return matchesSearch && matchesYear && matchesPathway;
  });

  // Calculate pathway statistics
  const pathwayStats = availablePathways.map(pathway => {
    const pathwayStudents = students.filter(s => s.specialization === pathway);
    const avgGPA = pathwayStudents.length > 0
      ? pathwayStudents.reduce((sum, s) => sum + s.currentGPA, 0) / pathwayStudents.length
      : 0;
    const atRisk = pathwayStudents.filter(s => s.currentGPA < 2.5).length;
    const capacity = 50; // Mock capacity per pathway
    
    return {
      pathway,
      students: pathwayStudents.length,
      capacity,
      utilization: Math.round((pathwayStudents.length / capacity) * 100),
      averageGPA: avgGPA.toFixed(2),
      atRisk,
      available: capacity - pathwayStudents.length,
    };
  });

  // Students without pathway assignment
  const unassignedStudents = students.filter(s => !s.specialization);

  // Students eligible for pathway change
  const eligibleStudents = students.filter(s => 
    s.specialization && 
    s.currentGPA >= 2.5 &&
    s.academicYear === 'L2' // Mock: L2 students can change pathways
  );

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleAllocatePathway = () => {
    if (!targetPathway || selectedStudents.length === 0) {
      toast.error('Please select students and target pathway');
      return;
    }

    // Mock allocation logic
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        // Update student pathway
        console.log(`Allocating ${student.firstName} ${student.lastName} to ${targetPathway}`);
      }
    });

    toast.success(`Successfully allocated ${selectedStudents.length} students to ${targetPathway}`);
    setShowAllocationDialog(false);
    setSelectedStudents([]);
    setTargetPathway('');
    setAllocationReason('');
  };

  const handleBulkAllocation = (pathway: string) => {
    setTargetPathway(pathway);
    setSelectedStudents(unassignedStudents.map(s => s.id));
    setShowAllocationDialog(true);
  };

  const getPathwayColor = (pathway: string) => {
    const colors: { [key: string]: string } = {
      'Software Engineering': 'bg-blue-500',
      'Data Science': 'bg-green-500',
      'Cybersecurity': 'bg-red-500',
      'Mobile Development': 'bg-purple-500',
      'Web Development': 'bg-orange-500',
      'Artificial Intelligence': 'bg-pink-500',
      'Cloud Computing': 'bg-cyan-500',
      'Game Development': 'bg-yellow-500',
    };
    return colors[pathway] || 'bg-gray-500';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Pathway Allocation</h1>
          <p className="text-muted-foreground mt-1">
            Manage student pathway assignments and capacity planning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Allocation
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">All students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unassignedStudents.length}</div>
            <p className="text-xs text-muted-foreground">Need pathway</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Eligible for Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{eligibleStudents.length}</div>
            <p className="text-xs text-muted-foreground">Can switch pathways</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Pathways</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availablePathways.length}</div>
            <p className="text-xs text-muted-foreground">Active pathways</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {unassignedStudents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            {unassignedStudents.length} students need pathway assignment. Review and allocate them to appropriate pathways.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2">L2</SelectItem>
                  <SelectItem value="L3">L3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pathway">Pathway</Label>
              <Select value={selectedPathway} onValueChange={setSelectedPathway}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pathways</SelectItem>
                  <SelectItem value="Undecided">Unassigned</SelectItem>
                  {availablePathways.map(pathway => (
                    <SelectItem key={pathway} value={pathway}>{pathway}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="changes">Pathway Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pathway Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Pathway Statistics</CardTitle>
                <CardDescription>
                  Current enrollment and capacity by pathway
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pathwayStats.map((stat) => (
                    <div key={stat.pathway} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPathwayColor(stat.pathway)}`} />
                          <span className="font-medium">{stat.pathway}</span>
                        </div>
                        <Badge variant="outline">{stat.students}/{stat.capacity}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilization</span>
                          <span className={getUtilizationColor(stat.utilization)}>
                            {stat.utilization}%
                          </span>
                        </div>
                        <Progress value={stat.utilization} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Avg GPA: {stat.averageGPA}</span>
                          <span>At Risk: {stat.atRisk}</span>
                          <span>Available: {stat.available}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common pathway management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleBulkAllocation('Software Engineering')}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Bulk Assign to Software Engineering
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleBulkAllocation('Data Science')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Bulk Assign to Data Science
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleBulkAllocation('Cybersecurity')}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Bulk Assign to Cybersecurity
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowAllocationDialog(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Manual Pathway Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Allocation</CardTitle>
              <CardDescription>
                Assign students to pathways based on their preferences and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAllStudents}
                    />
                    <span className="text-sm font-medium">
                      Select All ({filteredStudents.length} students)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAllocationDialog(true)}
                      disabled={selectedStudents.length === 0}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Assign Pathway ({selectedStudents.length})
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Current Pathway</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.studentId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.academicYear}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.specialization ? 'secondary' : 'destructive'}>
                            {student.specialization || 'Unassigned'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{student.currentGPA.toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.currentGPA >= 2.5 ? 'default' : 'destructive'}>
                            {student.currentGPA >= 2.5 ? 'Good Standing' : 'At Risk'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedStudents([student.id]);
                              setShowAllocationDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Management</CardTitle>
              <CardDescription>
                Monitor and manage pathway capacity limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pathwayStats.map((stat) => (
                  <div key={stat.pathway} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getPathwayColor(stat.pathway)}`} />
                        <h4 className="font-semibold">{stat.pathway}</h4>
                      </div>
                      <Badge variant={stat.utilization >= 90 ? 'destructive' : stat.utilization >= 75 ? 'default' : 'secondary'}>
                        {stat.utilization}% Full
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacity Utilization</span>
                        <span>{stat.students} / {stat.capacity} students</span>
                      </div>
                      <Progress value={stat.utilization} className="h-2" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-semibold text-green-600">{stat.available}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Average GPA</p>
                          <p className="font-semibold">{stat.averageGPA}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">At Risk</p>
                          <p className="font-semibold text-red-600">{stat.atRisk}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pathway Change Requests</CardTitle>
              <CardDescription>
                Students eligible for pathway changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibleStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4" />
                    <p>No students eligible for pathway changes</p>
                  </div>
                ) : (
                  eligibleStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {student.studentId} • {student.academicYear}
                          </p>
                        </div>
                        <Badge variant="secondary">{student.specialization}</Badge>
                        <Badge variant="outline">GPA: {student.currentGPA.toFixed(2)}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Allocation Dialog */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Pathway</DialogTitle>
            <DialogDescription>
              Assign selected students to a pathway
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pathway">Target Pathway</Label>
              <Select value={targetPathway} onValueChange={setTargetPathway}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pathway" />
                </SelectTrigger>
                <SelectContent>
                  {availablePathways.map(pathway => (
                    <SelectItem key={pathway} value={pathway}>{pathway}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Allocation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Reason for pathway assignment..."
                value={allocationReason}
                onChange={(e) => setAllocationReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium">Selected Students: {selectedStudents.length}</p>
              <p className="text-xs text-muted-foreground">
                Students will be assigned to {targetPathway || 'selected pathway'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllocationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAllocatePathway}>
              <Save className="mr-2 h-4 w-4" />
              Assign Pathway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
