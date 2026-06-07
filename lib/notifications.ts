import { db } from "./db";
import type { NotificationType } from "@prisma/client";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return db.notification.create({ data: params });
}

export async function createAppointmentNotifications(appointmentId: string) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      student: true,
      teacher: true,
    },
  });

  if (!appointment) return;

  const dateStr = new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "full",
  }).format(appointment.slotDate);
  const dateStrEn = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
  }).format(appointment.slotDate);

  await Promise.all([
    createNotification({
      userId: appointment.studentId,
      type: "APPOINTMENT_CONFIRMED",
      titleAr: "تم تأكيد موعدك",
      titleEn: "Your Appointment is Confirmed",
      bodyAr: `تم تأكيد موعدك مع ${appointment.teacher.name} بتاريخ ${dateStr} الساعة ${appointment.slotTime}`,
      bodyEn: `Your appointment with ${appointment.teacher.name} on ${dateStrEn} at ${appointment.slotTime} is confirmed`,
      link: `/ar/book/confirmation/${appointmentId}`,
    }),
    createNotification({
      userId: appointment.teacherId,
      type: "APPOINTMENT_CONFIRMED",
      titleAr: "حجز جديد",
      titleEn: "New Appointment Booked",
      bodyAr: `قام ${appointment.student.name} بحجز موعد معك بتاريخ ${dateStr}`,
      bodyEn: `${appointment.student.name} booked an appointment with you on ${dateStrEn}`,
      link: `/ar/dashboard/appointments/${appointmentId}`,
    }),
  ]);
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
