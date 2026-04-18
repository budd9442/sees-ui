export function isAnalyticsGeminiEnabled() {
    return Boolean(process.env.XAI_API_KEY);
}
