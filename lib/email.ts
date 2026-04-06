import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SessionEmailOptions {
  toEmail: string;
  toName: string;
  healerName: string;
  healerEmail: string;
  scheduledAt: Date;
  durationMinutes: number;
  icsContent: string;
  isHealer?: boolean;
}

export async function sendSessionConfirmationEmail(opts: SessionEmailOptions) {
  const dateStr = opts.scheduledAt.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = opts.scheduledAt.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  const subject = opts.isHealer
    ? `New session booked: ${opts.toName} on ${dateStr}`
    : `Session confirmed with ${opts.healerName} — ${dateStr}`;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#07070f;color:#f0f0ff;padding:32px;border-radius:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:18px;">✦</span>
        </div>
        <span style="font-size:20px;font-weight:700;background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Healio</span>
      </div>

      <h2 style="color:#fff;margin:0 0 8px;">Session Confirmed ✓</h2>
      <p style="color:rgba(255,255,255,0.5);margin:0 0 24px;">
        ${opts.isHealer
          ? `<strong style="color:#fff">${opts.toName}</strong> has booked a session with you.`
          : `Your session with <strong style="color:#fff">${opts.healerName}</strong> is confirmed.`}
      </p>

      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="color:rgba(255,255,255,0.4);font-size:14px;">Date</span>
          <span style="color:#fff;font-size:14px;font-weight:600;">${dateStr}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="color:rgba(255,255,255,0.4);font-size:14px;">Time</span>
          <span style="color:#fff;font-size:14px;font-weight:600;">${timeStr}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:rgba(255,255,255,0.4);font-size:14px;">Duration</span>
          <span style="color:#fff;font-size:14px;font-weight:600;">${opts.durationMinutes} minutes</span>
        </div>
      </div>

      <p style="color:rgba(255,255,255,0.4);font-size:13px;">
        A calendar invite is attached. Add it to your calendar to get a reminder.
        The session link will be shared 30 minutes before your session starts.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Healio" <${process.env.SMTP_USER}>`,
    to: opts.toEmail,
    subject,
    html,
    attachments: [
      {
        filename: "session.ics",
        content: opts.icsContent,
        contentType: "text/calendar; method=REQUEST",
      },
    ],
  });
}
