export function isAnalyticsAssistantEnabled() {
    return Boolean(process.env.XAI_API_KEY);
}
