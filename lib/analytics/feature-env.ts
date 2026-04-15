export function isAnalyticsGeminiEnabled() {
    return process.env.ENABLE_ANALYTICS_GEMINI === 'true' && Boolean(process.env.GEMINI_API_KEY);
}
