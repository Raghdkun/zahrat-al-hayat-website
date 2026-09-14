import { Resend } from "resend";

// Email is OPTIONAL. The Resend SDK throws "Missing API key" from its
// constructor when the key is empty, which would crash at import time — and
// during `next build` while collecting page data for the payments webhook
// route. Construct with a placeholder so importing is always safe, and gate
// actual sends on `isEmailEnabled`.
const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

export const resend = new Resend(apiKey || "re_email_disabled_placeholder");

/** True only when a real key AND a from-address are configured. */
export const isEmailEnabled = Boolean(apiKey && fromEmail);

function skipSend(subject: string) {
  console.warn(
    `[resend] email disabled (RESEND_API_KEY / RESEND_FROM_EMAIL not set) — skipped: ${subject}`
  );
  return null;
}

interface AppointmentEmailData {
  studentName: string;
  teacherName: string;
  date: string;
  time: string;
  amount: number;
  currency: string;
}

export async function sendAppointmentConfirmationEmail(
  to: string,
  data: AppointmentEmailData,
  locale: "ar" | "en" = "ar"
) {
  const subject =
    locale === "ar"
      ? "تأكيد حجز موعدك - مركز زهرة الحياة"
      : "Appointment Booking Confirmed - Zahrat Al Hayat Center";

  const html =
    locale === "ar"
      ? `
    <div dir="rtl" style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4e0078;">مركز زهرة الحياة</h1>
      <h2>تم تأكيد موعدك بنجاح</h2>
      <p>مرحباً ${data.studentName}،</p>
      <p>تم حجز موعدك مع <strong>${data.teacherName}</strong> بنجاح.</p>
      <div style="background: #f6eaf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>التاريخ:</strong> ${data.date}</p>
        <p><strong>الوقت:</strong> ${data.time}</p>
        <p><strong>المبلغ المدفوع:</strong> ${data.amount} ${data.currency}</p>
      </div>
      <p>سيتواصل معك المدرب قريباً لتأكيد تفاصيل الجلسة.</p>
      <p style="color: #666; font-size: 12px;">مركز زهرة الحياة - رحلة نحو التوازن والشفاء الداخلي</p>
    </div>
  `
      : `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4e0078;">Zahrat Al Hayat Center</h1>
      <h2>Your Appointment is Confirmed!</h2>
      <p>Hello ${data.studentName},</p>
      <p>Your appointment with <strong>${data.teacherName}</strong> has been successfully booked.</p>
      <div style="background: #f6eaf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Amount Paid:</strong> ${data.amount} ${data.currency}</p>
      </div>
      <p>The teacher will reach out to confirm the session details.</p>
      <p style="color: #666; font-size: 12px;">Zahrat Al Hayat Center - A Journey Towards Balance and Inner Healing</p>
    </div>
  `;

  if (!isEmailEnabled) return skipSend(subject);

  return resend.emails.send({
    from: fromEmail!,
    to,
    subject,
    html,
  });
}

export async function sendTeacherNotificationEmail(
  to: string,
  data: AppointmentEmailData,
  locale: "ar" | "en" = "ar"
) {
  const subject =
    locale === "ar"
      ? "حجز جديد - مركز زهرة الحياة"
      : "New Booking - Zahrat Al Hayat Center";

  const html =
    locale === "ar"
      ? `
    <div dir="rtl" style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4e0078;">مركز زهرة الحياة</h1>
      <h2>حجز جديد!</h2>
      <p>مرحباً ${data.teacherName}،</p>
      <p>قام الطالب <strong>${data.studentName}</strong> بحجز موعد معك.</p>
      <div style="background: #f6eaf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>التاريخ:</strong> ${data.date}</p>
        <p><strong>الوقت:</strong> ${data.time}</p>
      </div>
      <p>يرجى مراجعة لوحة التحكم لإدارة الموعد.</p>
    </div>
  `
      : `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4e0078;">Zahrat Al Hayat Center</h1>
      <h2>New Booking!</h2>
      <p>Hello ${data.teacherName},</p>
      <p>Student <strong>${data.studentName}</strong> has booked an appointment with you.</p>
      <div style="background: #f6eaf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Time:</strong> ${data.time}</p>
      </div>
      <p>Please review the dashboard to manage this appointment.</p>
    </div>
  `;

  if (!isEmailEnabled) return skipSend(subject);

  return resend.emails.send({
    from: fromEmail!,
    to,
    subject,
    html,
  });
}
