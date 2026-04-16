/**
 * Interpolate `{{placeholder}}` in template strings using a vars map.
 * Unknown placeholders are left unchanged.
 */
export function interpolateTemplate(template: string, vars: Record<string, string | number | undefined | null>): string {
    if (!template) return '';
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
        const v = vars[key];
        if (v === undefined || v === null) return `{{${key}}}`;
        return String(v);
    });
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/** Plain-text body → safe HTML for email (newlines → <br>). */
export function plainTextToEmailHtml(text: string): string {
    const escaped = escapeHtml(text);
    return escaped.replace(/\r\n/g, '\n').replace(/\n/g, '<br>\n');
}
