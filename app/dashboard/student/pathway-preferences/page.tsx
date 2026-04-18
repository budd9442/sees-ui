export const dynamic = "force-dynamic";
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Target,
  Lightbulb,
  Users,
  TrendingUp,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { PathwayPreference } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPathwayGuidancePreferences, submitPathwayGuidancePreferences } from '@/lib/actions/pathway-actions';

const interestAreas = [
  { id: 'programming', label: 'Programming & Software Development', description: 'Building applications, coding, software architecture' },
  { id: 'data', label: 'Data Analysis & Analytics', description: 'Working with data, statistics, business intelligence' },
  { id: 'systems', label: 'Systems Analysis & Design', description: 'Understanding business processes, system design' },
  { id: 'networking', label: 'Networking & Infrastructure', description: 'Network administration, server management' },
  { id: 'security', label: 'Cybersecurity', description: 'Information security, risk management' },
  { id: 'project', label: 'Project Management', description: 'Leading teams, managing projects, coordination' },
  { id: 'research', label: 'Research & Innovation', description: 'Academic research, new technology exploration' },
  { id: 'consulting', label: 'Consulting & Advisory', description: 'Providing expert advice, client consulting' },
];

const strengthAreas = [
  { id: 'analytical', label: 'Analytical Thinking', description: 'Problem-solving, logical reasoning' },
  { id: 'creative', label: 'Creative Problem Solving', description: 'Innovation, design thinking' },
  { id: 'technical', label: 'Technical Skills', description: 'Programming, technical implementation' },
  { id: 'communication', label: 'Communication', description: 'Presentation, writing, interpersonal' },
  { id: 'leadership', label: 'Leadership', description: 'Team management, decision making' },
  { id: 'detail', label: 'Attention to Detail', description: 'Precision, quality focus' },
];

const careerGoals = [
  { id: 'software_engineer', label: 'Software Engineer', description: 'Develop software applications and systems' },
  { id: 'data_scientist', label: 'Data Scientist', description: 'Analyze data to drive business decisions' },
  { id: 'systems_analyst', label: 'Systems Analyst', description: 'Design and improve business systems' },
  { id: 'project_manager', label: 'Project Manager', description: 'Lead IT projects and teams' },
  { id: 'consultant', label: 'IT Consultant', description: 'Advise organizations on technology solutions' },
  { id: 'researcher', label: 'Research Scientist', description: 'Conduct academic or industry research' },
  { id: 'entrepreneur', label: 'Tech Entrepreneur', description: 'Start and run technology companies' },
  { id: 'academic', label: 'Academic Career', description: 'Teaching and research in academia' },
];

const workStyles = [
  { id: 'collaborative', label: 'Collaborative Team Work', description: 'Working closely with others' },
  { id: 'independent', label: 'Independent Work', description: 'Working autonomously' },
  { id: 'structured', label: 'Structured Environment', description: 'Clear processes and procedures' },
  { id: 'flexible', label: 'Flexible Environment', description: 'Adaptable and dynamic' },
];

const learningStyles = [
  { id: 'hands_on', label: 'Hands-on Learning', description: 'Learning by doing and experimenting' },
  { id: 'theoretical', label: 'Theoretical Learning', description: 'Understanding concepts and principles' },
  { id: 'visual', label: 'Visual Learning', description: 'Diagrams, charts, and visual aids' },
  { id: 'practical', label: 'Practical Application', description: 'Real-world problem solving' },
];

