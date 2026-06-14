import { Resend } from "resend";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

interface TicketEmailParams {
  to: string;
  ticketCode: string;
  travelDate: string;
  destination: string;
}

export async function sendTicketCreatedEmail(params: TicketEmailParams) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@tariq.sadr.org",
    to: params.to,
    subject: `TARIQ — تذكرة ${params.ticketCode}`,
    html: `
      <h2>تم إنشاء تذكرتك / Ticket creado</h2>
      <p><strong>${params.ticketCode}</strong></p>
      <p>تاريخ السفر: ${params.travelDate}</p>
      <p>الوجهة: ${params.destination}</p>
    `,
  });
}

export async function sendVerificationEmail(
  to: string,
  approved: boolean,
  note?: string,
) {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@tariq.sadr.org",
    to,
    subject: approved
      ? "TARIQ — تم التحقق من حسابك"
      : "TARIQ — رفض التحقق",
    html: approved
      ? `<p>تم التحقق من حسابك. يمكنك الآن حجز التذاكر.</p>`
      : `<p>تم رفض التحقق.${note ? ` السبب: ${note}` : ""}</p>`,
  });
}
