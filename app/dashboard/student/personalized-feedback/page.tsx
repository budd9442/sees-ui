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

function LoadingMessages() {
  const [index, setIndex] = useState(0);
  const messages = [
    'Checking your grades...',
    'Analyzing your goals...',
    'Crunching numbers...',
    'Analyzing upcoming modules...',
    'Consulting with AI...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <p className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700">
      {messages[index]}
    </p>
  );
}

export default function PersonalizedFeedbackPage() {
  const [feedback, setFeedback] = useState<any | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [invalidationReason, setInvalidationReason] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        setError(null);
        const data = await getPersonalizedAIFeedback(false);
        setFeedback(data.feedback);
        setGeneratedAt(data.generatedAt ? new Date(data.generatedAt).toISOString() : null);
        setExpiresAt(data.expiresAt ? new Date(data.expiresAt).toISOString() : null);
        setInvalidationReason(data.invalidationReason);
        setFromCache(!!data.fromCache);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load personalized feedback';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const handleReEvaluate = async () => {
    setRefreshing(true);
    setLoading(true); // Show friendly loading text during full re-evaluation
    setError(null);
    try {
      const data = await reEvaluatePersonalizedAIFeedback();
      setFeedback(data.feedback);
      setGeneratedAt(data.generatedAt ? new Date(data.generatedAt).toISOString() : null);
      setExpiresAt(data.expiresAt ? new Date(data.expiresAt).toISOString() : null);
      setInvalidationReason(data.invalidationReason);
      setFromCache(!!data.fromCache);
      toast.success('AI feedback re-evaluated');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to re-evaluate feedback';
      setError(message);
      toast.error(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-pulse" />
        </div>
        <div className="h-6 overflow-hidden">
          <LoadingMessages />
        </div>
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

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm opacity-90">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void handleReEvaluate()} className="mt-4 bg-white hover:bg-slate-50 border-destructive/20 text-destructive">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {feedback && !error && (
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
