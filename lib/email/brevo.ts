import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key from environment variable
if (process.env.BREVO_API_KEY) {
    apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    );
}

export interface EmailParams {
    to: string;
    toName?: string;
    subject: string;
    htmlContent: string;
}

/**
 * Send a transactional email using Brevo
 */
export async function sendEmail({ to, toName, subject, htmlContent }: EmailParams) {
    try {
        if (!process.env.BREVO_API_KEY) {
            console.error('[Email] BREVO_API_KEY not configured');
            throw new Error('Email service not configured');
        }

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'SEES Platform',
            email: process.env.BREVO_SENDER_EMAIL || 'noreply@sees.budd.codes'
        };
        sendSmtpEmail.to = [{ email: to, name: toName }];

        console.log(`[Email] Sending email to ${to}: ${subject}`);
        console.log(`[Email] Payload:`, JSON.stringify({
            to: sendSmtpEmail.to,
            subject: sendSmtpEmail.subject,
            templateId: sendSmtpEmail.templateId,
            params: sendSmtpEmail.params
        }, null, 2));

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log(`[Email] Successfully sent email to ${to}, messageId: ${result.body.messageId}`);
        console.log(`[Email] Full Response:`, JSON.stringify(result.body, null, 2));
        return result;
    } catch (error) {
        console.error('[Email] Failed to send email:', error);
        throw error;
    }
}

/**
 * Send multiple emails (batch processing)
 */
export async function sendBatchEmails(emails: EmailParams[]) {
    const results = await Promise.allSettled(
        emails.map(email => sendEmail(email))
    );

    return {
        total: emails.length,
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
        results: results.map((r, i) => ({
            email: emails[i].to,
            success: r.status === 'fulfilled',
            error: r.status === 'rejected' ? r.reason.message : undefined
        }))
    };
}
