import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { markAllRead, getUnreadCount } from "@/lib/notifications";
import { getSessionUser, unauthorized, parseBody, serverError } from "@/lib/api";
import { notificationPatchSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await getUnreadCount(user.id);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return serverError("notifications.GET", err);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const parsed = await parseBody(req, notificationPatchSchema);
    if ("error" in parsed) return parsed.error;
    const { markAllAsRead, notificationId } = parsed.data;

    if (markAllAsRead) {
      await markAllRead(user.id);
    } else if (notificationId) {
      // Scoped to the user's own notifications (IDOR-safe).
      await db.notification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError("notifications.PATCH", err);
  }
}
