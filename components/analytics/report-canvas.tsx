'use client';

import { useEffect, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import type { ReportDefinition } from '@/lib/analytics/schema';
import type { AnalyticsQueryFilters } from '@/lib/analytics/schema';
import { VisualRenderer } from './visual-renderer';

type Props = {
    definition: ReportDefinition;
    pageIndex?: number;
    filterContext?: AnalyticsQueryFilters;
    selectedVisualId?: string | null;
    onSelectVisual?: (id: string | null) => void;
    onDefinitionChange?: (next: ReportDefinition) => void;
    readOnlyLayout?: boolean;
};

type GridItem = { i: string; x: number; y: number; w: number; h: number };

function mergeLayout(definition: ReportDefinition, pageIndex: number, layout: GridItem[]): ReportDefinition {
    const map = new Map(layout.map((l) => [l.i, l]));
    const pages = definition.pages.map((p, pi) => {
        if (pi !== pageIndex) return p;
        return {
            ...p,
            visuals: p.visuals.map((v) => {
                const l = map.get(v.id) ?? map.get(v.layout.i);
                if (!l) return { ...v, layout: { ...v.layout, i: v.id } };
                return {
                    ...v,
                    layout: { i: v.id, x: l.x, y: l.y, w: l.w, h: l.h },
                };
            }),
        };
    });
    return { ...definition, pages };
}

export function ReportCanvas({
    definition,
    pageIndex = 0,
    filterContext,
    selectedVisualId,
    onSelectVisual,
    onDefinitionChange,
    readOnlyLayout,
}: Props) {
    const page = definition.pages[pageIndex];
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1080);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setWidth(Math.max(320, el.offsetWidth));
        });
        ro.observe(el);
        setWidth(Math.max(320, el.offsetWidth));
        return () => ro.disconnect();
    }, []);

    if (!page) return null;

    const layout = page.visuals.map((v) => ({
        i: v.id,
        x: v.layout.x,
        y: v.layout.y,
        w: v.layout.w,
        h: v.layout.h,
    }));

    const editable = Boolean(onDefinitionChange) && !readOnlyLayout;

    return (
        <div ref={containerRef} className="w-full">
            <GridLayout
                className="layout"
                layout={layout}
                cols={12}
                rowHeight={36}
                width={width}
                margin={[12, 12]}
                isDraggable={editable}
                isResizable={editable}
                draggableHandle=".drag-handle"
                onLayoutChange={(next) => {
                    if (!onDefinitionChange) return;
                    onDefinitionChange(mergeLayout(definition, pageIndex, next as GridItem[]));
                }}
            >
                {page.visuals.map((v) => (
                    <div
                        key={v.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectVisual?.(v.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectVisual?.(v.id);
                            }
                        }}
                        className={`rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col outline-none transition-shadow ${
                            selectedVisualId === v.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        }`}
                    >
                        <div className="drag-handle cursor-grab active:cursor-grabbing px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground border-b bg-muted/30 flex items-center justify-between gap-2">
                            <span className="truncate">{v.title || v.type}</span>
                            {editable && (
                                <span className="text-[9px] font-normal normal-case opacity-70">Drag to move</span>
                            )}
                        </div>
                        <div className="flex-1 min-h-0 p-2">
                            <VisualRenderer visual={v} filterContext={filterContext} />
                        </div>
                    </div>
                ))}
            </GridLayout>
        </div>
    );
}
