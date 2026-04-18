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
    currentVisualIds?: string[];
};

export function AnalyticsAssistantPanel({ aggregatesSummary, onApplyPatch, currentVisualIds = [] }: Props) {
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
                body: JSON.stringify({ prompt, aggregatesSummary, currentVisualIds }),
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
        <Card className="border-none shadow-none bg-transparent flex flex-col h-full overflow-hidden">
            <CardHeader className="px-0 pt-0 shrink-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    ✨ Grok Analyst
                </CardTitle>
                <CardDescription className="text-[10px] leading-relaxed">
                    Powered by xAI Grok. Use natural language to generate insight summaries, 
                    add new visualizations, or restructure your report.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-0 flex-1 overflow-y-auto min-h-0 pr-1 pb-2">
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Analyze the grade distribution and add a chart comparing modules by pass rate'"
                    rows={4}
                    className="text-xs resize-none bg-muted/30 focus-visible:ring-primary/30"
                />
                <Button 
                    type="button" 
                    onClick={run} 
                    disabled={loading || !prompt.trim()}
                    className="w-full h-9 text-xs font-semibold"
                >
                    {loading ? 'Running Analysis...' : 'Ask Assistant'}
                </Button>
                
                {narrative && (
                    <div className="rounded-lg border bg-primary/5 p-3 text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        <p className="font-semibold text-primary mb-1 text-[10px] uppercase tracking-wider">Analysis Result:</p>
                        {narrative}
                    </div>
                )}
                
                {patchJson && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Proposed Report Change:</p>
                        <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/20 p-2 text-[10px] font-mono text-muted-foreground">
                            {patchJson}
                        </pre>
                    </div>
                )}
            </CardContent>
            {lastPatch && onApplyPatch && (
                <div className="pt-3 pb-1 mt-auto border-t shrink-0">
                    <Button 
                        type="button" 
                        variant="glow"
                        onClick={() => onApplyPatch(lastPatch)}
                        className="w-full h-9 text-xs font-semibold"
                    >
                        Apply Changes to Report
                    </Button>
                </div>
            )}
        </Card>
    );
}
