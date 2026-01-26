/**
 * Email template for welcoming new users with temporary password
 */
export function getWelcomeEmail(firstName: string, username: string, tempPassword: string) {
    return {
        subject: 'Welcome to SEES Platform',
        htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .credentials { background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0; }
          .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SEES!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${firstName}</strong>,</p>
            <p>Your account has been successfully created on the Student Enrollment and Evaluation System (SEES).</p>
            
            <div class="credentials">
              <p><strong>📧 Username:</strong> ${username}</p>
              <p><strong>🔑 Temporary Password:</strong> <code style="background: #fee; padding: 5px; font-size: 16px;">${tempPassword}</code></p>
            </div>
            
            <p><strong>⚠️ Important Security Notice:</strong></p>
            <p>For your security, please log in and change your password immediately. Your temporary password will expire after first use.</p>
            
            <a href="https://sees.budd.codes/login" class="button">Login Now</a>
            
            <div class="footer">
              <p>This is an automated message from SEES Platform. Please do not reply to this email.</p>
              <p>If you did not expect this email, please contact the administrator.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    };
}

/**
 * Email template for password reset requests
 */
export function getPasswordResetEmail(firstName: string, resetToken: string) {
    const resetUrl = `https://sees.budd.codes/reset-password?token=${resetToken}`;

    return {
        subject: 'Password Reset Request - SEES Platform',
        htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${firstName}</strong>,</p>
            <p>We received a request to reset your password for your SEES Platform account.</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <p><strong>⏰ This link expires in 1 hour</strong></p>
              <p>For security reasons, this password reset link will only work once and will expire after 60 minutes.</p>
            </div>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
            
            <div class="footer">
              <p>This is an automated message from SEES Platform. Please do not reply to this email.</p>
              <p>If you need assistance, please contact the administrator.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    };
}

/**
 * Email template for bulk enrollment (similar to welcome email)
 */
export function getBulkEnrollmentEmail(firstName: string, lastName: string, username: string, tempPassword: string) {
    return {
        subject: 'Your SEES Platform Account',
        htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .credentials { background: white; padding: 15px; border-left: 4px solid #059669; margin: 20px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SEES!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
            <p>Your account has been created as part of the student enrollment process.</p>
            
            <div class="credentials">
              <p><strong>📧 Username:</strong> ${username}</p>
              <p><strong>🔑 Temporary Password:</strong> <code style="background: #fee; padding: 5px; font-size: 16px;">${tempPassword}</code></p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Click the login button below</li>
              <li>Use your username and temporary password</li>
              <li>Change your password immediately for security</li>
              <li>Complete your profile information</li>
            </ol>
            
            <a href="https://sees.budd.codes/login" class="button">Login to SEES</a>
            
            <div class="footer">
              <p>This is an automated message from SEES Platform. Please do not reply to this email.</p>
              <p>For support, please contact your administrator.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    };
}

/**
 * Generate a secure temporary password
 */
export function generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
