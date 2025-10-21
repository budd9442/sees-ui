'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Calculator,
  Settings,
  Plus,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
} from 'lucide-react';
import type { RankingEntry } from '@/types';

// Mock data for weighted average configurations
const mockWeightedFormulas = [
  {
    id: 'formula-001',
    name: 'Standard Weighted Average',
    description: 'Default formula using module credits as weights',
    formula: 'SUM(grade * credits) / SUM(credits)',
    isActive: true,
    createdAt: '2025-12-15T10:00:00Z',
    lastUsed: '2025-12-15T14:30:00Z' as string | null,
    usageCount: 15
  },
  {
    id: 'formula-002',
    name: 'Advanced Weighted Average',
    description: 'Formula with additional factors for difficulty and importance',
    formula: 'SUM(grade * credits * difficulty_factor * importance_factor) / SUM(credits * difficulty_factor * importance_factor)',
    isActive: false,
    createdAt: '2025-12-14T15:00:00Z',
    lastUsed: '2025-12-14T16:00:00Z' as string | null,
    usageCount: 3
  },
  {
    id: 'formula-003',
    name: 'Core Module Priority',
    description: 'Emphasizes core modules over electives',
    formula: 'SUM(grade * credits * (1 + core_bonus)) / SUM(credits * (1 + core_bonus))',
    isActive: false,
    createdAt: '2025-12-13T09:00:00Z',
    lastUsed: '2025-12-13T10:00:00Z' as string | null,
    usageCount: 1
  }
];

const mockRankingEntries: RankingEntry[] = [
  {
    id: 'rank-001',
    studentId: 'STU001',
    studentName: 'Alice Johnson',
    gpa: 3.85,
    weightedAverage: 3.87,
    weightedScore: 3.89,
    rank: 1,
    previousRank: 2,
    change: 1,
    academicClass: 'First Class',
    pathway: 'MIT',
    specialization: 'BSE',
    semester: 'S2',
    academicYear: '2025',
    tiebreakApplied: true,
    tiebreakReason: 'Weighted average used for GPA tie',
    totalCredits: 65,
    passRate: 100
  },
  {
    id: 'rank-002',
    studentId: 'STU002',
    studentName: 'Bob Smith',
    gpa: 3.85,
    weightedAverage: 3.82,
    weightedScore: 3.84,
    rank: 2,
    previousRank: 1,
    change: -1,
    academicClass: 'First Class',
    pathway: 'MIT',
    specialization: 'OSCM',
    semester: 'S2',
    academicYear: '2025',
    tiebreakApplied: true,
    tiebreakReason: 'Weighted average used for GPA tie',
    totalCredits: 63,
    passRate: 100
  },
  {
    id: 'rank-003',
    studentId: 'STU003',
    studentName: 'Carol Davis',
    gpa: 3.80,
    weightedAverage: 3.80,
    weightedScore: 3.80,
    rank: 3,
    previousRank: 3,
    change: 0,
    academicClass: 'First Class',
    pathway: 'IT',
    specialization: 'IS',
    semester: 'S2',
    academicYear: '2025',
    tiebreakApplied: false,
    totalCredits: 64,
    passRate: 100
  }
];

const weightFactors = [
  { id: 'credits', label: 'Module Credits', description: 'Use module credit hours as weight', defaultWeight: 1.0 },
  { id: 'difficulty', label: 'Module Difficulty', description: 'Factor in module difficulty level', defaultWeight: 1.2 },
  { id: 'importance', label: 'Module Importance', description: 'Factor in module importance to degree', defaultWeight: 1.1 },
  { id: 'core_bonus', label: 'Core Module Bonus', description: 'Additional weight for core modules', defaultWeight: 0.1 },
  { id: 'year_level', label: 'Year Level', description: 'Weight based on academic year level', defaultWeight: 1.0 },
  { id: 'specialization', label: 'Specialization Relevance', description: 'Weight based on specialization relevance', defaultWeight: 1.0 }
];

