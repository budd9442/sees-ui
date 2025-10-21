'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  AlertCircle,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { SpecializationPreference, Specialization } from '@/types';

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
  { id: 'programming', label: 'Programming & Development', description: 'Software development, coding, application building' },
  { id: 'data', label: 'Data Management & Analytics', description: 'Database design, data analysis, business intelligence' },
  { id: 'systems', label: 'Systems Integration', description: 'Connecting different systems, enterprise architecture' },
  { id: 'security', label: 'Information Security', description: 'Cybersecurity, risk management, data protection' },
  { id: 'networking', label: 'Network Management', description: 'Network administration, infrastructure management' },
  { id: 'cloud', label: 'Cloud Computing', description: 'Cloud platforms, distributed systems, scalability' },
];

const careerFocus = [
  { id: 'technical', label: 'Technical Roles', description: 'Hands-on technical work, development, implementation' },
  { id: 'management', label: 'Management Roles', description: 'Leading teams, strategic planning, decision making' },
  { id: 'consulting', label: 'Consulting Roles', description: 'Advising clients, problem solving, strategic advice' },
  { id: 'research', label: 'Research & Development', description: 'Innovation, new technology exploration, academic research' },
];

const projectTypes = [
  { id: 'web_apps', label: 'Web Applications', description: 'Building web-based solutions and platforms' },
  { id: 'mobile_apps', label: 'Mobile Applications', description: 'Developing mobile apps and responsive solutions' },
  { id: 'enterprise', label: 'Enterprise Systems', description: 'Large-scale business systems and integrations' },
  { id: 'data_projects', label: 'Data Projects', description: 'Data analysis, visualization, and insights' },
  { id: 'automation', label: 'Process Automation', description: 'Automating business processes and workflows' },
  { id: 'infrastructure', label: 'Infrastructure Projects', description: 'System setup, maintenance, and optimization' },
];

const learningGoals = [
  { id: 'technical_skills', label: 'Technical Skills', description: 'Programming, system design, technical implementation' },
  { id: 'business_skills', label: 'Business Skills', description: 'Business analysis, project management, communication' },
  { id: 'leadership', label: 'Leadership Skills', description: 'Team management, strategic thinking, decision making' },
  { id: 'problem_solving', label: 'Problem Solving', description: 'Analytical thinking, creative solutions, troubleshooting' },
];

const skillDevelopment = [
  { id: 'programming', label: 'Programming Languages', description: 'Java, Python, JavaScript, SQL, etc.' },
  { id: 'tools', label: 'Development Tools', description: 'IDEs, version control, testing frameworks' },
  { id: 'frameworks', label: 'Frameworks & Libraries', description: 'React, Spring, Django, etc.' },
  { id: 'databases', label: 'Database Technologies', description: 'SQL, NoSQL, data modeling' },
  { id: 'cloud', label: 'Cloud Platforms', description: 'AWS, Azure, Google Cloud' },
  { id: 'methodologies', label: 'Development Methodologies', description: 'Agile, DevOps, CI/CD' },
];

export default function SpecializationPreferencesPage() {
  const { user } = useAuthStore();
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
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 5;

  const handleArrayChange = (field: keyof SpecializationPreference, value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: checked 
        ? [...((prev[field] as string[]) || []), value]
        : ((prev[field] as string[]) || []).filter(item => item !== value)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return (preferences.academicInterests?.length || 0) >= 2;
      case 2: return (preferences.careerAspirations?.length || 0) >= 2;
      case 3: return preferences.preferredSpecialization !== undefined;
      case 4: return preferences.reasoning && preferences.reasoning.length >= 50;
      case 5: return true;
      default: return false;
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Specialization Preferences Submitted!</CardTitle>
            <CardDescription className="text-green-700">
              Your specialization preferences have been recorded and will be used to provide personalized guidance for your academic journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-green-700">
                Based on your preferences, we recommend:
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-200 max-w-md mx-auto">
                <h3 className="font-medium text-green-800 mb-2">Recommended Specialization</h3>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {specializations.find(s => s.id === preferences.preferredSpecialization)?.name}
                </Badge>
                <p className="text-sm text-green-700 mt-2">
                  {specializations.find(s => s.id === preferences.preferredSpecialization)?.description}
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/dashboard/student/specialization-selection'}
                className="mt-6"
              >
                Continue to Specialization Selection
              </Button>
            </div>
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
          Help us understand your academic interests and career aspirations to recommend the best specialization for you.
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

      {/* Step 3: Specialization Selection */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Step 3: Preferred Specialization
            </CardTitle>
            <CardDescription>
              Based on your interests and career goals, select your preferred specialization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={preferences.preferredSpecialization}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, preferredSpecialization: value as Specialization }))}
              className="space-y-6"
            >
              {specializations.map((specialization) => {
                const IconComponent = specialization.icon;
                return (
                  <div key={specialization.id} className="flex items-start space-x-4 p-6 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={specialization.id} id={specialization.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                        <Label htmlFor={specialization.id} className="font-medium cursor-pointer text-lg">
                          {specialization.name}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{specialization.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Key Skills:</p>
                          <ul className="space-y-1">
                            {specialization.skills.map(skill => (
                              <li key={skill} className="text-gray-600">• {skill}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Career Paths:</p>
                          <ul className="space-y-1">
                            {specialization.careers.map(career => (
                              <li key={career} className="text-gray-600">• {career}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Key Modules:</p>
                          <ul className="space-y-1">
                            {specialization.modules.map(module => (
                              <li key={module} className="text-gray-600">• {module}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Alternative Specialization */}
            <div className="mt-6">
              <Label className="text-sm font-medium">Alternative Specialization (Optional)</Label>
              <p className="text-xs text-gray-600 mb-3">Select a backup option in case your preferred specialization is full</p>
              <Select
                value={preferences.alternativeSpecialization}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, alternativeSpecialization: value as Specialization }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alternative specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                placeholder="Explain your reasoning for choosing this specialization..."
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

      {/* Step 5: Review & Submit */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step 5: Review & Submit
            </CardTitle>
            <CardDescription>
              Review your specialization preferences before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                <h3 className="font-medium mb-2">Preferred Specialization</h3>
                <Badge variant="default" className="text-lg px-4 py-2">
                  {specializations.find(s => s.id === preferences.preferredSpecialization)?.name}
                </Badge>
                {preferences.alternativeSpecialization && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Alternative: {specializations.find(s => s.id === preferences.alternativeSpecialization)?.name}</p>
                  </div>
                )}
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
            </div>
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
          If you're unsure about your specialization choice, you can always update your preferences later. 
          This information helps us provide better guidance and recommend suitable modules for your specialization.
        </AlertDescription>
      </Alert>
    </div>
  );
}
