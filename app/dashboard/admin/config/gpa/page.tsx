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
  Calculator,
  Settings,
  Save,
  RefreshCw,
  History,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  Copy,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SystemConfiguration } from '@/types';

export default function GpaPage() {
  const { user } = useAuthStore();
  const { systemConfiguration, updateSystemConfiguration } = useAppStore();
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [gpaConfig, setGpaConfig] = useState({
    calculationMethod: 'weighted_average' as 'weighted_average' | 'cumulative' | 'custom',
    gradePointScale: {
      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0,
    },
    academicClassThresholds: {
      firstClass: 3.7,
      secondUpper: 3.0,
      secondLower: 2.5,
      thirdPass: 2.0,
    },
    tiebreakerFormula: {
      gpa: 0.6,
      credits: 0.2,
      attendance: 0.1,
      participation: 0.1,
    },
    customFormula: '',
    roundingRules: {
      decimalPlaces: 2,
      roundingMethod: 'round' as 'round' | 'floor' | 'ceil',
    },
  });

  const [gradeScale, setGradeScale] = useState(gpaConfig.gradePointScale);
  const [thresholds, setThresholds] = useState(gpaConfig.academicClassThresholds);
  const [tiebreaker, setTiebreaker] = useState(gpaConfig.tiebreakerFormula);

  const handleSaveConfiguration = () => {
    const config = {
      ...gpaConfig,
      gradePointScale: gradeScale,
      academicClassThresholds: thresholds,
      tiebreakerFormula: tiebreaker,
    };
    
    setGpaConfig(config);
    toast.success('GPA configuration saved successfully!');
  };

  const handleResetToDefault = () => {
    setGradeScale(gpaConfig.gradePointScale);
    setThresholds(gpaConfig.academicClassThresholds);
    setTiebreaker(gpaConfig.tiebreakerFormula);
    toast.success('Configuration reset to default values');
  };

  const handleExportConfiguration = (format: 'json' | 'csv' | 'pdf') => {
    toast.success(`GPA configuration exported as ${format.toUpperCase()} successfully!`);
  };

  const handleImportConfiguration = () => {
    toast.success('GPA configuration imported successfully!');
  };

  const calculateSampleGPA = () => {
    // Mock calculation for preview
    const sampleGrades = [
      { grade: 'A', credits: 3 },
      { grade: 'B+', credits: 3 },
      { grade: 'A-', credits: 3 },
      { grade: 'B', credits: 3 },
    ];

    const totalPoints = sampleGrades.reduce((sum, grade) => {
      return sum + (gradeScale[grade.grade as keyof typeof gradeScale] * grade.credits);
    }, 0);

    const totalCredits = sampleGrades.reduce((sum, grade) => sum + grade.credits, 0);
    const gpa = totalPoints / totalCredits;

    return {
      gpa: gpa.toFixed(2),
      academicClass: getAcademicClass(gpa),
      sampleGrades,
    };
  };

  const getAcademicClass = (gpa: number) => {
    if (gpa >= thresholds.firstClass) return 'First Class';
    if (gpa >= thresholds.secondUpper) return 'Second Upper';
    if (gpa >= thresholds.secondLower) return 'Second Lower';
    return 'Third/Pass';
  };

  const sampleCalculation = calculateSampleGPA();

  const configurationHistory = [
    {
      id: '1',
      version: 'v2.1',
      description: 'Updated grade point scale for A+ grade',
      changedBy: 'Admin User',
      changedAt: '2025-01-15 10:30:00',
      changes: ['Added A+ grade with 4.0 points', 'Updated thresholds'],
    },
    {
      id: '2',
      version: 'v2.0',
      description: 'Major GPA calculation overhaul',
      changedBy: 'System Admin',
      changedAt: '2025-01-01 09:00:00',
      changes: ['Changed to weighted average method', 'Updated tiebreaker formula'],
    },
    {
      id: '3',
      version: 'v1.5',
      description: 'Minor threshold adjustments',
      changedBy: 'Admin User',
      changedAt: '2023-12-15 14:20:00',
      changes: ['Adjusted Second Lower threshold to 2.5'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">GPA Formula & Thresholds Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure GPA calculation methods, grade scales, and academic class thresholds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHistoryDialog(true)}>
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
          <Button variant="outline" onClick={() => setShowPreviewDialog(true)}>
            <Target className="mr-2 h-4 w-4" />
            Preview Calculation
          </Button>
          <Button variant="outline" onClick={() => handleExportConfiguration('json')}>
            <Download className="mr-2 h-4 w-4" />
            Export Config
          </Button>
          <Button onClick={handleSaveConfiguration}>
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Current Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Current Configuration Status
          </CardTitle>
          <CardDescription>
            Active GPA calculation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Calculation Method</Label>
              <Badge variant="outline" className="capitalize">
                {gpaConfig.calculationMethod.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Grade Scale</Label>
              <Badge variant="outline">
                {Object.keys(gradeScale).length} grades
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Academic Classes</Label>
              <Badge variant="outline">4 classes</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Updated</Label>
              <Badge variant="outline">
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calculation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculation">Calculation Method</TabsTrigger>
          <TabsTrigger value="gradescale">Grade Scale</TabsTrigger>
          <TabsTrigger value="thresholds">Academic Classes</TabsTrigger>
          <TabsTrigger value="tiebreaker">Tiebreaker Formula</TabsTrigger>
        </TabsList>

        <TabsContent value="calculation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GPA Calculation Method</CardTitle>
              <CardDescription>
                Configure how GPA is calculated for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calculation-method">Calculation Method</Label>
                  <Select
                    value={gpaConfig.calculationMethod}
                    onValueChange={(value) => setGpaConfig({ ...gpaConfig, calculationMethod: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weighted_average">Weighted Average</SelectItem>
                      <SelectItem value="cumulative">Cumulative</SelectItem>
                      <SelectItem value="custom">Custom Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {gpaConfig.calculationMethod === 'weighted_average' && (
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertTitle>Weighted Average Method</AlertTitle>
                    <AlertDescription>
                      GPA = Σ(Grade Points × Credits) / Σ(Credits)
                      <br />
                      This method weights each grade by the number of credits for that module.
                    </AlertDescription>
                  </Alert>
                )}

                {gpaConfig.calculationMethod === 'cumulative' && (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Cumulative Method</AlertTitle>
                    <AlertDescription>
                      GPA = Σ(Grade Points) / Number of Modules
                      <br />
                      This method treats all modules equally regardless of credit value.
                    </AlertDescription>
                  </Alert>
                )}

                {gpaConfig.calculationMethod === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-formula">Custom Formula</Label>
                    <Textarea
                      id="custom-formula"
                      value={gpaConfig.customFormula}
                      onChange={(e) => setGpaConfig({ ...gpaConfig, customFormula: e.target.value })}
                      placeholder="Enter custom GPA calculation formula..."
                      rows={4}
                    />
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Custom Formula</AlertTitle>
                      <AlertDescription>
                        Use variables like: totalPoints, totalCredits, moduleCount
                        <br />
                        Example: (totalPoints / totalCredits) * 0.9 + (moduleCount * 0.1)
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="decimal-places">Decimal Places</Label>
                    <Input
                      id="decimal-places"
                      type="number"
                      min="0"
                      max="4"
                      value={gpaConfig.roundingRules.decimalPlaces}
                      onChange={(e) => setGpaConfig({
                        ...gpaConfig,
                        roundingRules: {
                          ...gpaConfig.roundingRules,
                          decimalPlaces: parseInt(e.target.value),
                        },
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rounding-method">Rounding Method</Label>
                    <Select
                      value={gpaConfig.roundingRules.roundingMethod}
                      onValueChange={(value) => setGpaConfig({
                        ...gpaConfig,
                        roundingRules: {
                          ...gpaConfig.roundingRules,
                          roundingMethod: value as any,
                        },
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">Round</SelectItem>
                        <SelectItem value="floor">Floor</SelectItem>
                        <SelectItem value="ceil">Ceiling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gradescale" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Point Scale</CardTitle>
              <CardDescription>
                Configure the grade point values for each letter grade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(gradeScale).map(([grade, points]) => (
                    <div key={grade} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-12 text-center">
                          {grade}
                        </Badge>
                        <span className="font-medium">Grade Points</span>
                      </div>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={points}
                        onChange={(e) => setGradeScale({
                          ...gradeScale,
                          [grade]: parseFloat(e.target.value),
                        })}
                        className="w-20"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setGradeScale(gpaConfig.gradePointScale)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                  <Button variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Scale
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Class Thresholds</CardTitle>
              <CardDescription>
                Set GPA thresholds for academic class classifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-class">First Class</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="first-class"
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={thresholds.firstClass}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          firstClass: parseFloat(e.target.value),
                        })}
                      />
                      <span className="text-sm text-muted-foreground">and above</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="second-upper">Second Upper</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="second-upper"
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={thresholds.secondUpper}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          secondUpper: parseFloat(e.target.value),
                        })}
                      />
                      <span className="text-sm text-muted-foreground">to {thresholds.firstClass - 0.01}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="second-lower">Second Lower</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="second-lower"
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={thresholds.secondLower}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          secondLower: parseFloat(e.target.value),
                        })}
                      />
                      <span className="text-sm text-muted-foreground">to {thresholds.secondUpper - 0.01}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="third-pass">Third/Pass</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="third-pass"
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={thresholds.thirdPass}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          thirdPass: parseFloat(e.target.value),
                        })}
                      />
                      <span className="text-sm text-muted-foreground">to {thresholds.secondLower - 0.01}</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Threshold Validation</AlertTitle>
                  <AlertDescription>
                    Ensure thresholds are in descending order: First Class ≥ Second Upper ≥ Second Lower ≥ Third/Pass
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setThresholds(gpaConfig.academicClassThresholds)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiebreaker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tiebreaker Formula</CardTitle>
              <CardDescription>
                Configure weights for tiebreaker factors when GPAs are tied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertTitle>Tiebreaker Logic</AlertTitle>
                  <AlertDescription>
                    When students have the same GPA, these factors are used to determine ranking order.
                    Weights must sum to 1.0.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gpa-weight">GPA Weight</Label>
                    <Input
                      id="gpa-weight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={tiebreaker.gpa}
                      onChange={(e) => setTiebreaker({ ...tiebreaker, gpa: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits-weight">Credits Weight</Label>
                    <Input
                      id="credits-weight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={tiebreaker.credits}
                      onChange={(e) => setTiebreaker({ ...tiebreaker, credits: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendance-weight">Attendance Weight</Label>
                    <Input
                      id="attendance-weight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={tiebreaker.attendance}
                      onChange={(e) => setTiebreaker({ ...tiebreaker, attendance: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="participation-weight">Participation Weight</Label>
                    <Input
                      id="participation-weight"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={tiebreaker.participation}
                      onChange={(e) => setTiebreaker({ ...tiebreaker, participation: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-sm font-medium">Total Weight: {
                    (tiebreaker.gpa + tiebreaker.credits + tiebreaker.attendance + tiebreaker.participation).toFixed(1)
                  }</div>
                  {(tiebreaker.gpa + tiebreaker.credits + tiebreaker.attendance + tiebreaker.participation) !== 1.0 && (
                    <div className="text-sm text-red-600">Weights must sum to 1.0</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setTiebreaker(gpaConfig.tiebreakerFormula)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configuration History</DialogTitle>
            <DialogDescription>
              Version history of GPA configuration changes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {configurationHistory.map((version) => (
              <div key={version.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{version.version}</Badge>
                    <span className="font-medium">{version.description}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{version.changedAt}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Changed by: {version.changedBy}
                </div>
                <div className="space-y-1">
                  {version.changes.map((change, index) => (
                    <div key={index} className="text-sm">• {change}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Close
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Calculation Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>GPA Calculation Preview</DialogTitle>
            <DialogDescription>
              Preview how GPA is calculated with current settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sample Grades</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grade</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleCalculation.sampleGrades.map((grade, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{grade.grade}</Badge>
                      </TableCell>
                      <TableCell>{grade.credits}</TableCell>
                      <TableCell>{gradeScale[grade.grade as keyof typeof gradeScale]}</TableCell>
                      <TableCell>
                        {(gradeScale[grade.grade as keyof typeof gradeScale] * grade.credits).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Calculated GPA:</span>
                  <span className="font-bold text-lg">{sampleCalculation.gpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Academic Class:</span>
                  <Badge variant="outline">{sampleCalculation.academicClass}</Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
