import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = "Portfolio 404 <noreply@portfolio404.site>";
const BASE_URL = process.env.NEXTAUTH_URL || "https://portfolio404new.vercel.app";

export async function sendVerificationEmail(email: string, token: string) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.");
    return;
  }
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

export async function sendWelcomeEmail(email: string, firstName: string, username: string) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.");
    return;
  }
  const dashboardUrl = `${BASE_URL}/u/${username}/admin`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to Portfolio 404!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#131313;color:#fafafa;border-radius:12px;">
        <h2 style="color:#70E844;margin-bottom:16px;">Welcome to Portfolio 404!</h2>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">
          Hey ${firstName}, your account has been successfully created. You're all set to build your portfolio.
        </p>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">
          Your username is <strong style="color:#fafafa;">${username}</strong> — you can change it anytime in your account settings.
        </p>
        <a href="${dashboardUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#70E844;color:#131313;font-weight:600;text-decoration:none;border-radius:8px;font-size:14px;">
          Go to Dashboard
        </a>
        <p style="color:#666;font-size:12px;margin-top:24px;">
          If you didn't create this account, please contact us.
        </p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(email: string, firstName: string, username: string, txId: string) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.");
    return;
  }
  const dashboardUrl = `${BASE_URL}/u/${username}/admin`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Payment confirmed — Welcome to Portfolio 404 Pro!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#131313;color:#fafafa;border-radius:12px;">
        <h2 style="color:#70E844;margin-bottom:16px;">Payment Confirmed!</h2>
        <p style="color:#ccc;font-size:14px;line-height:1.6;">
          Hey ${firstName}, your one-time payment of <strong style="color:#fafafa;">$5.00 USD</strong> was successfully processed. You now have lifetime access to Portfolio 404 Pro.
        </p>
        <p style="color:#666;font-size:12px;margin-top:12px;">Transaction ID: ${txId}</p>
        <a href="${dashboardUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#70E844;color:#131313;font-weight:600;text-decoration:none;border-radius:8px;font-size:14px;">
          Go to Dashboard
        </a>
        <p style="color:#666;font-size:12px;margin-top:24px;">
          If you have any questions, reply to this email.
        </p>
      </div>
    `,
  });
}

const ADMIN_EMAIL = "te4c4h@gmail.com";

export async function sendNewUserNotification(firstName: string, lastName: string, email: string, username: string, method: string) {
  if (!resend) {
    console.warn("Resend API key not configured. Admin notification not sent.");
    return;
  }
  const profileUrl = `${BASE_URL}/u/${username}`;
  const dashboardUrl = `${BASE_URL}/u/admin/admin/users`;
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New user registered — ${firstName} ${lastName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#131313;color:#fafafa;border-radius:12px;">
        <h2 style="color:#70E844;margin-bottom:16px;">New User Registration</h2>
        <table style="color:#ccc;font-size:14px;line-height:1.8;border-collapse:collapse;">
          <tr><td style="padding-right:12px;color:#666;">Name</td><td style="color:#fafafa;font-weight:600;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding-right:12px;color:#666;">Email</td><td>${email}</td></tr>
          <tr><td style="padding-right:12px;color:#666;">Username</td><td style="color:#70E844;">${username}</td></tr>
          <tr><td style="padding-right:12px;color:#666;">Method</td><td>${method}</td></tr>
          <tr><td style="padding-right:12px;color:#666;">Time</td><td>${new Date().toUTCString()}</td></tr>
        </table>
        <div style="margin-top:20px;display:flex;gap:12px;">
          <a href="${profileUrl}" style="display:inline-block;padding:10px 20px;background:#70E844;color:#131313;font-weight:600;text-decoration:none;border-radius:8px;font-size:13px;">View Profile</a>
          <a href="${dashboardUrl}" style="display:inline-block;padding:10px 20px;background:#333;color:#fafafa;font-weight:600;text-decoration:none;border-radius:8px;font-size:13px;">Manage Users</a>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.warn("Resend API key not configured. Email not sent.");
    return;
  }
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
