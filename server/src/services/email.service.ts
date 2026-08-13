import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(config.resendApiKey);

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  userName?: string;
}

export const sendPasswordResetEmail = async ({
  to,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams): Promise<boolean> => {
  if (!config.resendApiKey) {
    console.warn(
      '[EmailService] RESEND_API_KEY is not set. Email notification skipped in local/dev environment.'
    );
    console.log(`[EmailService] Mock Email Output -> Reset Link for ${to}: ${resetUrl}`);
    return false;
  }

  const displayName = userName ? userName.trim() : 'StoreHub User';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your StoreHub password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .brand-title {
      color: #ffffff;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .brand-subtitle {
      color: #93c5fd;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: #2563eb;
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
    }
    .expiry-notice {
      background-color: #f1f5f9;
      border-left: 4px solid #2563eb;
      padding: 14px 16px;
      border-radius: 6px;
      font-size: 14px;
      color: #334155;
      margin-bottom: 28px;
    }
    .fallback-text {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      word-break: break-all;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }
    .fallback-url {
      color: #2563eb;
      text-decoration: underline;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">StoreHub</h1>
      <div class="brand-subtitle">Store Rating & Discovery Platform</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${displayName},</div>
      <p class="message">
        We received a request to reset your StoreHub account password. Click the button below to set a new password for your account.
      </p>

      <div class="btn-container">
        <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
      </div>

      <div class="expiry-notice">
        ⏱️ <strong>Note:</strong> This password reset link will expire in <strong>30 minutes</strong>.
      </div>

      <p class="message" style="margin-bottom: 0;">
        If you did not request a password reset, you can safely ignore this email — your account password will remain unchanged.
      </p>

      <div class="fallback-text">
        If the button above doesn't work, copy and paste the following URL into your browser:<br>
        <a href="${resetUrl}" class="fallback-url">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} StoreHub. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  try {
    const response = await resend.emails.send({
      from: config.emailFrom,
      to,
      subject: 'Reset your StoreHub password',
      html: htmlContent,
    });

    if (response.error) {
      console.error('[EmailService] Resend API returned error:', response.error);
      return false;
    }

    console.log(`[EmailService] Password reset email sent successfully to ${to} (ID: ${response.data?.id})`);
    return true;
  } catch (err: any) {
    console.error('[EmailService] Failed to send password reset email:', err?.message || err);
    return false;
  }
};
