'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { submitStudentOnboardingAnswers } from '@/lib/actions/student-onboarding-actions';
import type { OnboardingQuestion } from '@/lib/onboarding/question-schema';
import { 
    Sparkles, 
    CheckCircle2, 
    GraduationCap, 
    ArrowRight, 
    Loader2, 
    UserCircle2,
    Check,
    LogOut
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Props = {
    questions: OnboardingQuestion[];
    initialMetadata: Record<string, unknown>;
};

export default function StudentOnboardingClient({ questions, initialMetadata }: Props) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        const seed: Record<string, string> = {};
        for (const q of questions) {
            const raw = initialMetadata[q.key];
            seed[q.key] = raw == null ? '' : String(raw);
        }
        return seed;
    });

    // Automatically submit and proceed if there are no questions
    useEffect(() => {
        if (questions.length === 0 && !pending) {
            startTransition(async () => {
                try {
                    await submitStudentOnboardingAnswers({});
                    router.replace('/onboarding/student/lms-import');
                } catch (e) {
                    console.error('Failed to auto-skip onboarding:', e);
                }
            });
        }
    }, [questions.length, router, pending]);

    const requiredCount = useMemo(() => questions.filter((q) => q.required).length, [questions]);
    const answeredRequiredCount = useMemo(
        () => questions.filter((q) => q.required && (answers[q.key] ?? '').trim().length > 0).length,
        [questions, answers]
    );

    const progress = requiredCount > 0 ? (answeredRequiredCount / requiredCount) * 100 : 100;

    const setAnswer = (key: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (answeredRequiredCount < requiredCount) {
            toast.error(`Please answer all ${requiredCount} required questions first.`);
            return;
        }

        startTransition(async () => {
            try {
                await submitStudentOnboardingAnswers(answers);
                toast.success('Onboarding completed');
                router.replace('/onboarding/student/lms-import');
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Failed to save onboarding answers');
            }
        });
    };

    return (
        <div className="mx-auto max-w-2xl space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Bar with Logout */}
            <div className="flex justify-end">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => logoutAction()}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Button>
            </div>

            {/* Header Section */}
            <div className="space-y-4 text-center pb-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                    <GraduationCap className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">Complete Your Profile</h1>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Help us personalize your SEES experience. Your answers enable targeted analytics and smarter academic recommendations.
                </p>
            </div>

            {/* Progress Bar */}
            <Card className="border-none bg-primary/5 shadow-none overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span>Onboarding Progress</span>
                        </div>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {answeredRequiredCount} / {requiredCount} Required
                        </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-primary/20" />
                </CardContent>
            </Card>

            {/* Form Section */}
            <div className="space-y-6">
                {questions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-full bg-muted">
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold">All caught up!</p>
                                <p className="text-sm text-muted-foreground">No extra profile configuration is needed right now.</p>
                            </div>
                            <Button onClick={() => router.replace('/onboarding/student/lms-import')} className="rounded-xl">
                                Go to LMS Import
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q) => (
                            <Card key={q.key} className="border-none shadow-sm ring-1 ring-muted transition-all hover:ring-primary/20">
                                <CardContent className="p-6 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <Label className="text-sm font-semibold leading-relaxed">
                                            {q.label}
                                            {q.required && <span className="text-primary ml-1 font-bold">*</span>}
                                        </Label>
                                        {(answers[q.key] ?? '').trim().length > 0 && (
                                            <div className="bg-green-100 p-0.5 rounded-full">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                        )}
                                    </div>

                                    {q.type === 'text' && (
                                        <Input
                                            value={answers[q.key] ?? ''}
                                            placeholder={q.placeholder ?? ''}
                                            className="h-11 rounded-xl bg-muted/30 border-none transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20"
                                            onChange={(e) => setAnswer(q.key, e.target.value)}
                                        />
                                    )}
                                    {q.type === 'textarea' && (
                                        <Textarea
                                            value={answers[q.key] ?? ''}
                                            placeholder={q.placeholder ?? ''}
                                            className="min-h-[100px] rounded-xl bg-muted/30 border-none resize-none transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20"
                                            onChange={(e) => setAnswer(q.key, e.target.value)}
                                        />
                                    )}
                                    {(q.type === 'select' || q.type === 'radio') && (
                                        <Select
                                            value={answers[q.key] ?? ''}
                                            onValueChange={(v) => setAnswer(q.key, v)}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none transition-colors focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20">
                                                <SelectValue placeholder={q.placeholder ?? 'Select an option'} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {q.options.map((opt) => (
                                                    <SelectItem key={`${q.key}-${opt}`} value={opt} className="rounded-lg">
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        <div className="pt-4 flex flex-col space-y-4">
                            <Button 
                                onClick={handleSubmit} 
                                size="lg"
                                disabled={pending || answeredRequiredCount < requiredCount}
                                className="w-full h-12 rounded-xl text-md font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                {pending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Personalizing your account...
                                    </>
                                ) : (
                                    <>
                                        Finish Setup
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest px-8">
                                Your data is protected. You can update these preferences anytime from your profile settings.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
