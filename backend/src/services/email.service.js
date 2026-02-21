import { transporter } from '../config/mailer.js';
import { env } from '../config/env.js';

/**
 * sendOtpEmail — sends a 6-digit OTP to the user's email address.
 *
 * @param {string} to - recipient email
 * @param {string} name - recipient display name
 * @param {string} otp - 6-digit OTP code
 */
export const sendOtpEmail = async (to, name, otp) => {
  const expiryMinutes = env.OTP_EXPIRES_MINUTES;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: '🔐 Verify your RescueLink account',
    text: `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you did not sign up for RescueLink, please ignore this email.\n\n— The RescueLink Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#e63946,#c1121f);padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">
                        🛡 RescueLink
                      </h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                        Disaster Management Platform
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 8px;color:#333;font-size:16px;">Hi <strong>${name}</strong>,</p>
                      <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6;">
                        Use the verification code below to confirm your email address.
                        This code expires in <strong>${expiryMinutes} minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#f8f9fa;border:2px dashed #e63946;border-radius:10px;
                                  padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;
                                  letter-spacing:2px;">Your verification code</p>
                        <p style="margin:0;color:#e63946;font-size:42px;font-weight:800;
                                  letter-spacing:10px;font-family:monospace;">${otp}</p>
                      </div>

                      <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
                        If you did not create a RescueLink account, you can safely ignore this email.
                        Do not share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8f9fa;padding:20px 40px;text-align:center;
                                border-top:1px solid #eee;">
                      <p style="margin:0;color:#aaa;font-size:11px;">
                        © ${new Date().getFullYear()} RescueLink. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

/**
 * sendForgotPasswordEmail — sends a 6-digit OTP for password reset.
 */
export const sendForgotPasswordEmail = async (to, name, otp) => {
  const expiryMinutes = env.OTP_EXPIRES_MINUTES;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: '🔐 Reset your RescueLink password',
    text: `Hi ${name},\n\nYour password reset code is: ${otp}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you did not request a password reset, please ignore this email.\n\n— The RescueLink Team`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#1f2937,#111827);padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:1px;">
                        🛡 RescueLink
                      </h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                        Password Reset
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 8px;color:#333;font-size:16px;">Hi <strong>${name}</strong>,</p>
                      <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.6;">
                        You requested to reset your password. Use the verification code below to proceed.
                        This code expires in <strong>${expiryMinutes} minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#f8f9fa;border:2px dashed #1f2937;border-radius:10px;
                                  padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;
                                  letter-spacing:2px;">Your reset code</p>
                        <p style="margin:0;color:#1f2937;font-size:42px;font-weight:800;
                                  letter-spacing:10px;font-family:monospace;">${otp}</p>
                      </div>

                      <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
                        If you did not request this reset, you can safely ignore this email.
                        Do not share this code with anyone.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8f9fa;padding:20px 40px;text-align:center;
                                border-top:1px solid #eee;">
                      <p style="margin:0;color:#aaa;font-size:11px;">
                        © ${new Date().getFullYear()} RescueLink. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};
