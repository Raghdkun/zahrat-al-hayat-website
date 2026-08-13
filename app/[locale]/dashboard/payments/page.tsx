import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === "ar";

  const payments = await db.payment.findMany({
    include: {
      appointment: {
        include: {
          student: { select: { name: true, email: true } },
          teacher: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">{isRtl ? "المدفوعات" : "Payments"}</h1>
        <div className="text-end">
          <p className="text-sm text-muted-foreground">{isRtl ? "إجمالي الإيرادات" : "Total Revenue"}</p>
          <p className="text-2xl font-display font-semibold text-green-600">${total.toFixed(2)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isRtl ? "سجل المدفوعات" : "Payment Records"} ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/50 hover:bg-accent/50">
                <TableHead className="font-bold text-primary">{isRtl ? "الطالب" : "Student"}</TableHead>
                <TableHead className="font-bold text-primary">{isRtl ? "المدرب" : "Teacher"}</TableHead>
                <TableHead className="font-bold text-primary">{isRtl ? "المبلغ" : "Amount"}</TableHead>
                <TableHead className="font-bold text-primary">{isRtl ? "الحالة" : "Status"}</TableHead>
                <TableHead className="font-bold text-primary">{isRtl ? "التاريخ" : "Date"}</TableHead>
                <TableHead className="font-bold text-primary">Stripe ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.appointment.student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.appointment.student.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{payment.appointment.teacher.name}</TableCell>
                  <TableCell className="font-medium">
                    {payment.amount} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "PAID"
                          ? "default"
                          : payment.status === "FAILED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {payment.status === "PAID"
                        ? (isRtl ? "مدفوع" : "Paid")
                        : payment.status === "FAILED"
                        ? (isRtl ? "فشل" : "Failed")
                        : payment.status === "REFUNDED"
                        ? (isRtl ? "مسترد" : "Refunded")
                        : (isRtl ? "قيد الانتظار" : "Pending")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(payment.createdAt).toLocaleDateString(isRtl ? "ar-SY" : "en-US")}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {payment.stripePaymentIntentId?.slice(0, 20) ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {isRtl ? "لا توجد مدفوعات بعد" : "No payments yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