export default function PathwayPreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [preferences, setPreferences] = useState<Partial<PathwayPreference>>({
    interests: [],
    strengths: [],
    careerGoals: [],
    reasoning: '',
    workStyle: undefined,
    learningStyle: undefined,
    industryInterest: [],
    additionalNotes: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  const totalSteps = 5;
  const returnToRaw = searchParams.get('next');
  const returnTo = returnToRaw && returnToRaw.startsWith('/')
    ? returnToRaw
    : '/dashboard/student/pathway?autorun=1';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = await getPathwayGuidancePreferences();
        if (cancelled || !existing.success || !existing.data) return;
        setPreferences(prev => ({
          ...prev,
          ...existing.data,
          additionalNotes: existing.data.additionalNotes || '',
        }));
      } finally {
        if (!cancelled) setIsLoadingExisting(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      interests: checked 
        ? [...(prev.interests || []), interestId]
        : (prev.interests || []).filter(id => id !== interestId)
    }));
  };

  const handleStrengthChange = (strengthId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      strengths: checked 
        ? [...(prev.strengths || []), strengthId]
        : (prev.strengths || []).filter(id => id !== strengthId)
    }));
  };

  const handleCareerGoalChange = (goalId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      careerGoals: checked 
        ? [...(prev.careerGoals || []), goalId]
        : (prev.careerGoals || []).filter(id => id !== goalId)
    }));
  };

  const handleIndustryInterestChange = (industryId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      industryInterest: checked 
        ? [...(prev.industryInterest || []), industryId]
        : (prev.industryInterest || []).filter(id => id !== industryId)
    }));
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);
    try {
      await submitPathwayGuidancePreferences({
        interests: preferences.interests || [],
        strengths: preferences.strengths || [],
        careerGoals: preferences.careerGoals || [],
        reasoning: preferences.reasoning || '',
        workStyle: preferences.workStyle || '',
        learningStyle: preferences.learningStyle || '',
        industryInterest: preferences.industryInterest || [],
        additionalNotes: preferences.additionalNotes || '',
      });
      router.push(returnTo);
    } catch (error) {
      console.error('Error submitting preferences:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit pathway preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return (preferences.interests?.length || 0) >= 3;
      case 2: return (preferences.strengths?.length || 0) >= 2;
      case 3: return (preferences.careerGoals?.length || 0) >= 2;
      case 4: return preferences.reasoning && preferences.reasoning.length >= 50;
      case 5: return true;
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
        <h1 className="text-3xl font-bold mb-2">Pathway Preference Collection</h1>
        <p className="text-gray-600">
          Help us understand your interests, strengths, and career goals to provide personalized pathway recommendations.
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

      {/* Step 1: Interests */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Step 1: Academic Interests
            </CardTitle>
            <CardDescription>
              Select at least 3 areas that interest you most. This helps us understand your academic preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interestAreas.map((interest) => (
                <div key={interest.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={interest.id}
                    checked={preferences.interests?.includes(interest.id) || false}
                    onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
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
            {preferences.interests && preferences.interests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected interests:</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map(interestId => {
                    const interest = interestAreas.find(i => i.id === interestId);
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

      {/* Step 2: Strengths */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Step 2: Personal Strengths
            </CardTitle>
            <CardDescription>
              Select at least 2 areas where you excel. This helps the guidance engine infer your strongest pathway alignment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strengthAreas.map((strength) => (
                <div key={strength.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={strength.id}
                    checked={preferences.strengths?.includes(strength.id) || false}
                    onCheckedChange={(checked) => handleStrengthChange(strength.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={strength.id} className="font-medium cursor-pointer">
                      {strength.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{strength.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {preferences.strengths && preferences.strengths.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected strengths:</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.strengths.map(strengthId => {
                    const strength = strengthAreas.find(s => s.id === strengthId);
                    return (
                      <Badge key={strengthId} variant="secondary">
                        {strength?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Career Goals */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Step 3: Career Aspirations
            </CardTitle>
            <CardDescription>
              Select at least 2 career paths that interest you. This helps us align your education with your goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerGoals.map((goal) => (
                <div key={goal.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={goal.id}
                    checked={preferences.careerGoals?.includes(goal.id) || false}
                    onCheckedChange={(checked) => handleCareerGoalChange(goal.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={goal.id} className="font-medium cursor-pointer">
                      {goal.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {preferences.careerGoals && preferences.careerGoals.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected career goals:</p>
                <div className="flex flex-wrap gap-2">
                  {preferences.careerGoals.map(goalId => {
                    const goal = careerGoals.find(g => g.id === goalId);
                    return (
                      <Badge key={goalId} variant="secondary">
                        {goal?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      

      {/* Step 4: Reasoning */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Step 4: Reasoning & Additional Information
            </CardTitle>
            <CardDescription>
              Share your motivation and context so we can improve recommendation quality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="reasoning">Describe your goals and why this direction fits you (Minimum 50 characters)</Label>
              <Textarea
                id="reasoning"
                placeholder="Explain your reasoning for choosing this pathway..."
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
              <Label htmlFor="workStyle">Preferred Work Style</Label>
              <Select
                value={preferences.workStyle}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, workStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred work style" />
                </SelectTrigger>
                <SelectContent>
                  {workStyles.map(style => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-600">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="learningStyle">Preferred Learning Style</Label>
              <Select
                value={preferences.learningStyle}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, learningStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred learning style" />
                </SelectTrigger>
                <SelectContent>
                  {learningStyles.map(style => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-600">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional information you'd like to share..."
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
              Review your preferences before submitting. You can go back to make changes if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Selected Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests?.map(interestId => {
                    const interest = interestAreas.find(i => i.id === interestId);
                    return (
                      <Badge key={interestId} variant="secondary">
                        {interest?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Personal Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.strengths?.map(strengthId => {
                    const strength = strengthAreas.find(s => s.id === strengthId);
                    return (
                      <Badge key={strengthId} variant="secondary">
                        {strength?.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Career Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.careerGoals?.map(goalId => {
                    const goal = careerGoals.find(g => g.id === goalId);
                    return (
                      <Badge key={goalId} variant="secondary">
                        {goal?.label}
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

              {preferences.workStyle && (
                <div>
                  <h3 className="font-medium mb-2">Work Style</h3>
                  <p className="text-sm text-gray-700">
                    {workStyles.find(s => s.id === preferences.workStyle)?.label}
                  </p>
                </div>
              )}

              {preferences.learningStyle && (
                <div>
                  <h3 className="font-medium mb-2">Learning Style</h3>
                  <p className="text-sm text-gray-700">
                    {learningStyles.find(s => s.id === preferences.learningStyle)?.label}
                  </p>
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
          If you're unsure about any of your choices, you can always update your preferences later. 
          This information helps us provide better guidance and recommendations throughout your academic journey.
        </AlertDescription>
      </Alert>
    </div>
  );
}
