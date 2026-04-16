'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Code,
  Database,
  Network,
  BarChart3,
  CheckCircle,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { SpecializationPreference, Specialization } from '@/types';
import { getSpecializationPreferences, submitSpecializationPreferences } from '@/lib/actions/specialization-actions';
import { useRouter, useSearchParams } from 'next/navigation';

const specializations = [
  {
    id: 'BSE',
    name: 'Business Systems Engineering',
    description: 'Focus on designing and implementing business solutions using technology',
    icon: BarChart3,
    skills: ['Business Analysis', 'System Design', 'Process Optimization', 'Requirements Engineering'],
    careers: ['Business Analyst', 'Systems Engineer', 'Process Consultant', 'Solution Architect'],
    modules: ['Business Process Management', 'Enterprise Architecture', 'Systems Analysis', 'Project Management']
  },
  {
    id: 'OSCM',
    name: 'Operations & Supply Chain Management',
    description: 'Focus on optimizing operations and managing supply chains using technology',
    icon: Network,
    skills: ['Supply Chain Optimization', 'Operations Management', 'Logistics', 'Quality Control'],
    careers: ['Operations Manager', 'Supply Chain Analyst', 'Logistics Coordinator', 'Quality Manager'],
    modules: ['Supply Chain Management', 'Operations Research', 'Quality Management', 'Logistics']
  },
  {
    id: 'IS',
    name: 'Information Systems',
    description: 'Focus on managing information systems and technology infrastructure',
    icon: Database,
    skills: ['Database Management', 'System Administration', 'IT Governance', 'Data Management'],
    careers: ['Database Administrator', 'IT Manager', 'System Administrator', 'Data Manager'],
    modules: ['Database Systems', 'IT Infrastructure', 'Information Security', 'Data Analytics']
  }
];

const technicalInterests = [
  { id: 'business_process', label: 'Business Process Improvement', description: 'Optimizing workflows, redesigning operations, and improving service quality' },
  { id: 'operations_planning', label: 'Operations Planning', description: 'Capacity planning, scheduling, and performance improvement in operations' },
  { id: 'supply_chain', label: 'Supply Chain and Logistics', description: 'Procurement, warehousing, transportation, and network coordination' },
  { id: 'enterprise_systems', label: 'Enterprise Systems', description: 'ERP-enabled business process integration and enterprise coordination' },
  { id: 'information_governance', label: 'Information and Governance', description: 'Information quality, policy compliance, controls, and assurance' },
  { id: 'data_decision', label: 'Data-Driven Decision Making', description: 'Managerial analytics, KPI tracking, and evidence-based decisions' },
];

const careerFocus = [
  { id: 'process_improvement', label: 'Process Improvement and Optimization', description: 'Improving organizational workflows, efficiency, and service quality' },
  { id: 'operations_coordination', label: 'Operations Planning and Coordination', description: 'Planning resources, schedules, and execution across teams' },
  { id: 'logistics_decisions', label: 'Logistics and Distribution Decisions', description: 'Supporting movement of goods/services, inventory, and fulfillment decisions' },
  { id: 'enterprise_integration', label: 'Enterprise Integration and Digitalization', description: 'Using organization-wide systems to integrate departments and data' },
  { id: 'governance_risk_controls', label: 'Governance, Risk, and Controls', description: 'Ensuring compliance, controls, and information assurance in organizations' },
  { id: 'data_for_management', label: 'Data for Managerial Decision-Making', description: 'Using analytics and reporting to support strategic and operational choices' },
];

const projectTypes = [
  { id: 'process_redesign', label: 'Process Redesign Projects', description: 'Improving cross-functional workflows and service delivery' },
  { id: 'operations_optimization', label: 'Operations Optimization', description: 'Improving throughput, planning, scheduling, and efficiency' },
  { id: 'supply_chain_analytics', label: 'Supply Chain Analytics', description: 'Forecasting, inventory decisions, and logistics performance analytics' },
  { id: 'enterprise_implementation', label: 'Enterprise System Implementation', description: 'ERP/enterprise tool rollout and business integration support' },
  { id: 'governance_assurance', label: 'Governance and Assurance', description: 'Risk, controls, compliance, and information assurance initiatives' },
  { id: 'innovation_strategy', label: 'Digital Innovation Strategy', description: 'Technology strategy, innovation, and business model improvement' },
];

const learningGoals = [
  { id: 'strategic_decision_making', label: 'Strategic Decision Making', description: 'Using business and operational evidence for strategic choices' },
  { id: 'operations_excellence', label: 'Operations Excellence', description: 'Designing resilient and efficient operating models' },
  { id: 'supply_chain_resilience', label: 'Supply Chain Resilience', description: 'Building adaptive, reliable, and cost-effective supply networks' },
  { id: 'information_strategy', label: 'Information Systems Strategy', description: 'Aligning information systems with organizational goals' },
];

