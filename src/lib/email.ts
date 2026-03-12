import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Portfolio 404 <noreply@portfolio404.site>";
const BASE_URL = process.env.NEXTAUTH_URL || "https://portfolio404.site";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email — Portfolio 404",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#131313;color:#fafafa;border-radius:12px;">
        <h2 style="color:#70E844;margin-bottom:16px;">Verify your email</h2>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">
          Thanks for signing up! Click the button below to verify your email address.
        </p>
        <a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#70E844;color:#131313;font-weight:600;text-decoration:none;border-radius:8px;font-size:14px;">
          Verify Email
        </a>
        <p style="color:#666;font-size:12px;margin-top:24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password — Portfolio 404",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#131313;color:#fafafa;border-radius:12px;">
        <h2 style="color:#70E844;margin-bottom:16px;">Reset your password</h2>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">
          You requested a password reset. Click the button below to choose a new password. This link expires in 1 hour.
        </p>
        <a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#70E844;color:#131313;font-weight:600;text-decoration:none;border-radius:8px;font-size:14px;">
          Reset Password
        </a>
        <p style="color:#666;font-size:12px;margin-top:24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
