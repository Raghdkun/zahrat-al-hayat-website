import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

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
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
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
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  });
}
