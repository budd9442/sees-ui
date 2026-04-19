'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, FileJson, Check, Layout, PlusCircle, Trash2 } from 'lucide-react';
import type { ReportDefinitionPatch, ReportDefinition } from '@/lib/analytics/schema';
import { reportDefinitionPatchSchema } from '@/lib/analytics/schema';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
    aggregatesSummary?: string;
    /** Merge a validated model patch into the open report (and optional title). */
    onApplyPatch?: (patch: ReportDefinitionPatch) => void;
    currentVisualIds?: string[];
    definition?: ReportDefinition;
};

export function AnalyticsAssistantPanel({ aggregatesSummary, onApplyPatch, currentVisualIds = [], definition }: Props) {
    const [prompt, setPrompt] = useState('');
    const [narrative, setNarrative] = useState<string | null>(null);
    const [lastPatch, setLastPatch] = useState<ReportDefinitionPatch | null>(null);
    const [loading, setLoading] = useState(false);
    const [showRawPatch, setShowRawPatch] = useState(false);

    const run = async () => {
        setLoading(true);
        setNarrative(null);
        setLastPatch(null);
        try {
            const res = await fetch('/api/analytics/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt, 
                    aggregatesSummary, 
                    currentVisualIds,
                    definition 
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || 'Request failed');
                return;
            }
            if (data.narrative) setNarrative(data.narrative);
            if (data.patch) {
                const parsed = reportDefinitionPatchSchema.safeParse(data.patch);
                if (parsed.success) setLastPatch(parsed.data);
                else {
                    toast.error('AI returned an invalid patch structure');
                    console.error('Validation failure:', parsed.error);
                }
            }
            if (!data.narrative && !data.patch) toast.message('No analysis or changes suggested');
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
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    AI Report Designer
                </CardTitle>
                <CardDescription className="text-[10px] leading-relaxed">
                    Institutional analytics assistant. Ask to analyze trends, generate new charts, 
                    or restructure your current report layout.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0 flex-1 overflow-hidden pr-1 pb-2">
                <ScrollArea className="h-full pr-3">
                    <div className="space-y-4 pb-4">
                        {/* Input & Primary Actions */}
                        <div className="space-y-2">
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'Add a KPI for average GPA and a chart comparing pass rates by level'"
                                rows={4}
                                className="text-xs resize-none bg-muted/30 focus-visible:ring-primary/30 border-border/40"
                            />
                            <div className="flex flex-col gap-2">
                                <Button 
                                    type="button" 
                                    onClick={run} 
                                    disabled={loading || !prompt.trim()}
                                    className="w-full h-9 text-xs font-semibold shadow-sm"
                                >
                                    {loading ? 'Processing Design...' : 'Generate Insights'}
                                </Button>

                                {lastPatch && onApplyPatch && (
                                    <Button 
                                        type="button" 
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                            onApplyPatch(lastPatch);
                                            toast.success('Report updated successfully');
                                            setLastPatch(null);
                                            setNarrative(null);
                                        }}
                                        className="w-full h-9 text-[11px] font-semibold bg-primary/90 hover:bg-primary shadow-md border border-primary/20 animate-in fade-in slide-in-from-top-1 duration-200"
                                    >
                                        <Check className="h-3.5 w-3.5 mr-1.5" />
                                        Commit Design Changes
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Analysis Narrative */}
                        {narrative && (
                            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3.5 text-[11px] leading-relaxed text-foreground/90 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 border-primary/20 text-primary">Analysis</Badge>
                                </div>
                                <div className="whitespace-pre-wrap">{narrative}</div>
                            </div>
                        )}
                        
                        {/* Patch Summary / Proposed Changes */}
                        {lastPatch && (
                            <div className="rounded-xl border border-border/60 bg-muted/10 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0">Proposed Changes</Badge>
                                    <button 
                                        onClick={() => setShowRawPatch(!showRawPatch)}
                                        className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                                    >
                                        <FileJson className="h-3 w-3" />
                                        {showRawPatch ? 'Show Summary' : 'View Source'}
                                    </button>
                                </div>

                                {showRawPatch ? (
                                    <pre className="max-h-48 overflow-auto rounded-lg border bg-background/50 p-2 text-[9px] font-mono text-muted-foreground">
                                        {JSON.stringify(lastPatch, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="space-y-2.5">
                                        {lastPatch.updateTitle && (
                                            <div className="flex items-start gap-2 text-[10px]">
                                                <Layout className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="font-semibold">Rename Report:</span>
                                                    <p className="text-muted-foreground italic">"{lastPatch.updateTitle}"</p>
                                                </div>
                                            </div>
                                        )}
                                        {lastPatch.addVisuals && lastPatch.addVisuals.length > 0 && (
                                            <div className="flex items-start gap-2 text-[10px]">
                                                <PlusCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="font-semibold">Add {lastPatch.addVisuals.length} Visuals:</span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {lastPatch.addVisuals.map(v => (
                                                            <Badge key={v.id} variant="outline" className="text-[8px] font-normal py-0">
                                                                {v.type} • {v.title || 'Untitled'}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {lastPatch.removeVisualIds && lastPatch.removeVisualIds.length > 0 && (
                                            <div className="flex items-start gap-2 text-[10px]">
                                                <Trash2 className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="font-semibold">Remove {lastPatch.removeVisualIds.length} Existing Visuals</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
