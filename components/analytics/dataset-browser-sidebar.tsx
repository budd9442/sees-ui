'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, Plus } from 'lucide-react';
import type { AnalyticsDatasetId } from '@/lib/analytics/schema';
import { DATASET_LABELS, analyticsDatasetsForRole, columnsForDatasetShape } from '@/lib/analytics/builder-metadata';
import { DATASET_DESCRIPTIONS } from '@/lib/analytics/catalog';

type Props = {
    builderRole: string;
    onAddVisual: (datasetId: AnalyticsDatasetId) => void;
};

export function DatasetBrowserSidebar({ builderRole, onAddVisual }: Props) {
    const [search, setSearch] = useState('');
    const allowed = analyticsDatasetsForRole(builderRole);

    const filtered = allowed.filter((id) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (DATASET_LABELS[id] ?? id).toLowerCase().includes(q) ||
            (DATASET_DESCRIPTIONS[id] ?? '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Available Datasets</p>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search datasets..."
                        className="pl-8 h-8 text-xs"
                    />
                </div>
            </div>

            <div className="flex-1 h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                <div className="p-2 space-y-1">
                    {filtered.map((id) => (
                        <DatasetCard key={id} id={id} onAdd={onAddVisual} />
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">No datasets match your search.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function DatasetCard({ id, onAdd }: { id: AnalyticsDatasetId; onAdd: (id: AnalyticsDatasetId) => void }) {
    const label = DATASET_LABELS[id] ?? id;
    const desc = DATASET_DESCRIPTIONS[id] ?? '';
    const cols = columnsForDatasetShape(id, undefined);

    return (
        <div className={cn(
            'group relative rounded-md border border-transparent p-2 text-xs transition-all cursor-pointer',
            'hover:border-primary/20 hover:bg-primary/5 hover:shadow-sm'
        )} onClick={() => onAdd(id)}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{label}</p>
                    <p className="text-muted-foreground line-clamp-1 mt-0.5">{desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{cols.length} columns available</p>
                </div>
                <div className="h-6 w-6 flex items-center justify-center rounded-sm bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-3.5 w-3.5" />
                </div>
            </div>
        </div>
    );
}