export default function WeightedAverageConfigurationPage() {
  const [formulas, setFormulas] = useState(mockWeightedFormulas);
  const [rankings, setRankings] = useState(mockRankingEntries);
  const [selectedFormula, setSelectedFormula] = useState(mockWeightedFormulas[0]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formulaForm, setFormulaForm] = useState({
    name: '',
    description: '',
    formula: '',
    weights: weightFactors.reduce((acc, factor) => ({ ...acc, [factor.id]: factor.defaultWeight }), {} as Record<string, number>)
  });

  const handleCreateFormula = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFormula = {
        id: `formula-${Date.now()}`,
        name: formulaForm.name,
        description: formulaForm.description,
        formula: formulaForm.formula,
        isActive: false,
        createdAt: new Date().toISOString(),
        lastUsed: null as string | null,
        usageCount: 0
      };
      
      setFormulas(prev => [newFormula, ...prev]);
      setShowCreateDialog(false);
      setFormulaForm({
        name: '',
        description: '',
        formula: '',
        weights: weightFactors.reduce((acc, factor) => ({ ...acc, [factor.id]: factor.defaultWeight }), {} as Record<string, number>)
      });
    } catch (error) {
      console.error('Error creating formula:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFormula = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormulas(prev => 
        prev.map(formula => 
          formula.id === selectedFormula.id 
            ? { 
                ...formula, 
                name: formulaForm.name,
                description: formulaForm.description,
                formula: formulaForm.formula
              }
            : formula
        )
      );
      
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating formula:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateFormula = async (formulaId: string) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormulas(prev => 
        prev.map(formula => ({
          ...formula,
          isActive: formula.id === formulaId,
          lastUsed: formula.id === formulaId ? new Date().toISOString() : formula.lastUsed,
          usageCount: formula.id === formulaId ? formula.usageCount + 1 : formula.usageCount
        }))
      );
      
      setSelectedFormula(formulas.find(f => f.id === formulaId) || formulas[0]);
    } catch (error) {
      console.error('Error activating formula:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalculateRankings = async () => {
    setIsCalculating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate recalculation with new weighted averages
      setRankings(prev => 
        prev.map((entry, index) => ({
          ...entry,
          weightedAverage: entry.gpa + (Math.random() - 0.5) * 0.1,
          rank: index + 1,
          tiebreakApplied: entry.gpa === prev[index + 1]?.gpa || entry.gpa === prev[index - 1]?.gpa
        }))
      );
    } catch (error) {
      console.error('Error calculating rankings:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const openEditDialog = (formula: any) => {
    setSelectedFormula(formula);
    setFormulaForm({
      name: formula.name,
      description: formula.description,
      formula: formula.formula,
      weights: weightFactors.reduce((acc, factor) => ({ ...acc, [factor.id]: factor.defaultWeight }), {} as Record<string, number>)
    });
    setShowEditDialog(true);
  };

  const generateFormula = () => {
    const activeWeights = Object.entries(formulaForm.weights)
      .filter(([_, weight]) => weight !== 1.0)
      .map(([factor, weight]) => `${factor}_factor: ${weight}`);
    
    const formula = `SUM(grade * credits${activeWeights.length > 0 ? ' * ' + activeWeights.join(' * ') : ''}) / SUM(credits${activeWeights.length > 0 ? ' * ' + activeWeights.join(' * ') : ''})`;
    
    setFormulaForm(prev => ({ ...prev, formula }));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Weighted Average Configuration</h1>
            <p className="text-gray-600">
              Configure weighted average formulas for GPA tie-breaking in student rankings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Formula
            </Button>
            <Button 
              onClick={handleCalculateRankings}
              disabled={isCalculating}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              Recalculate Rankings
            </Button>
          </div>
        </div>
      </div>

      {/* Current Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Active Formula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formulas.find(f => f.isActive)?.name || 'None'}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Total Formulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formulas.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Available formulas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Students Ranked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {rankings.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Current semester
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="formulas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="formulas">Weighted Formulas</TabsTrigger>
          <TabsTrigger value="rankings">Current Rankings</TabsTrigger>
          <TabsTrigger value="preview">Formula Preview</TabsTrigger>
        </TabsList>

        {/* Weighted Formulas */}
        <TabsContent value="formulas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Weighted Average Formulas
              </CardTitle>
              <CardDescription>
                Manage formulas used for calculating weighted averages in student rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formulas.map((formula) => (
                  <div key={formula.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{formula.name}</h4>
                        {formula.isActive && (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                        <Badge variant="outline">v{formula.usageCount + 1}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{formula.description}</p>
                      <div className="bg-gray-50 p-2 rounded text-sm font-mono mb-2">
                        {formula.formula}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(formula.createdAt).toLocaleDateString()}</span>
                        {formula.lastUsed && (
                          <span>Last used: {new Date(formula.lastUsed).toLocaleDateString()}</span>
                        )}
                        <span>Used {formula.usageCount} times</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!formula.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleActivateFormula(formula.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(formula)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => console.log('Preview functionality')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current Rankings */}
        <TabsContent value="rankings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Student Rankings
              </CardTitle>
              <CardDescription>
                Student rankings with weighted averages applied for tie-breaking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Weighted Avg</TableHead>
                    <TableHead>Academic Class</TableHead>
                    <TableHead>Pathway</TableHead>
                    <TableHead>Tiebreak Applied</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{entry.rank}</span>
                          {entry.change && entry.change > 0 && (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                          {entry.change && entry.change < 0 && (
                            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.studentName}</div>
                          <div className="text-xs text-gray-500">{entry.studentId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">{entry.gpa.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">{entry.weightedAverage?.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.academicClass}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{entry.pathway}</div>
                          {entry.specialization && (
                            <div className="text-xs text-gray-500">{entry.specialization}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.tiebreakApplied ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Applied
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.change && entry.change > 0 && (
                          <span className="text-green-600">+{entry.change}</span>
                        )}
                        {entry.change && entry.change < 0 && (
                          <span className="text-red-600">{entry.change}</span>
                        )}
                        {!entry.change || entry.change === 0 && (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formula Preview */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Formula Preview & Testing
              </CardTitle>
              <CardDescription>
                Preview how the weighted average formula will be applied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Active Formula</h4>
                  <div className="font-mono text-sm bg-white p-2 rounded border">
                    {formulas.find(f => f.isActive)?.formula || 'No active formula'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Weight Factors</h4>
                    <div className="space-y-2">
                      {weightFactors.map((factor) => (
                        <div key={factor.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{factor.label}</div>
                            <div className="text-xs text-gray-600">{factor.description}</div>
                          </div>
                          <Badge variant="outline">{factor.defaultWeight}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Sample Calculation</h4>
                    <div className="bg-white p-4 border rounded">
                      <div className="text-sm space-y-1">
                        <div>Student: Alice Johnson</div>
                        <div>GPA: 3.85</div>
                        <div>Weighted Average: 3.87</div>
                        <div className="text-xs text-gray-600 mt-2">
                          Tiebreak applied due to identical GPA with Bob Smith
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Formula Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Weighted Average Formula</DialogTitle>
            <DialogDescription>
              Create a new formula for calculating weighted averages in student rankings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="formulaName">Formula Name</Label>
                <Input
                  id="formulaName"
                  placeholder="e.g., Advanced Weighted Average"
                  value={formulaForm.name}
                  onChange={(e) => setFormulaForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="formulaDescription">Description</Label>
                <Input
                  id="formulaDescription"
                  placeholder="Brief description of the formula"
                  value={formulaForm.description}
                  onChange={(e) => setFormulaForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="formula">Formula</Label>
              <Textarea
                id="formula"
                placeholder="Enter the mathematical formula"
                value={formulaForm.formula}
                onChange={(e) => setFormulaForm(prev => ({ ...prev, formula: e.target.value }))}
                rows={3}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateFormula}
                className="mt-2"
              >
                <Calculator className="h-4 w-4 mr-1" />
                Generate Formula
              </Button>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">Weight Factors</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weightFactors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">{factor.label}</div>
                      <div className="text-xs text-gray-600">{factor.description}</div>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formulaForm.weights[factor.id] || 1.0}
                      onChange={(e) => setFormulaForm(prev => ({
                        ...prev,
                        weights: { ...prev.weights, [factor.id]: parseFloat(e.target.value) }
                      }))}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFormula}
              disabled={!formulaForm.name || !formulaForm.formula || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Creating...' : 'Create Formula'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Formula Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Weighted Average Formula</DialogTitle>
            <DialogDescription>
              Modify the selected weighted average formula.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFormulaName">Formula Name</Label>
              <Input
                id="editFormulaName"
                value={formulaForm.name}
                onChange={(e) => setFormulaForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editFormulaDescription">Description</Label>
              <Input
                id="editFormulaDescription"
                value={formulaForm.description}
                onChange={(e) => setFormulaForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="editFormula">Formula</Label>
              <Textarea
                id="editFormula"
                value={formulaForm.formula}
                onChange={(e) => setFormulaForm(prev => ({ ...prev, formula: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateFormula}
              disabled={!formulaForm.name || !formulaForm.formula || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formula Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Weighted Average Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Formula Components</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>grade:</strong> Student's grade in the module</li>
                <li>• <strong>credits:</strong> Credit hours for the module</li>
                <li>• <strong>difficulty_factor:</strong> Module difficulty multiplier</li>
                <li>• <strong>importance_factor:</strong> Module importance multiplier</li>
                <li>• <strong>core_bonus:</strong> Additional weight for core modules</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Best Practices</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Keep formulas simple and understandable</li>
                <li>• Test formulas with sample data before activation</li>
                <li>• Document the reasoning behind weight factors</li>
                <li>• Consider fairness and transparency</li>
                <li>• Review and update formulas periodically</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning Alert */}
      <Alert className="mt-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Important Notice</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Changes to weighted average formulas will affect student rankings. 
          Ensure all stakeholders are informed before implementing new formulas.
        </AlertDescription>
      </Alert>
    </div>
  );
}
