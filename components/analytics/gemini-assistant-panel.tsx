'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ReportDefinitionPatch } from '@/lib/analytics/schema';
import { reportDefinitionPatchSchema } from '@/lib/analytics/schema';

type Props = {
    aggregatesSummary?: string;
    /** Merge a validated model patch into the open report (and optional title). */
    onApplyPatch?: (patch: ReportDefinitionPatch) => void;
};

export function GeminiAssistantPanel({ aggregatesSummary, onApplyPatch }: Props) {
    const [prompt, setPrompt] = useState('');
    const [narrative, setNarrative] = useState<string | null>(null);
    const [patchJson, setPatchJson] = useState<string | null>(null);
    const [lastPatch, setLastPatch] = useState<ReportDefinitionPatch | null>(null);
    const [loading, setLoading] = useState(false);

    const run = async () => {
        setLoading(true);
        setNarrative(null);
        setPatchJson(null);
        setLastPatch(null);
        try {
            const res = await fetch('/api/analytics/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, aggregatesSummary }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Request failed');
                return;
            }
            if (data.narrative) setNarrative(data.narrative);
            if (data.patch) {
                setPatchJson(JSON.stringify(data.patch, null, 2));
                const parsed = reportDefinitionPatchSchema.safeParse(data.patch);
                if (parsed.success) setLastPatch(parsed.data);
                else toast.message('Patch failed validation — shown for review only');
            }
            if (!data.narrative && !data.patch) toast.message('No narrative or patch returned');
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">AI assistant (Gemini)</CardTitle>
                <CardDescription>
                    Requires ENABLE_ANALYTICS_GEMINI=true and GEMINI_API_KEY. Outputs validated JSON only—review any patch
                    before applying.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask for chart suggestions or a short summary of trends…"
                    rows={3}
                />
                <Button type="button" onClick={run} disabled={loading || !prompt.trim()}>
                    {loading ? 'Running…' : 'Run assistant'}
                </Button>
                {narrative && (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{narrative}</div>
                )}
                {patchJson && (
                    <pre className="max-h-48 overflow-auto rounded-md border bg-muted/20 p-2 text-xs">{patchJson}</pre>
                )}
                {lastPatch && onApplyPatch && (
                    <Button type="button" variant="secondary" onClick={() => onApplyPatch(lastPatch)}>
                        Apply patch to report
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
