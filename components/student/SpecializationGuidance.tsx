'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Target,
  TrendingUp,
  Users,
  Briefcase,
  Lightbulb,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  Zap,
  Heart,
  Brain,
  Code,
  Database,
  Network,
  Smartphone,
  Globe,
  Shield,
  BarChart3,
  GraduationCap,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SpecializationPreference } from '@/types';

interface SpecializationGuidanceProps {
  currentGPA?: number;
  academicYear?: string;
  selectedPathway?: string;
  onSpecializationSelect?: (specialization: string) => void;
}

export default function SpecializationGuidance({ 
  currentGPA = 3.2, 
  academicYear = 'L2',
  selectedPathway = 'software-engineering',
  onSpecializationSelect 
}: SpecializationGuidanceProps) {
  const [preferences, setPreferences] = useState<Partial<SpecializationPreference>>({
    technicalInterests: [],
    careerFocus: [],
    projectTypes: [],
    workEnvironment: 'startup',
    learningGoals: [],
    skillDevelopment: [],
    additionalNotes: '',
  });

  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');

  const specializations = [
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      description: 'Focus on user interface design and client-side development',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50',
      pathway: 'software-engineering',
      modules: ['UI/UX Design', 'React Development', 'Web Performance', 'Accessibility'],
      careerPaths: ['Frontend Developer', 'UI/UX Designer', 'Web Developer', 'Frontend Architect'],
      avgSalary: '$65,000 - $100,000',
      demand: 'High',
      gpaRequirement: 2.8,
      skills: ['HTML/CSS', 'JavaScript', 'React', 'Design Principles'],
      projectTypes: ['Web Applications', 'Mobile Apps', 'E-commerce Sites', 'Dashboards'],
    },
    {
      id: 'backend-development',
      name: 'Backend Development',
      description: 'Focus on server-side development and system architecture',
      icon: Database,
      color: 'text-green-600 bg-green-50',
      pathway: 'software-engineering',
      modules: ['Server Architecture', 'API Development', 'Database Design', 'Cloud Computing'],
      careerPaths: ['Backend Developer', 'API Developer', 'System Architect', 'DevOps Engineer'],
      avgSalary: '$70,000 - $110,000',
      demand: 'High',
      gpaRequirement: 3.0,
      skills: ['Server Programming', 'Database Management', 'API Design', 'System Design'],
      projectTypes: ['APIs', 'Microservices', 'Data Processing', 'Cloud Systems'],
    },
    {
      id: 'fullstack-development',
      name: 'Full-Stack Development',
      description: 'Comprehensive development covering both frontend and backend',
      icon: Code,
      color: 'text-purple-600 bg-purple-50',
      pathway: 'software-engineering',
      modules: ['Full-Stack Architecture', 'Modern Frameworks', 'DevOps', 'Project Management'],
      careerPaths: ['Full-Stack Developer', 'Technical Lead', 'Solution Architect', 'CTO'],
      avgSalary: '$75,000 - $120,000',
      demand: 'Very High',
      gpaRequirement: 3.2,
      skills: ['Full-Stack Technologies', 'System Design', 'Project Management', 'Leadership'],
      projectTypes: ['Complete Applications', 'SaaS Platforms', 'Enterprise Systems', 'Startup Products'],
    },
    {
      id: 'mobile-development',
      name: 'Mobile Development',
      description: 'Specialized in mobile app development for iOS and Android',
      icon: Smartphone,
      color: 'text-orange-600 bg-orange-50',
      pathway: 'software-engineering',
      modules: ['Mobile UI/UX', 'iOS Development', 'Android Development', 'Cross-Platform'],
      careerPaths: ['Mobile Developer', 'iOS Developer', 'Android Developer', 'Mobile Architect'],
      avgSalary: '$70,000 - $105,000',
      demand: 'Moderate',
      gpaRequirement: 2.9,
      skills: ['Mobile Development', 'Platform APIs', 'Performance Optimization', 'User Experience'],
      projectTypes: ['Mobile Apps', 'Progressive Web Apps', 'Mobile Games', 'IoT Applications'],
    },
    {
      id: 'data-engineering',
      name: 'Data Engineering',
      description: 'Focus on data infrastructure and pipeline development',
      icon: BarChart3,
      color: 'text-indigo-600 bg-indigo-50',
      pathway: 'data-science',
      modules: ['Data Pipelines', 'Big Data Technologies', 'Data Warehousing', 'ETL Processes'],
      careerPaths: ['Data Engineer', 'Big Data Developer', 'Data Architect', 'ML Engineer'],
      avgSalary: '$80,000 - $125,000',
      demand: 'High',
      gpaRequirement: 3.1,
      skills: ['Data Processing', 'Big Data Tools', 'Pipeline Design', 'Data Modeling'],
      projectTypes: ['Data Pipelines', 'Analytics Platforms', 'ML Infrastructure', 'Data Warehouses'],
    },
    {
      id: 'machine-learning',
      name: 'Machine Learning',
      description: 'Focus on AI and machine learning model development',
      icon: Brain,
      color: 'text-red-600 bg-red-50',
      pathway: 'data-science',
      modules: ['ML Algorithms', 'Deep Learning', 'Model Deployment', 'AI Ethics'],
      careerPaths: ['ML Engineer', 'Data Scientist', 'AI Researcher', 'ML Architect'],
      avgSalary: '$85,000 - $130,000',
      demand: 'Very High',
      gpaRequirement: 3.3,
      skills: ['ML Algorithms', 'Python/R', 'Statistics', 'Model Deployment'],
      projectTypes: ['ML Models', 'AI Applications', 'Predictive Analytics', 'Computer Vision'],
    },
    {
      id: 'cybersecurity-analysis',
      name: 'Cybersecurity Analysis',
      description: 'Focus on security analysis and threat detection',
      icon: Shield,
      color: 'text-red-600 bg-red-50',
      pathway: 'cybersecurity',
      modules: ['Security Analysis', 'Threat Detection', 'Risk Assessment', 'Incident Response'],
      careerPaths: ['Security Analyst', 'SOC Analyst', 'Threat Hunter', 'Security Consultant'],
      avgSalary: '$75,000 - $115,000',
      demand: 'High',
      gpaRequirement: 3.0,
      skills: ['Security Analysis', 'Threat Detection', 'Risk Assessment', 'Incident Response'],
      projectTypes: ['Security Monitoring', 'Threat Analysis', 'Risk Assessments', 'Security Tools'],
    },
    {
      id: 'penetration-testing',
      name: 'Penetration Testing',
      description: 'Focus on ethical hacking and vulnerability assessment',
      icon: Target,
      color: 'text-orange-600 bg-orange-50',
      pathway: 'cybersecurity',
      modules: ['Ethical Hacking', 'Vulnerability Assessment', 'Network Security', 'Web Security'],
      careerPaths: ['Penetration Tester', 'Ethical Hacker', 'Security Consultant', 'Red Team Lead'],
      avgSalary: '$80,000 - $120,000',
      demand: 'Moderate',
      gpaRequirement: 3.1,
      skills: ['Ethical Hacking', 'Vulnerability Assessment', 'Network Security', 'Web Security'],
      projectTypes: ['Security Audits', 'Penetration Tests', 'Vulnerability Scans', 'Security Training'],
    },
  ];

  const technicalInterestOptions = [
    { id: 'web-technologies', label: 'Web Technologies', icon: Globe },
    { id: 'mobile-development', label: 'Mobile Development', icon: Smartphone },
    { id: 'data-science', label: 'Data Science', icon: BarChart3 },
    { id: 'machine-learning', label: 'Machine Learning', icon: Brain },
    { id: 'cybersecurity', label: 'Cybersecurity', icon: Shield },
    { id: 'cloud-computing', label: 'Cloud Computing', icon: Network },
    { id: 'database-design', label: 'Database Design', icon: Database },
    { id: 'ai-development', label: 'AI Development', icon: Zap },
  ];

  const careerFocusOptions = [
    { id: 'technical-leadership', label: 'Technical Leadership', icon: Award },
    { id: 'product-development', label: 'Product Development', icon: Briefcase },
    { id: 'research-development', label: 'Research & Development', icon: BookOpen },
    { id: 'consulting', label: 'Consulting', icon: Users },
    { id: 'entrepreneurship', label: 'Entrepreneurship', icon: Lightbulb },
    { id: 'freelancing', label: 'Freelancing', icon: Heart },
    { id: 'academia', label: 'Academic Career', icon: GraduationCap },
    { id: 'corporate', label: 'Corporate Career', icon: Building },
  ];

  const projectTypeOptions = [
    { id: 'web-applications', label: 'Web Applications' },
    { id: 'mobile-apps', label: 'Mobile Applications' },
    { id: 'data-analysis', label: 'Data Analysis Projects' },
    { id: 'machine-learning', label: 'Machine Learning Models' },
    { id: 'security-tools', label: 'Security Tools' },
    { id: 'enterprise-systems', label: 'Enterprise Systems' },
    { id: 'startup-products', label: 'Startup Products' },
    { id: 'research-projects', label: 'Research Projects' },
  ];

  const learningGoalOptions = [
    { id: 'master-technologies', label: 'Master Core Technologies' },
    { id: 'learn-new-skills', label: 'Learn New Skills' },
    { id: 'build-portfolio', label: 'Build Strong Portfolio' },
    { id: 'gain-experience', label: 'Gain Industry Experience' },
    { id: 'network-professionals', label: 'Network with Professionals' },
    { id: 'prepare-career', label: 'Prepare for Career' },
    { id: 'contribute-open-source', label: 'Contribute to Open Source' },
    { id: 'start-business', label: 'Start Own Business' },
  ];

  const skillDevelopmentOptions = [
    { id: 'programming', label: 'Programming Skills' },
    { id: 'problem-solving', label: 'Problem Solving' },
    { id: 'system-design', label: 'System Design' },
    { id: 'communication', label: 'Communication' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'project-management', label: 'Project Management' },
    { id: 'creativity', label: 'Creativity' },
    { id: 'analytical-thinking', label: 'Analytical Thinking' },
  ];

  const calculateSpecializationScore = (specialization: any) => {
    let score = 0;
    
    // GPA compatibility
    if (currentGPA >= specialization.gpaRequirement) {
      score += 25;
    } else {
      score += Math.max(0, 25 - (specialization.gpaRequirement - currentGPA) * 8);
    }
    
    // Pathway alignment
    if (specialization.pathway === selectedPathway) {
      score += 30;
    }
    
    // Technical interest matching
    const matchingInterests = specialization.skills.filter((skill: string) => 
      preferences.technicalInterests.some(interest => 
        interest.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(interest.toLowerCase())
      )
    ).length;
    score += matchingInterests * 10;
    
    // Career focus alignment
    if (preferences.careerFocus.length > 0) {
      score += 15;
    }
    
    // Project type alignment
    const matchingProjects = specialization.projectTypes.filter((project: string) => 
      preferences.projectTypes.some(type => 
        type.toLowerCase().includes(project.toLowerCase()) || 
        project.toLowerCase().includes(type.toLowerCase())
      )
    ).length;
    score += matchingProjects * 8;
    
    // Learning goals alignment
    if (preferences.learningGoals.length > 0) {
      score += 12;
    }
    
    return Math.min(100, score);
  };

  const getRecommendations = () => {
    return specializations
      .filter(spec => spec.pathway === selectedPathway)
      .map(specialization => ({
        ...specialization,
        score: calculateSpecializationScore(specialization),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleTechnicalInterestChange = (interestId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      technicalInterests: checked 
        ? [...(prev.technicalInterests || []), interestId]
        : (prev.technicalInterests || []).filter(id => id !== interestId)
    }));
  };

  const handleCareerFocusChange = (focusId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      careerFocus: checked 
        ? [...(prev.careerFocus || []), focusId]
        : (prev.careerFocus || []).filter(id => id !== focusId)
    }));
  };

  const handleProjectTypeChange = (typeId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      projectTypes: checked 
        ? [...(prev.projectTypes || []), typeId]
        : (prev.projectTypes || []).filter(id => id !== typeId)
    }));
  };

  const handleLearningGoalChange = (goalId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      learningGoals: checked 
        ? [...(prev.learningGoals || []), goalId]
        : (prev.learningGoals || []).filter(id => id !== goalId)
    }));
  };

  const handleSkillDevelopmentChange = (skillId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      skillDevelopment: checked 
        ? [...(prev.skillDevelopment || []), skillId]
        : (prev.skillDevelopment || []).filter(id => id !== skillId)
    }));
  };

  const handleSpecializationSelect = (specializationId: string) => {
    setSelectedSpecialization(specializationId);
    onSpecializationSelect?.(specializationId);
    toast.success(`Selected ${specializations.find(s => s.id === specializationId)?.name} specialization!`);
  };

  const recommendations = getRecommendations();
  const pathwaySpecializations = specializations.filter(spec => spec.pathway === selectedPathway);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Specialization Selection Guidance</h2>
        <p className="text-muted-foreground mt-1">
          Choose your specialization within the {selectedPathway.replace('-', ' ')} pathway
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Current GPA</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{academicYear}</div>
              <p className="text-sm text-muted-foreground">Academic Year</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{selectedPathway.replace('-', ' ')}</div>
              <p className="text-sm text-muted-foreground">Selected Pathway</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {recommendations.length > 0 ? recommendations[0].score : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Best Match Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="all-specializations">All Specializations</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Interests</CardTitle>
              <CardDescription>
                Select areas that interest you most (choose 3-5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {technicalInterestOptions.map((interest) => {
                  const Icon = interest.icon;
                  return (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={(preferences.technicalInterests || []).includes(interest.id)}
                        onCheckedChange={(checked) => handleTechnicalInterestChange(interest.id, checked as boolean)}
                      />
                      <Label htmlFor={interest.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {interest.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Career Focus</CardTitle>
              <CardDescription>
                What are your career aspirations? (choose 2-3)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {careerFocusOptions.map((focus) => {
                  const Icon = focus.icon;
                  return (
                    <div key={focus.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={focus.id}
                        checked={(preferences.careerFocus || []).includes(focus.id)}
                        onCheckedChange={(checked) => handleCareerFocusChange(focus.id, checked as boolean)}
                      />
                      <Label htmlFor={focus.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {focus.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Types</CardTitle>
              <CardDescription>
                What types of projects interest you most? (choose 3-4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {projectTypeOptions.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.id}
                      checked={(preferences.projectTypes || []).includes(type.id)}
                      onCheckedChange={(checked) => handleProjectTypeChange(type.id, checked as boolean)}
                    />
                    <Label htmlFor={type.id} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
              <CardDescription>
                What do you want to achieve? (choose 3-4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {learningGoalOptions.map((goal) => (
                  <div key={goal.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal.id}
                      checked={(preferences.learningGoals || []).includes(goal.id)}
                      onCheckedChange={(checked) => handleLearningGoalChange(goal.id, checked as boolean)}
                    />
                    <Label htmlFor={goal.id} className="cursor-pointer">
                      {goal.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Development</CardTitle>
              <CardDescription>
                Which skills do you want to develop? (choose 3-4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {skillDevelopmentOptions.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill.id}
                      checked={(preferences.skillDevelopment || []).includes(skill.id)}
                      onCheckedChange={(checked) => handleSkillDevelopmentChange(skill.id, checked as boolean)}
                    />
                    <Label htmlFor={skill.id} className="cursor-pointer">
                      {skill.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Preferred Work Environment</Label>
                <Select
                  value={preferences.workEnvironment}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, workEnvironment: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="academia">Academia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Any other preferences or considerations?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={preferences.additionalNotes}
                onChange={(e) => setPreferences(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Share any additional thoughts about your specialization preferences..."
                rows={3}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Based on your preferences and current GPA for {selectedPathway.replace('-', ' ')} pathway
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((specialization, index) => {
                  const Icon = specialization.icon;
                  return (
                    <div key={specialization.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${specialization.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{specialization.name}</h4>
                              {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{specialization.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{specialization.score}%</div>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Match Score</span>
                          <span>{specialization.score}%</span>
                        </div>
                        <Progress value={specialization.score} className="h-2" />
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium">Career Paths:</p>
                            <p className="text-sm text-muted-foreground">{specialization.careerPaths.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Avg Salary:</p>
                            <p className="text-sm text-muted-foreground">{specialization.avgSalary}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={specialization.demand === 'Very High' ? 'destructive' : specialization.demand === 'High' ? 'default' : 'secondary'}>
                            {specialization.demand} Demand
                          </Badge>
                          <Badge variant={currentGPA >= specialization.gpaRequirement ? 'default' : 'secondary'}>
                            GPA: {specialization.gpaRequirement}+
                          </Badge>
                        </div>
                        
                        <Button 
                          onClick={() => handleSpecializationSelect(specialization.id)}
                          className="w-full"
                        >
                          Select This Specialization
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-specializations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Available Specializations</CardTitle>
              <CardDescription>
                Explore all specialization options in the {selectedPathway.replace('-', ' ')} pathway
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {pathwaySpecializations.map((specialization) => {
                  const Icon = specialization.icon;
                  const score = calculateSpecializationScore(specialization);
                  return (
                    <div key={specialization.id} className="p-4 rounded-lg border">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${specialization.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{specialization.name}</h4>
                          <p className="text-sm text-muted-foreground">{specialization.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{score}%</div>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Match Score</span>
                          <span>{score}%</span>
                        </div>
                        <Progress value={score} className="h-1" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={specialization.demand === 'Very High' ? 'destructive' : specialization.demand === 'High' ? 'default' : 'secondary'}>
                            {specialization.demand} Demand
                          </Badge>
                          <Badge variant={currentGPA >= specialization.gpaRequirement ? 'default' : 'secondary'}>
                            GPA: {specialization.gpaRequirement}+
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Avg Salary: {specialization.avgSalary}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => handleSpecializationSelect(specialization.id)}
                        className="w-full mt-3"
                        variant="outline"
                      >
                        Learn More
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
