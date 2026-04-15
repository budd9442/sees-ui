'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { submitStudentOnboardingAnswers } from '@/lib/actions/student-onboarding-actions';
import type { OnboardingQuestion } from '@/lib/onboarding/question-schema';

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

    const requiredCount = useMemo(() => questions.filter((q) => q.required).length, [questions]);
    const answeredRequiredCount = useMemo(
        () => questions.filter((q) => q.required && (answers[q.key] ?? '').trim().length > 0).length,
        [questions, answers]
    );

    const setAnswer = (key: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        startTransition(async () => {
            try {
                await submitStudentOnboardingAnswers(answers);
                toast.success('Onboarding completed');
                router.replace('/dashboard/student');
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Failed to save onboarding answers');
            }
        });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to SEES</CardTitle>
                    <CardDescription>
                        Complete your student profile once so your experience and analytics insights are personalized.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>- Keep your details accurate to improve advising and pathway insights.</p>
                    <p>- Answers can be updated later from your profile.</p>
                    <p>- Required items must be filled before continuing.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Questions</CardTitle>
                    <CardDescription>
                        Required answered: {answeredRequiredCount} / {requiredCount}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {questions.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No onboarding questions configured. Continue to your dashboard.
                        </p>
                    )}

                    {questions.map((q) => (
                        <div key={q.key} className="space-y-2">
                            <Label>
                                {q.label}
                                {q.required ? ' *' : ''}
                            </Label>
                            {(q.type === 'text') && (
                                <Input
                                    value={answers[q.key] ?? ''}
                                    placeholder={q.placeholder ?? ''}
                                    onChange={(e) => setAnswer(q.key, e.target.value)}
                                />
                            )}
                            {(q.type === 'textarea') && (
                                <Textarea
                                    value={answers[q.key] ?? ''}
                                    placeholder={q.placeholder ?? ''}
                                    onChange={(e) => setAnswer(q.key, e.target.value)}
                                />
                            )}
                            {(q.type === 'select' || q.type === 'radio') && (
                                <Select
                                    value={answers[q.key] ?? ''}
                                    onValueChange={(v) => setAnswer(q.key, v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={q.placeholder ?? 'Select an option'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {q.options.map((opt) => (
                                            <SelectItem key={`${q.key}-${opt}`} value={opt}>
                                                {opt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={pending}>
                            {pending ? 'Saving...' : 'Finish onboarding'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