const skillDevelopment = [
  { id: 'business_analysis', label: 'Business Analysis', description: 'Requirement analysis, stakeholder mapping, and process diagnostics' },
  { id: 'analytics_reporting', label: 'Analytics and Reporting', description: 'Dashboards, KPI analysis, and managerial reporting' },
  { id: 'project_program_management', label: 'Project and Program Management', description: 'Planning, risk management, and delivery governance' },
  { id: 'quality_improvement', label: 'Quality and Continuous Improvement', description: 'Lean thinking, quality controls, and performance improvement' },
  { id: 'enterprise_tools', label: 'Enterprise Platform Literacy', description: 'ERP and enterprise information platform fluency' },
  { id: 'leadership_communication', label: 'Leadership and Communication', description: 'Cross-functional coordination, influence, and communication' },
];

export default function SpecializationPreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preferences, setPreferences] = useState<Partial<SpecializationPreference>>({
    academicInterests: [],
    careerAspirations: [],
    preferredSpecialization: undefined,
    alternativeSpecialization: undefined,
    reasoning: '',
    technicalInterests: [],
    careerFocus: undefined,
    projectTypes: [],
    learningGoals: [],
    skillDevelopment: [],
    workEnvironment: undefined,
    additionalNotes: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  const totalSteps = 4;
  const returnToRaw = searchParams.get('next');
  const returnTo = returnToRaw && returnToRaw.startsWith('/')
    ? returnToRaw
    : '/dashboard/student/specialization?autorun=1';

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const existing = await getSpecializationPreferences();
        if (canceled || !existing.success || !existing.data) return;
        setPreferences((prev) => ({
          ...prev,
          ...existing.data,
          preferredSpecialization: existing.data.preferredSpecialization ?? undefined,
          alternativeSpecialization: existing.data.alternativeSpecialization ?? undefined,
          workEnvironment: existing.data.workEnvironment || undefined,
          additionalNotes: existing.data.additionalNotes || '',
        }));
      } finally {
        if (!canceled) setIsLoadingExisting(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const handleArrayChange = (field: keyof SpecializationPreference, value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: checked 
        ? [...((prev[field] as string[]) || []), value]
        : ((prev[field] as string[]) || []).filter(item => item !== value)
    }));
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);
    try {
      await submitSpecializationPreferences({
        academicInterests: preferences.academicInterests || [],
        careerAspirations: preferences.careerAspirations || [],
        preferredSpecialization: null,
        alternativeSpecialization: null,
        reasoning: preferences.reasoning || '',
        technicalInterests: preferences.technicalInterests || [],
        careerFocus: Array.isArray(preferences.careerFocus) ? preferences.careerFocus : [],
        projectTypes: preferences.projectTypes || [],
        learningGoals: preferences.learningGoals || [],
        skillDevelopment: preferences.skillDevelopment || [],
        workEnvironment: preferences.workEnvironment || '',
        additionalNotes: preferences.additionalNotes || '',
      });
      // Immediately return and auto-run specialization analysis.
      router.push(returnTo);
    } catch (error) {
      console.error('Error submitting preferences:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit specialization preferences';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return (preferences.academicInterests?.length || 0) >= 2;
      case 2: return (preferences.careerAspirations?.length || 0) >= 2;
      case 3: return (preferences.careerFocus?.length || 0) >= 1;
      case 4: return preferences.reasoning && preferences.reasoning.length >= 50;
      default: return false;
    }
  };

  if (isLoadingExisting) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading your previously submitted details...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Specialization Preference Collection</h1>
        <p className="text-gray-600">
          Share your MIT management and information systems interests so we can recommend the best-fit specialization stream for you.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step 1: Academic Interests */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Step 1: Academic Interests
            </CardTitle>
            <CardDescription>
              Select at least 2 areas that interest you most academically. This helps us understand your learning preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technicalInterests.map((interest) => (
                <div key={interest.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={interest.id}
                    checked={preferences.academicInterests?.includes(interest.id) || false}
                    onCheckedChange={(checked) => handleArrayChange('academicInterests', interest.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={interest.id} className="font-medium cursor-pointer">
                      {interest.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{interest.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {preferences.academicInterests && preferences.academicInterests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected interests:</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.academicInterests.map(interestId => {
                    const interest = technicalInterests.find(i => i.id === interestId);
                    return (
                      <Badge key={interestId} variant="secondary">
                        {interest?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Career Aspirations */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Step 2: Career Aspirations
            </CardTitle>
            <CardDescription>
              Select at least 2 career paths that interest you. This helps us align your specialization with your goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerFocus.map((focus) => (
                <div key={focus.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={focus.id}
                    checked={preferences.careerAspirations?.includes(focus.id) || false}
                    onCheckedChange={(checked) => handleArrayChange('careerAspirations', focus.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={focus.id} className="font-medium cursor-pointer">
                      {focus.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{focus.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {preferences.careerAspirations && preferences.careerAspirations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected career aspirations:</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.careerAspirations.map(aspirationId => {
                    const aspiration = careerFocus.find(a => a.id === aspirationId);
                    return (
                      <Badge key={aspirationId} variant="secondary">
                        {aspiration?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Specialization Exploration Areas */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Step 3: Areas You Want to Explore
            </CardTitle>
            <CardDescription>
              Select the management and information capability areas you want to develop most. The system will infer the best specialization from these signals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerFocus.map((focus) => (
                <div key={focus.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={focus.id}
                    checked={preferences.careerFocus?.includes(focus.id) || false}
                    onCheckedChange={(checked) => handleArrayChange('careerFocus', focus.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={focus.id} className="font-medium cursor-pointer">
                      {focus.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{focus.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Select at least one exploration area.</p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Detailed Preferences */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Step 4: Detailed Preferences
            </CardTitle>
            <CardDescription>
              Provide additional details about your learning goals and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="reasoning">Why did you choose this specialization? (Minimum 50 characters)</Label>
              <Textarea
                id="reasoning"
                placeholder="Explain your strengths, preferred module themes, and the type of management/IS work you want to do..."
                value={preferences.reasoning}
                onChange={(e) => setPreferences(prev => ({ ...prev, reasoning: e.target.value }))}
                className="mt-2"
                rows={4}
              />
              <p className="text-xs text-gray-600 mt-1">
                {preferences.reasoning?.length || 0}/50 characters minimum
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Project Types You're Interested In</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectTypes.map((project) => (
                  <div key={project.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={project.id}
                      checked={preferences.projectTypes?.includes(project.id) || false}
                      onCheckedChange={(checked) => handleArrayChange('projectTypes', project.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={project.id} className="font-medium cursor-pointer text-sm">
                        {project.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Learning Goals</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {learningGoals.map((goal) => (
                  <div key={goal.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={goal.id}
                      checked={preferences.learningGoals?.includes(goal.id) || false}
                      onCheckedChange={(checked) => handleArrayChange('learningGoals', goal.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={goal.id} className="font-medium cursor-pointer text-sm">
                        {goal.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Skills You Want to Develop</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skillDevelopment.map((skill) => (
                  <div key={skill.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={skill.id}
                      checked={preferences.skillDevelopment?.includes(skill.id) || false}
                      onCheckedChange={(checked) => handleArrayChange('skillDevelopment', skill.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={skill.id} className="font-medium cursor-pointer text-sm">
                        {skill.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">{skill.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional information about your specialization preferences..."
                value={preferences.additionalNotes}
                onChange={(e) => setPreferences(prev => ({ ...prev, additionalNotes: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Review Snapshot</CardTitle>
            <CardDescription>
              This profile will be used with your academic record to suggest the best specialization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Academic Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.academicInterests?.map(interestId => {
                    const interest = technicalInterests.find(i => i.id === interestId);
                    return (
                      <Badge key={interestId} variant="secondary">
                        {interest?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Career Aspirations</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.careerAspirations?.map(aspirationId => {
                    const aspiration = careerFocus.find(a => a.id === aspirationId);
                    return (
                      <Badge key={aspirationId} variant="secondary">
                        {aspiration?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Exploration Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.careerFocus?.map(focusId => {
                    const focus = careerFocus.find(c => c.id === focusId);
                    return (
                      <Badge key={focusId} variant="outline">
                        {focus?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Reasoning</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {preferences.reasoning}
                </p>
              </div>

              {preferences.projectTypes && preferences.projectTypes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Project Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.projectTypes.map(projectId => {
                      const project = projectTypes.find(p => p.id === projectId);
                      return (
                        <Badge key={projectId} variant="outline">
                          {project?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {preferences.learningGoals && preferences.learningGoals.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Learning Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.learningGoals.map(goalId => {
                      const goal = learningGoals.find(g => g.id === goalId);
                      return (
                        <Badge key={goalId} variant="outline">
                          {goal?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {preferences.additionalNotes && (
                <div>
                  <h3 className="font-medium mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {preferences.additionalNotes}
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        {currentStep < totalSteps ? (
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Preferences'}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <Alert className="mt-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Need Help?</AlertTitle>
        <AlertDescription>
          You are not selecting your final specialization here. This profile is used together with your transcript and GPA to generate a recommendation.
        </AlertDescription>
      </Alert>
    </div>
  );
}
