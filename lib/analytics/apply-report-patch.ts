import type { ReportDefinition, ReportDefinitionPatch } from './schema';

export function applyReportDefinitionPatch(def: ReportDefinition, patch: ReportDefinitionPatch): ReportDefinition {
    const targetPageId = patch.targetPageId ?? def.pages[0]?.id;
    if (!targetPageId) return def;

    const pages = def.pages.map((p) => {
        if (p.id !== targetPageId) return p;
        let visuals = [...p.visuals];
        if (patch.removeVisualIds?.length) {
            const rm = new Set(patch.removeVisualIds);
            visuals = visuals.filter((v) => !rm.has(v.id));
        }
        if (patch.addVisuals?.length) {
            visuals = [...visuals, ...patch.addVisuals];
        }
        return { ...p, visuals };
    });

    return { ...def, pages };
}
