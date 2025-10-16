'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Target,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Flag,
  Award,
  BookOpen,
  Zap,
  ChevronRight,
  Star,
  Clock,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AcademicGoal } from '@/types';

export default function GoalsPage() {
  const { user } = useAuthStore();
  const { academicGoals, addAcademicGoal, updateAcademicGoal } = useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AcademicGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'academic' as 'academic' | 'skill' | 'career' | 'personal',
    targetValue: '',
    targetGPA: '',
    targetClass: '',
    deadline: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    milestones: [] as string[],
  });

  const studentGoals = academicGoals.filter(g => g.studentId === user?.id);

  // Calculate overall progress
  const completedGoals = studentGoals.filter(g => g.currentProgress >= 100).length;
  const inProgressGoals = studentGoals.filter(g => g.isActive && g.currentProgress < 100).length;
  const overdueGoals = studentGoals.filter(g => g.deadline && new Date(g.deadline) < new Date() && g.currentProgress < 100).length;
  const overallProgress = studentGoals.length > 0
    ? Math.round((completedGoals / studentGoals.length) * 100)
    : 0;

  // Goal templates
  const goalTemplates = [
    {
      id: 'gpa-target',
      title: 'Achieve Target GPA',
      description: 'Set and work towards a specific GPA goal',
      category: 'academic' as const,
      icon: GraduationCap,
      color: 'text-blue-600 bg-blue-50',
      template: {
        title: 'Achieve First Class Honours',
        description: 'Maintain high academic performance to graduate with first class honours',
        category: 'academic' as const,
        targetGPA: '3.7',
        targetClass: 'First Class',
        priority: 'high' as const,
        milestones: [
          'Complete all assignments on time',
          'Maintain 90% attendance',
          'Participate in study groups',
          'Meet with advisor monthly',
        ],
      },
    },
    {
      id: 'skill-development',
      title: 'Skill Development',
      description: 'Learn new technical or soft skills',
      category: 'skill' as const,
      icon: Zap,
      color: 'text-green-600 bg-green-50',
      template: {
        title: 'Master Programming Languages',
        description: 'Learn and become proficient in new programming languages',
        category: 'skill' as const,
        targetValue: '3 languages',
        priority: 'medium' as const,
        milestones: [
          'Complete online courses',
          'Build portfolio projects',
          'Contribute to open source',
          'Get industry certification',
        ],
      },
    },
    {
      id: 'career-prep',
      title: 'Career Preparation',
      description: 'Prepare for your future career',
      category: 'career' as const,
      icon: Briefcase,
      color: 'text-purple-600 bg-purple-50',
      template: {
        title: 'Build Professional Network',
        description: 'Connect with industry professionals and build your network',
        category: 'career' as const,
        targetValue: '50 connections',
        priority: 'medium' as const,
        milestones: [
          'Attend networking events',
          'Join professional groups',
          'Connect on LinkedIn',
          'Schedule informational interviews',
        ],
      },
    },
    {
      id: 'personal-growth',
      title: 'Personal Development',
      description: 'Focus on personal growth and well-being',
      category: 'personal' as const,
      icon: Heart,
      color: 'text-pink-600 bg-pink-50',
      template: {
        title: 'Improve Work-Life Balance',
        description: 'Develop better time management and stress management skills',
        category: 'personal' as const,
        targetValue: '8 hours sleep',
        priority: 'high' as const,
        milestones: [
          'Create daily schedule',
          'Practice mindfulness',
          'Exercise regularly',
          'Take breaks between study sessions',
        ],
      },
    },
  ];

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return BookOpen;
      case 'skill': return Zap;
      case 'career': return Briefcase;
      case 'personal': return Heart;
      default: return Target;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (goal: AcademicGoal) => {
    if (goal.currentProgress >= 100) return 'text-green-600 bg-green-50';
    if (goal.deadline && new Date(goal.deadline) < new Date()) return 'text-red-600 bg-red-50';
    if (goal.currentProgress >= 75) return 'text-blue-600 bg-blue-50';
    if (goal.currentProgress >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const resetForm = () => {
    setNewGoal({
      title: '',
      description: '',
      category: 'academic',
      targetValue: '',
      targetGPA: '',
      targetClass: '',
      deadline: '',
      priority: 'medium',
      milestones: [],
    });
  };

  const handleAddGoal = () => {
    if (!newGoal.title || (!newGoal.targetValue && !newGoal.targetGPA)) {
      toast.error('Please fill in required fields');
      return;
    }

    const goal: AcademicGoal = {
      id: `GOAL${Date.now()}`,
      studentId: user?.id || '',
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetGPA: newGoal.targetGPA ? parseFloat(newGoal.targetGPA) : undefined,
      targetClass: newGoal.targetClass || undefined,
      targetValue: newGoal.targetValue || `${newGoal.targetGPA} GPA`,
      currentValue: '0%',
      targetDate: newGoal.deadline,
      deadline: newGoal.deadline,
      currentProgress: 0,
      progress: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      milestones: newGoal.milestones,
    };

    addAcademicGoal(goal);
    toast.success('Goal added successfully!');
    setShowAddDialog(false);
    resetForm();
  };

  const handleEditGoal = (goal: AcademicGoal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      targetGPA: goal.targetGPA?.toString() || '',
      targetClass: goal.targetClass || '',
      deadline: goal.deadline || '',
      priority: goal.priority,
      milestones: goal.milestones,
    });
    setShowAddDialog(true);
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !newGoal.title) {
      toast.error('Please fill in required fields');
      return;
    }

    const updatedGoal: Partial<AcademicGoal> = {
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetGPA: newGoal.targetGPA ? parseFloat(newGoal.targetGPA) : undefined,
      targetClass: newGoal.targetClass || undefined,
      targetValue: newGoal.targetValue || `${newGoal.targetGPA} GPA`,
      targetDate: newGoal.deadline,
      deadline: newGoal.deadline,
      milestones: newGoal.milestones,
    };

    updateAcademicGoal(editingGoal.id, updatedGoal);
    toast.success('Goal updated successfully!');
    setShowAddDialog(false);
    setEditingGoal(null);
    resetForm();
  };

  const handleDeleteGoal = (goalId: string) => {
    updateAcademicGoal(goalId, { isActive: false });
    toast.success('Goal deleted successfully!');
  };

  const handleToggleGoalStatus = (goalId: string) => {
    const goal = studentGoals.find(g => g.id === goalId);
    if (goal) {
      const newProgress = goal.currentProgress >= 100 ? 0 : 100;
      updateAcademicGoal(goalId, { 
        currentProgress: newProgress,
        progress: newProgress,
        currentValue: newProgress >= 100 ? goal.targetValue : '0%'
      });
      toast.success(newProgress >= 100 ? 'Goal completed!' : 'Goal reopened');
    }
  };

  const handleUseTemplate = (template: any) => {
    setNewGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      targetValue: template.targetValue || '',
      targetGPA: template.targetGPA || '',
      targetClass: template.targetClass || '',
      deadline: '',
      priority: template.priority,
      milestones: template.milestones,
    });
    setShowTemplateDialog(false);
    setShowAddDialog(true);
  };

  const addMilestone = () => {
    setNewGoal(prev => ({
      ...prev,
      milestones: [...prev.milestones, '']
    }));
  };

  const updateMilestone = (index: number, value: string) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => i === index ? value : milestone)
    }));
  };

  const removeMilestone = (index: number) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Academic Goals</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and achieve your academic ambitions
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lightbulb className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Goal Templates</DialogTitle>
                <DialogDescription>
                  Choose from pre-made goal templates to get started quickly
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                {goalTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${template.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.title}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={() => handleUseTemplate(template.template)}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingGoal(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                <DialogDescription>
                  {editingGoal ? 'Update your goal details' : 'Set a new academic or personal goal to track your progress'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Achieve 3.8 GPA this semester"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Describe your goal and how you plan to achieve it"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="skill">Skill Development</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value) => setNewGoal({ ...newGoal, priority: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="targetGPA">Target GPA</Label>
                    <Input
                      id="targetGPA"
                      type="number"
                      step="0.1"
                      min="0"
                      max="4"
                      value={newGoal.targetGPA}
                      onChange={(e) => setNewGoal({ ...newGoal, targetGPA: e.target.value })}
                      placeholder="e.g., 3.7"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="targetClass">Target Class</Label>
                    <Select
                      value={newGoal.targetClass}
                      onValueChange={(value) => setNewGoal({ ...newGoal, targetClass: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="First Class">First Class</SelectItem>
                        <SelectItem value="Second Class Upper">Second Class Upper</SelectItem>
                        <SelectItem value="Second Class Lower">Second Class Lower</SelectItem>
                        <SelectItem value="Third Class">Third Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      value={newGoal.targetValue}
                      onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                      placeholder="e.g., 3 languages, 50 connections"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Milestones</Label>
                    <Button size="sm" variant="outline" onClick={addMilestone}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Milestone
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={milestone}
                          onChange={(e) => updateMilestone(index, e.target.value)}
                          placeholder={`Milestone ${index + 1}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeMilestone(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={editingGoal ? handleUpdateGoal : handleAddGoal}>
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentGoals.length}</div>
            <p className="text-xs text-muted-foreground">Active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressGoals}</div>
            <p className="text-xs text-muted-foreground">Working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals}</div>
            <p className="text-xs text-muted-foreground">Achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueGoals}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Key Milestones</CardTitle>
          <CardDescription>
            Major achievements you're working towards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <div key={milestone.id} className="flex gap-4 p-4 rounded-lg border">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${milestone.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Goals</CardTitle>
              <CardDescription>
                Track and manage your academic and personal goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No goals yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by creating your first academic goal
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Goal
                    </Button>
                  </div>
                ) : (
                  studentGoals.map((goal) => {
                    const CategoryIcon = getCategoryIcon(goal.category);
                    const statusColor = getStatusColor(goal);
                    const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.currentProgress < 100;
                    
                    return (
                      <div key={goal.id} className={`flex items-start gap-4 p-4 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                        <Checkbox
                          checked={goal.currentProgress >= 100}
                          onCheckedChange={() => handleToggleGoalStatus(goal.id)}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-semibold">{goal.title}</h4>
                                {isOverdue && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(goal.priority)}>
                                {goal.priority}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditGoal(goal)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Target: {goal.targetValue}
                            </span>
                            {goal.currentValue && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Current: {goal.currentValue}
                              </span>
                            )}
                            {goal.deadline && (
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{goal.currentProgress}%</span>
                            </div>
                            <Progress value={goal.currentProgress} className="h-2" />
                          </div>
                          {goal.milestones && goal.milestones.length > 0 && (
                            <div className="space-y-1">
                              <h5 className="text-sm font-medium">Milestones:</h5>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {goal.milestones.slice(0, 3).map((milestone, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Circle className="h-3 w-3" />
                                    {milestone}
                                  </li>
                                ))}
                                {goal.milestones.length > 3 && (
                                  <li className="text-xs text-muted-foreground">
                                    +{goal.milestones.length - 3} more milestones
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Goals you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentGoals.filter(g => g.isActive && g.currentProgress < 100).map((goal) => {
                  const CategoryIcon = getCategoryIcon(goal.category);
                  return (
                    <div key={goal.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">{goal.title}</h4>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{goal.currentProgress}%</span>
                        </div>
                        <Progress value={goal.currentProgress} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Goals</CardTitle>
              <CardDescription>Goals you've successfully achieved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentGoals.filter(g => g.currentProgress >= 100).map((goal) => {
                  const CategoryIcon = getCategoryIcon(goal.category);
                  return (
                    <div key={goal.id} className="flex items-start gap-4 p-4 rounded-lg border bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">{goal.title}</h4>
                        </div>
                        <p className="text-sm text-green-700">Completed successfully!</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Goals</CardTitle>
              <CardDescription>Goals that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentGoals.filter(g => g.deadline && new Date(g.deadline) < new Date() && g.currentProgress < 100).map((goal) => {
                  const CategoryIcon = getCategoryIcon(goal.category);
                  return (
                    <div key={goal.id} className="flex items-start gap-4 p-4 rounded-lg border border-red-200 bg-red-50">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">{goal.title}</h4>
                        </div>
                        <p className="text-sm text-red-700">
                          Deadline: {goal.deadline && new Date(goal.deadline).toLocaleDateString()}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => handleEditGoal(goal)}>
                          Update Goal
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips and Motivation */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Set SMART Goals</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Make goals Specific, Measurable, Achievable, Relevant, and Time-bound
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Break It Down</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Divide large goals into smaller, manageable milestones
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Track Progress</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Regularly review and update your progress to stay motivated
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}