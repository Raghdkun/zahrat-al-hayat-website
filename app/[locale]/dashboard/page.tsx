import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle, CreditCard, Users, TrendingUp, FileText } from "lucide-react";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === "ar";
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role: string })?.role;

  const [totalAppointments, confirmedAppointments, totalTeachers, totalPayments, recentAppointments, totalBlogPosts] =
    await Promise.all([
      db.appointment.count(role !== "ADMIN" ? { where: { teacherId: userId } } : undefined),
      db.appointment.count({
        where: {
          status: "CONFIRMED",
          ...(role !== "ADMIN" ? { teacherId: userId } : {}),
        },
      }),
      db.teacherProfile.count({ where: { isActive: true } }),
      db.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      db.appointment.findMany({
        where: role !== "ADMIN" ? { teacherId: userId } : {},
        take: 5,
        orderBy: { slotDate: "desc" },
        include: { student: { select: { name: true } }, teacher: { select: { name: true } } },
      }),
      db.blogPost.count(),
    ]);

  const stats = [
    {
      title: isRtl ? "إجمالي المواعيد" : "Total Appointments",
      value: totalAppointments,
      icon: CalendarDays,
      color: "text-primary",
      bg: "bg-accent/40",
    },
    {
      title: isRtl ? "المواعيد المؤكدة" : "Confirmed",
      value: confirmedAppointments,
      icon: CheckCircle,
      color: "text-tertiary",
      bg: "bg-secondary",
    },
    {
      title: isRtl ? "المدربون النشطون" : "Active Teachers",
      value: totalTeachers,
      icon: Users,
      color: "text-brand-secondary",
      bg: "bg-accent/50",
    },
    {
      title: isRtl ? "إجمالي الإيرادات" : "Total Revenue",
      value: `$${(totalPayments._sum.amount ?? 0).toFixed(2)}`,
      icon: CreditCard,
      color: "text-primary",
      bg: "bg-accent/40",
    },
    {
      title: isRtl ? "المقالات" : "Blog Posts",
      value: totalBlogPosts,
      icon: FileText,
      color: "text-brand-secondary",
      bg: "bg-secondary",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
  };
  const statusLabels: Record<string, string> = isRtl
    ? { PENDING: "قيد الانتظار", CONFIRMED: "مؤكد", CANCELLED: "ملغي", COMPLETED: "مكتمل" }
    : { PENDING: "Pending", CONFIRMED: "Confirmed", CANCELLED: "Cancelled", COMPLETED: "Completed" };

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{isRtl ? "لوحة التحكم" : "Dashboard"}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isRtl ? `مرحباً، ${session?.user?.name}` : `Welcome, ${session?.user?.name}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className={`${stat.bg} border-0 hover:shadow-md transition-shadow`}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-2xl font-display font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-bold text-lg mb-4">
            {isRtl ? "آخر المواعيد" : "Recent Appointments"}
          </h2>
          {recentAppointments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              {isRtl ? "لا توجد مواعيد حديثة" : "No recent appointments"}
            </p>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                      {apt.student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{apt.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isRtl ? "مع" : "with"} {apt.teacher.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(apt.slotDate).toLocaleDateString(isRtl ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[apt.status] || ""}`}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
