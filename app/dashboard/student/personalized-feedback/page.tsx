'use client';

import { useState, useEffect } from 'react';
import { getPersonalizedAIFeedback, reEvaluatePersonalizedAIFeedback } from '@/lib/actions/student-subactions';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription
} from '@/components/ui/alert';
import {
  Brain,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedFeedbackPage() {
  const [feedback, setFeedback] = useState<any | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [invalidationReason, setInvalidationReason] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const data = await getPersonalizedAIFeedback(false);
        setFeedback(data.feedback);
        setGeneratedAt(data.generatedAt ? new Date(data.generatedAt).toISOString() : null);
        setExpiresAt(data.expiresAt ? new Date(data.expiresAt).toISOString() : null);
        setInvalidationReason(data.invalidationReason);
        setFromCache(!!data.fromCache);
      } catch (err) {
        toast.error('Failed to load personalized feedback');
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const handleReEvaluate = async () => {
    setRefreshing(true);
    try {
      const data = await reEvaluatePersonalizedAIFeedback();
      setFeedback(data.feedback);
      setGeneratedAt(data.generatedAt ? new Date(data.generatedAt).toISOString() : null);
      setExpiresAt(data.expiresAt ? new Date(data.expiresAt).toISOString() : null);
      setInvalidationReason(data.invalidationReason);
      setFromCache(!!data.fromCache);
      toast.success('AI feedback re-evaluated');
    } catch {
      toast.error('Failed to re-evaluate feedback');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personalized Academic Feedback"
        description="AI-driven analysis of your profile, transcript, GPA patterns, and goals."
      />

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Generated: {generatedAt ? new Date(generatedAt).toLocaleString() : '—'}</p>
          <p>Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : '—'} {fromCache ? '· cached' : '· fresh'}</p>
          {invalidationReason && <p>Reason: {invalidationReason}</p>}
        </div>
        <Button onClick={() => void handleReEvaluate()} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Re-evaluate
        </Button>
      </div>

      {!feedback && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Unable to load AI feedback right now. Try re-evaluating.</AlertDescription>
        </Alert>
      )}

      {feedback && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{feedback.overallAssessment}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-4 space-y-1">
              {(feedback.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Risk Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-4 space-y-1">
              {(feedback.riskAreas || []).map((r: string, i: number) => <li key={i}>{r}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Goal Guidance
          </CardTitle>
          <CardDescription>Suggestions tailored to your active goals and progress trajectory.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc pl-4 space-y-1">
            {(feedback.goalGuidance || []).map((g: string, i: number) => <li key={i}>{g}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc pl-4 space-y-1">
            {(feedback.recommendedActions || []).map((a: string, i: number) => <li key={i}>{a}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next 30-Day Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc pl-4 space-y-1">
            {(feedback.next30DayPlan || []).map((p: string, i: number) => <li key={i}>{p}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          {feedback.confidenceNotes?.summary || 'AI feedback generated from your complete academic context.'}
        </AlertDescription>
      </Alert>
      </>
      )}
    </div>
  );
}
