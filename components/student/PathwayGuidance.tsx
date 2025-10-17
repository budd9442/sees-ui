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
  Building,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PathwayPreference } from '@/types';

interface PathwayGuidanceProps {
  currentGPA?: number;
  academicYear?: string;
  onPathwaySelect?: (pathway: string) => void;
}

export default function PathwayGuidance({ 
  currentGPA = 3.2, 
  academicYear = 'L1',
  onPathwaySelect 
}: PathwayGuidanceProps) {
  const [preferences, setPreferences] = useState<Partial<PathwayPreference>>({
    interests: [],
    strengths: [],
    careerGoals: [],
    workStyle: 'collaborative',
    learningStyle: 'hands-on',
    timeCommitment: 'full-time',
    locationPreference: 'flexible',
    salaryExpectation: 'moderate',
    industryInterest: [],
    additionalNotes: '',
  });

  const [selectedPathway, setSelectedPathway] = useState<string>('');

  const pathways = [
    {
      id: 'software-engineering',
      name: 'Software Engineering',
      description: 'Focus on software development, system design, and programming',
      icon: Code,
      color: 'text-blue-600 bg-blue-50',
      modules: ['Programming Fundamentals', 'Data Structures', 'Software Design', 'Web Development'],
      careerPaths: ['Software Developer', 'Full-Stack Developer', 'DevOps Engineer', 'Tech Lead'],
      avgSalary: '$75,000 - $120,000',
      demand: 'High',
      gpaRequirement: 3.0,
      skills: ['Programming', 'Problem Solving', 'System Design', 'Collaboration'],
    },
    {
      id: 'data-science',
      name: 'Data Science & Analytics',
      description: 'Focus on data analysis, machine learning, and business intelligence',
      icon: BarChart3,
      color: 'text-green-600 bg-green-50',
      modules: ['Statistics', 'Machine Learning', 'Data Visualization', 'Big Data'],
      careerPaths: ['Data Scientist', 'Data Analyst', 'ML Engineer', 'Business Analyst'],
      avgSalary: '$70,000 - $110,000',
      demand: 'Very High',
      gpaRequirement: 3.2,
      skills: ['Statistics', 'Programming', 'Critical Thinking', 'Communication'],
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      description: 'Focus on information security, network protection, and ethical hacking',
      icon: Shield,
      color: 'text-red-600 bg-red-50',
      modules: ['Network Security', 'Ethical Hacking', 'Risk Management', 'Digital Forensics'],
      careerPaths: ['Security Analyst', 'Penetration Tester', 'Security Architect', 'CISO'],
      avgSalary: '$80,000 - $130,000',
      demand: 'High',
      gpaRequirement: 3.1,
      skills: ['Security Analysis', 'Risk Assessment', 'Problem Solving', 'Attention to Detail'],
    },
    {
      id: 'mobile-development',
      name: 'Mobile Development',
      description: 'Focus on mobile app development for iOS and Android platforms',
      icon: Smartphone,
      color: 'text-purple-600 bg-purple-50',
      modules: ['Mobile UI/UX', 'iOS Development', 'Android Development', 'Cross-Platform'],
      careerPaths: ['Mobile Developer', 'iOS Developer', 'Android Developer', 'App Architect'],
      avgSalary: '$65,000 - $100,000',
      demand: 'Moderate',
      gpaRequirement: 2.8,
      skills: ['Mobile Development', 'UI/UX Design', 'Problem Solving', 'Creativity'],
    },
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Focus on frontend and backend web development technologies',
      icon: Globe,
      color: 'text-orange-600 bg-orange-50',
      modules: ['Frontend Development', 'Backend Development', 'Database Design', 'Cloud Computing'],
      careerPaths: ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Web Architect'],
      avgSalary: '$60,000 - $95,000',
      demand: 'High',
      gpaRequirement: 2.9,
      skills: ['Web Technologies', 'Database Management', 'Problem Solving', 'Design Sense'],
    },
    {
      id: 'database-management',
      name: 'Database Management',
      description: 'Focus on database design, administration, and data management',
      icon: Database,
      color: 'text-indigo-600 bg-indigo-50',
      modules: ['Database Design', 'SQL Programming', 'Data Warehousing', 'Database Administration'],
      careerPaths: ['Database Administrator', 'Data Engineer', 'Database Developer', 'Data Architect'],
      avgSalary: '$70,000 - $105,000',
      demand: 'Moderate',
      gpaRequirement: 3.0,
      skills: ['Database Design', 'SQL', 'Data Modeling', 'System Administration'],
    },
  ];

  const interestOptions = [
    { id: 'programming', label: 'Programming & Coding', icon: Code },
    { id: 'data-analysis', label: 'Data Analysis & Statistics', icon: BarChart3 },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'mobile-apps', label: 'Mobile Applications', icon: Smartphone },
    { id: 'web-design', label: 'Web Design & Development', icon: Globe },
    { id: 'databases', label: 'Database Management', icon: Database },
    { id: 'networking', label: 'Computer Networks', icon: Network },
    { id: 'ai-ml', label: 'Artificial Intelligence', icon: Brain },
  ];

  const strengthOptions = [
    { id: 'problem-solving', label: 'Problem Solving', icon: Target },
    { id: 'mathematics', label: 'Mathematics', icon: BarChart3 },
    { id: 'creativity', label: 'Creativity', icon: Lightbulb },
    { id: 'analytical', label: 'Analytical Thinking', icon: Brain },
    { id: 'communication', label: 'Communication', icon: Users },
    { id: 'attention-detail', label: 'Attention to Detail', icon: CheckCircle2 },
    { id: 'leadership', label: 'Leadership', icon: Award },
    { id: 'technical', label: 'Technical Skills', icon: Zap },
  ];

  const careerGoalOptions = [
    { id: 'tech-lead', label: 'Technical Leadership', icon: Award },
    { id: 'entrepreneur', label: 'Entrepreneurship', icon: Briefcase },
    { id: 'consultant', label: 'Consulting', icon: Users },
    { id: 'researcher', label: 'Research & Development', icon: BookOpen },
    { id: 'freelancer', label: 'Freelancing', icon: Heart },
    { id: 'startup', label: 'Startup Environment', icon: Zap },
    { id: 'corporate', label: 'Corporate Career', icon: Building },
    { id: 'academia', label: 'Academic Career', icon: GraduationCap },
  ];

  const industryOptions = [
    { id: 'fintech', label: 'Financial Technology' },
    { id: 'healthcare', label: 'Healthcare Technology' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'gaming', label: 'Gaming Industry' },
    { id: 'education', label: 'Educational Technology' },
    { id: 'automotive', label: 'Automotive Technology' },
    { id: 'aerospace', label: 'Aerospace & Defense' },
    { id: 'retail', label: 'Retail Technology' },
  ];

  const calculatePathwayScore = (pathway: any) => {
    let score = 0;
    
    // GPA compatibility
    if (currentGPA >= pathway.gpaRequirement) {
      score += 30;
    } else {
      score += Math.max(0, 30 - (pathway.gpaRequirement - currentGPA) * 10);
    }
    
    // Interest matching
    const matchingInterests = pathway.skills.filter((skill: string) => 
      (preferences.interests || []).some(interest => 
        interest.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(interest.toLowerCase())
      )
    ).length;
    score += matchingInterests * 15;
    
    // Strength alignment
    const matchingStrengths = pathway.skills.filter((skill: string) => 
      (preferences.strengths || []).some(strength => 
        strength.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(strength.toLowerCase())
      )
    ).length;
    score += matchingStrengths * 10;
    
    // Career goal alignment
    if ((preferences.careerGoals || []).length > 0) {
      score += 20;
    }
    
    // Work style compatibility
    if (pathway.name.toLowerCase().includes('engineering') && preferences.workStyle === 'collaborative') {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  const getRecommendations = () => {
    return pathways
      .map(pathway => ({
        ...pathway,
        score: calculatePathwayScore(pathway),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interestId]
        : prev.interests.filter(id => id !== interestId)
    }));
  };

  const handleStrengthChange = (strengthId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      strengths: checked 
        ? [...prev.strengths, strengthId]
        : prev.strengths.filter(id => id !== strengthId)
    }));
  };

  const handleCareerGoalChange = (goalId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      careerGoals: checked 
        ? [...prev.careerGoals, goalId]
        : prev.careerGoals.filter(id => id !== goalId)
    }));
  };

  const handleIndustryChange = (industryId: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      industryInterest: checked 
        ? [...(prev.industryInterest || []), industryId]
        : (prev.industryInterest || []).filter(id => id !== industryId)
    }));
  };

  const handlePathwaySelect = (pathwayId: string) => {
    setSelectedPathway(pathwayId);
    onPathwaySelect?.(pathwayId);
    toast.success(`Selected ${pathways.find(p => p.id === pathwayId)?.name} pathway!`);
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Pathway Selection Guidance</h2>
        <p className="text-muted-foreground mt-1">
          Answer a few questions to get personalized pathway recommendations
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentGPA.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Current GPA</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{academicYear}</div>
              <p className="text-sm text-muted-foreground">Academic Year</p>
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
          <TabsTrigger value="all-pathways">All Pathways</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Interests</CardTitle>
              <CardDescription>
                Select areas that interest you most (choose 3-5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {interestOptions.map((interest) => {
                  const Icon = interest.icon;
                  return (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={preferences.interests.includes(interest.id)}
                        onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
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
              <CardTitle>Your Strengths</CardTitle>
              <CardDescription>
                Select your strongest skills and abilities (choose 3-4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {strengthOptions.map((strength) => {
                  const Icon = strength.icon;
                  return (
                    <div key={strength.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={strength.id}
                        checked={preferences.strengths.includes(strength.id)}
                        onCheckedChange={(checked) => handleStrengthChange(strength.id, checked as boolean)}
                      />
                      <Label htmlFor={strength.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {strength.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Career Goals</CardTitle>
              <CardDescription>
                What are your long-term career aspirations? (choose 2-3)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {careerGoalOptions.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <div key={goal.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal.id}
                        checked={preferences.careerGoals.includes(goal.id)}
                        onCheckedChange={(checked) => handleCareerGoalChange(goal.id, checked as boolean)}
                      />
                      <Label htmlFor={goal.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="h-4 w-4" />
                        {goal.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Style & Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Work Style</Label>
                    <Select
                      value={preferences.workStyle}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, workStyle: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collaborative">Collaborative</SelectItem>
                        <SelectItem value="independent">Independent</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Learning Style</Label>
                    <Select
                      value={preferences.learningStyle}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, learningStyle: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hands-on">Hands-on</SelectItem>
                        <SelectItem value="theoretical">Theoretical</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Industry Interest</Label>
                  <div className="grid gap-2 md:grid-cols-4">
                    {industryOptions.map((industry) => (
                      <div key={industry.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={industry.id}
                          checked={(preferences.industryInterest || []).includes(industry.id)}
                          onCheckedChange={(checked) => handleIndustryChange(industry.id, checked as boolean)}
                        />
                        <Label htmlFor={industry.id} className="text-sm cursor-pointer">
                          {industry.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
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
                placeholder="Share any additional thoughts about your pathway preferences..."
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
                Based on your preferences and current GPA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((pathway, index) => {
                  const Icon = pathway.icon;
                  return (
                    <div key={pathway.id} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${pathway.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{pathway.name}</h4>
                              {index === 0 && <Star className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{pathway.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{pathway.score}%</div>
                          <p className="text-xs text-muted-foreground">Match Score</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Match Score</span>
                          <span>{pathway.score}%</span>
                        </div>
                        <Progress value={pathway.score} className="h-2" />
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium">Career Paths:</p>
                            <p className="text-sm text-muted-foreground">{pathway.careerPaths.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Avg Salary:</p>
                            <p className="text-sm text-muted-foreground">{pathway.avgSalary}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={pathway.demand === 'Very High' ? 'destructive' : pathway.demand === 'High' ? 'default' : 'secondary'}>
                            {pathway.demand} Demand
                          </Badge>
                          <Badge variant={currentGPA >= pathway.gpaRequirement ? 'default' : 'secondary'}>
                            GPA: {pathway.gpaRequirement}+
                          </Badge>
                        </div>
                        
                        <Button 
                          onClick={() => handlePathwaySelect(pathway.id)}
                          className="w-full"
                        >
                          Select This Pathway
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-pathways" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Available Pathways</CardTitle>
              <CardDescription>
                Explore all pathway options available in your degree program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {pathways.map((pathway) => {
                  const Icon = pathway.icon;
                  const score = calculatePathwayScore(pathway);
                  return (
                    <div key={pathway.id} className="p-4 rounded-lg border">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${pathway.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{pathway.name}</h4>
                          <p className="text-sm text-muted-foreground">{pathway.description}</p>
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
                          <Badge variant={pathway.demand === 'Very High' ? 'destructive' : pathway.demand === 'High' ? 'default' : 'secondary'}>
                            {pathway.demand} Demand
                          </Badge>
                          <Badge variant={currentGPA >= pathway.gpaRequirement ? 'default' : 'secondary'}>
                            GPA: {pathway.gpaRequirement}+
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Avg Salary: {pathway.avgSalary}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => handlePathwaySelect(pathway.id)}
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
