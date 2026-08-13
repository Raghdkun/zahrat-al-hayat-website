"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  format,
  isSameDay,
  startOfDay,
  parseISO,
} from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import {
  Search,
  Loader2,
  Check,
  X,
  Trash2,
  CheckCircle,
  Link,
  Pencil,
  CalendarDays,
  List,
  Clock,
  User,
  GraduationCap,
} from "lucide-react";

type Appointment = {
  id: string;
  studentId: string;
  teacherId: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes: string | null;
  meetingLink: string | null;
  amountPaid: number | null;
  currency: string;
  student: { name: string | null; email: string | null };
  teacher: { name: string | null; email: string | null };
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const statusDotColors: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-green-500",
  CANCELLED: "bg-red-400",
  COMPLETED: "bg-blue-500",
};

const statusLabels: Record<string, { ar: string; en: string }> = {
  PENDING: { ar: "قيد الانتظار", en: "Pending" },
  CONFIRMED: { ar: "مؤكد", en: "Confirmed" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
  COMPLETED: { ar: "مكتمل", en: "Completed" },
};

export default function AppointmentsPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [linkValue, setLinkValue] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/appointments");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAppointments(data);
    } catch {
      toast.error(isRtl ? "تعذّر تحميل المواعيد، حاول مرة أخرى" : "Couldn't load appointments, please try again");
    } finally {
      setLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      await fetchAppointments();
      toast.success(isRtl ? "تم تحديث حالة الموعد بنجاح ✓" : "Appointment status updated ✓");
    } catch {
      toast.error(isRtl ? "تعذّر تحديث الحالة، حاول مرة أخرى" : "Couldn't update status, please try again");
    } finally {
      setActionLoading(null);
    }
  };

  const saveMeetingLink = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, meetingLink: linkValue }),
      });
      if (!res.ok) throw new Error();
      await fetchAppointments();
      setEditingLink(null);
      toast.success(isRtl ? "تم حفظ رابط الاجتماع ✓" : "Meeting link saved ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حفظ الرابط" : "Couldn't save meeting link");
    } finally {
      setActionLoading(null);
    }
  };

  const saveNotes = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: notesValue }),
      });
      if (!res.ok) throw new Error();
      await fetchAppointments();
      setEditingNotes(null);
      toast.success(isRtl ? "تم حفظ الملاحظات بنجاح ✓" : "Notes saved successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حفظ الملاحظات" : "Couldn't save notes");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAppointment = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      await fetchAppointments();
      toast.success(isRtl ? "تم حذف الموعد بنجاح ✓" : "Appointment deleted successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حذف الموعد" : "Couldn't delete appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter !== "ALL" && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const studentName = (a.student.name ?? "").toLowerCase();
      const teacherName = (a.teacher.name ?? "").toLowerCase();
      if (!studentName.includes(q) && !teacherName.includes(q)) return false;
    }
    return true;
  });

  /* Dates that have at least one appointment (for calendar dot indicators) */
  const appointmentDatesMap = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of filtered) {
      const key = apt.slotDate.slice(0, 10); // yyyy-mm-dd
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [filtered]);

  /* Appointments for the selected calendar day */
  const selectedDayAppointments = useMemo(() => {
    return filtered
      .filter((a) => isSameDay(parseISO(a.slotDate), selectedDate))
      .sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }, [filtered, selectedDate]);

  /* Dates that have appointments (for calendar highlighting) */
  const datesWithAppointments = useMemo(() => {
    return [...appointmentDatesMap.keys()].map((d) => parseISO(d));
  }, [appointmentDatesMap]);

  const totalCount = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  const canAct = role === "ADMIN" || role === "TEACHER";

  /* Renders action buttons + inline editing for a single appointment card */
  const renderAppointmentCard = (apt: Appointment) => {
    const aptDate = parseISO(apt.slotDate);
    const isUpcoming = aptDate >= startOfDay(new Date());
    const isLoading = actionLoading === apt.id;
    const dateLocale = isRtl ? "ar-SA" : "en-US";

    return (
      <div
        key={apt.id}
        className={`rounded-xl border p-4 transition-all hover:shadow-md ${
          isUpcoming ? "bg-white" : "bg-gray-50 opacity-70"
        }`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 h-2.5 w-2.5 rounded-full ${statusDotColors[apt.status]}`} />
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[apt.status]}`}
            >
              {isRtl ? statusLabels[apt.status].ar : statusLabels[apt.status].en}
            </span>
          </div>
          <span className="font-mono text-sm font-bold text-primary shrink-0 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {apt.slotTime}
          </span>
        </div>

        {/* People */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium truncate">{apt.student.name}</span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              {apt.student.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-brand-secondary shrink-0" />
            <span className="font-medium truncate">{apt.teacher.name}</span>
          </div>
        </div>

        {/* Date (useful in table mode cards) */}
        {viewMode === "table" && (
          <p className="text-xs text-muted-foreground mb-2">
            {aptDate.toLocaleDateString(dateLocale, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        {/* Amount */}
        {apt.amountPaid && (
          <p className="text-sm font-bold text-primary mb-2">
            {apt.amountPaid} {apt.currency}
          </p>
        )}

        {/* Meeting link */}
        {apt.status === "CONFIRMED" && canAct && (
          <div className="mb-2">
            {editingLink === apt.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  placeholder="https://..."
                  className="h-7 text-xs flex-1"
                />
                <Button
                  size="sm"
                  className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600"
                  onClick={() => saveMeetingLink(apt.id)}
                  disabled={isLoading}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => setEditingLink(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                className="flex items-center gap-1 text-xs text-brand-secondary hover:underline"
                onClick={() => {
                  setEditingLink(apt.id);
                  setLinkValue(apt.meetingLink ?? "");
                }}
              >
                <Link className="h-3 w-3" />
                {apt.meetingLink
                  ? isRtl
                    ? "تعديل الرابط"
                    : "Edit link"
                  : isRtl
                    ? "إضافة رابط"
                    : "Add link"}
              </button>
            )}
          </div>
        )}

        {/* Notes */}
        {canAct && (
          <div className="mb-2">
            {editingNotes === apt.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder={isRtl ? "ملاحظات..." : "Notes..."}
                  className="h-7 text-xs flex-1"
                />
                <Button
                  size="sm"
                  className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600"
                  onClick={() => saveNotes(apt.id)}
                  disabled={isLoading}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => setEditingNotes(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setEditingNotes(apt.id);
                  setNotesValue(apt.notes ?? "");
                }}
              >
                <Pencil className="h-3 w-3" />
                {apt.notes
                  ? apt.notes.slice(0, 40) + (apt.notes.length > 40 ? "..." : "")
                  : isRtl
                    ? "إضافة ملاحظة"
                    : "Add note"}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        {canAct && (
          <div className="flex items-center gap-1.5 pt-2 border-t mt-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {apt.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 px-2.5 bg-green-500 hover:bg-green-600 text-white text-xs"
                      onClick={() => updateStatus(apt.id, "CONFIRMED")}
                    >
                      <Check className="h-3 w-3 me-1" />
                      {isRtl ? "تأكيد" : "Confirm"}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs"
                      onClick={() => updateStatus(apt.id, "CANCELLED")}
                    >
                      <X className="h-3 w-3 me-1" />
                      {isRtl ? "إلغاء" : "Cancel"}
                    </Button>
                  </>
                )}
                {apt.status === "CONFIRMED" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 px-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                      onClick={() => updateStatus(apt.id, "COMPLETED")}
                    >
                      <CheckCircle className="h-3 w-3 me-1" />
                      {isRtl ? "إكمال" : "Complete"}
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2.5 bg-red-500 hover:bg-red-600 text-white text-xs"
                      onClick={() => updateStatus(apt.id, "CANCELLED")}
                    >
                      <X className="h-3 w-3 me-1" />
                      {isRtl ? "إلغاء" : "Cancel"}
                    </Button>
                  </>
                )}
                {role === "ADMIN" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 hover:text-red-600 hover:border-red-300 ms-auto"
                    onClick={() => deleteAppointment(apt.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-display font-semibold">{isRtl ? "المواعيد" : "Appointments"}</h1>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/40">
          <Button
            size="sm"
            variant={viewMode === "calendar" ? "default" : "ghost"}
            className={`h-8 px-3 text-xs gap-1.5 ${
              viewMode === "calendar"
                ? "bg-primary text-white hover:bg-primary/90"
                : ""
            }`}
            onClick={() => setViewMode("calendar")}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {isRtl ? "تقويم" : "Calendar"}
          </Button>
          <Button
            size="sm"
            variant={viewMode === "table" ? "default" : "ghost"}
            className={`h-8 px-3 text-xs gap-1.5 ${
              viewMode === "table"
                ? "bg-primary text-white hover:bg-primary/90"
                : ""
            }`}
            onClick={() => setViewMode("table")}
          >
            <List className="h-3.5 w-3.5" />
            {isRtl ? "قائمة" : "List"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-accent/50 border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-primary">{totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "إجمالي المواعيد" : "Total"}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-primary">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "قيد الانتظار" : "Pending"}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-tertiary">{confirmedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "مؤكد" : "Confirmed"}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-brand-secondary">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "مكتمل" : "Completed"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs defaultValue="ALL" onValueChange={setFilter} className="flex-1">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="ALL">{isRtl ? "الكل" : "All"}</TabsTrigger>
            <TabsTrigger value="PENDING">{isRtl ? "قيد الانتظار" : "Pending"}</TabsTrigger>
            <TabsTrigger value="CONFIRMED">{isRtl ? "مؤكد" : "Confirmed"}</TabsTrigger>
            <TabsTrigger value="CANCELLED">{isRtl ? "ملغي" : "Cancelled"}</TabsTrigger>
            <TabsTrigger value="COMPLETED">{isRtl ? "مكتمل" : "Completed"}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRtl ? "بحث بالاسم..." : "Search by name..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* ═══════════════ CALENDAR VIEW ═══════════════ */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
          {/* Calendar */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2 sm:p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                locale={isRtl ? arLocale : enUS}
                dir={isRtl ? "rtl" : "ltr"}
                modifiers={{
                  hasAppointment: datesWithAppointments,
                }}
                modifiersClassNames={{
                  hasAppointment: "calendar-has-appointment",
                }}
                className="rounded-2xl border border-[#e4b5ff]/30 shadow-lg bg-white p-4 w-full [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(11)]"
              />
            </CardContent>
          </Card>

          {/* Day detail panel */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">
                {format(selectedDate, "EEEE، d MMMM yyyy", {
                  locale: isRtl ? arLocale : enUS,
                })}
              </h2>
              <span className="ms-auto text-sm text-muted-foreground">
                {selectedDayAppointments.length}{" "}
                {isRtl ? "مواعيد" : selectedDayAppointments.length === 1 ? "appointment" : "appointments"}
              </span>
            </div>

            {selectedDayAppointments.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="py-16 text-center">
                  <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="font-medium text-muted-foreground">
                    {isRtl ? "لا توجد مواعيد في هذا اليوم" : "No appointments on this day"}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {isRtl ? "اختر يوماً آخر من التقويم" : "Select another day from the calendar"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedDayAppointments.map(renderAppointmentCard)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ TABLE / LIST VIEW ═══════════════ */}
      {viewMode === "table" && (
        <>
          {/* Desktop table */}
          <Card className="hidden lg:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent/50 hover:bg-accent/50">
                    <TableHead className="font-bold text-primary">{isRtl ? "الطالب" : "Student"}</TableHead>
                    <TableHead className="font-bold text-primary">{isRtl ? "المدرب" : "Teacher"}</TableHead>
                    <TableHead className="font-bold text-primary">{isRtl ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className="font-bold text-primary">{isRtl ? "الوقت" : "Time"}</TableHead>
                    <TableHead className="font-bold text-primary">{isRtl ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="font-bold text-primary">{isRtl ? "المبلغ" : "Amount"}</TableHead>
                    {canAct && (
                      <TableHead className="font-bold text-primary">{isRtl ? "الإجراءات" : "Actions"}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((apt) => {
                    const aptDate = new Date(apt.slotDate);
                    const isUpcoming = aptDate >= new Date(new Date().setHours(0, 0, 0, 0));
                    const dateLocale = isRtl ? "ar-SA" : "en-US";
                    const isLoading = actionLoading === apt.id;

                    return (
                      <TableRow key={apt.id} className={isUpcoming ? "" : "opacity-60"}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{apt.student.name}</p>
                            <p className="text-xs text-muted-foreground">{apt.student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{apt.teacher.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {aptDate.toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric" })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {aptDate.toLocaleDateString(dateLocale, { year: "numeric" })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold">{apt.slotTime}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[apt.status]}`}>
                            {isRtl ? statusLabels[apt.status].ar : statusLabels[apt.status].en}
                          </span>
                          {apt.status === "CONFIRMED" && canAct && (
                            <div className="mt-1">
                              {editingLink === apt.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={linkValue}
                                    onChange={(e) => setLinkValue(e.target.value)}
                                    placeholder="https://..."
                                    className="h-6 text-xs w-40"
                                  />
                                  <Button size="sm" className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600" onClick={() => saveMeetingLink(apt.id)} disabled={isLoading}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setEditingLink(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="flex items-center gap-1 text-xs text-brand-secondary hover:underline mt-0.5"
                                  onClick={() => { setEditingLink(apt.id); setLinkValue(apt.meetingLink ?? ""); }}
                                >
                                  <Link className="h-3 w-3" />
                                  {apt.meetingLink ? (isRtl ? "تعديل الرابط" : "Edit link") : (isRtl ? "إضافة رابط" : "Add link")}
                                </button>
                              )}
                            </div>
                          )}
                          {canAct && (
                            <div className="mt-1">
                              {editingNotes === apt.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    value={notesValue}
                                    onChange={(e) => setNotesValue(e.target.value)}
                                    placeholder={isRtl ? "ملاحظات..." : "Notes..."}
                                    className="h-6 text-xs w-40"
                                  />
                                  <Button size="sm" className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600" onClick={() => saveNotes(apt.id)} disabled={isLoading}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setEditingNotes(null)}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-0.5"
                                  onClick={() => { setEditingNotes(apt.id); setNotesValue(apt.notes ?? ""); }}
                                >
                                  <Pencil className="h-3 w-3" />
                                  {apt.notes ? apt.notes.slice(0, 30) + (apt.notes.length > 30 ? "..." : "") : (isRtl ? "إضافة ملاحظة" : "Add note")}
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {apt.amountPaid ? (
                            <span className="font-bold text-primary">{apt.amountPaid} {apt.currency}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        {canAct && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  {apt.status === "PENDING" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="h-7 px-2 bg-green-500 hover:bg-green-600 text-white text-xs"
                                        onClick={() => updateStatus(apt.id, "CONFIRMED")}
                                      >
                                        <Check className="h-3 w-3 me-1" />
                                        {isRtl ? "تأكيد" : "Confirm"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-7 px-2 bg-red-500 hover:bg-red-600 text-white text-xs"
                                        onClick={() => updateStatus(apt.id, "CANCELLED")}
                                      >
                                        <X className="h-3 w-3 me-1" />
                                        {isRtl ? "إلغاء" : "Cancel"}
                                      </Button>
                                    </>
                                  )}
                                  {apt.status === "CONFIRMED" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white text-xs"
                                        onClick={() => updateStatus(apt.id, "COMPLETED")}
                                      >
                                        <CheckCircle className="h-3 w-3 me-1" />
                                        {isRtl ? "إكمال" : "Complete"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-7 px-2 bg-red-500 hover:bg-red-600 text-white text-xs"
                                        onClick={() => updateStatus(apt.id, "CANCELLED")}
                                      >
                                        <X className="h-3 w-3 me-1" />
                                        {isRtl ? "إلغاء" : "Cancel"}
                                      </Button>
                                    </>
                                  )}
                                  {role === "ADMIN" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 w-7 p-0 hover:text-red-600 hover:border-red-300"
                                      onClick={() => deleteAppointment(apt.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canAct ? 7 : 6} className="text-center text-muted-foreground py-16">
                        <div className="flex flex-col items-center gap-2">
                          <p className="font-medium">{isRtl ? "لا توجد مواعيد" : "No appointments found"}</p>
                          <p className="text-sm">{isRtl ? "جرّب تغيير الفلتر أو البحث" : "Try changing the filter or search"}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile card list */}
          <div className="lg:hidden space-y-3">
            {filtered.length === 0 ? (
              <Card className="border border-dashed">
                <CardContent className="py-16 text-center">
                  <p className="font-medium text-muted-foreground">
                    {isRtl ? "لا توجد مواعيد" : "No appointments found"}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    {isRtl ? "جرّب تغيير الفلتر أو البحث" : "Try changing the filter or search"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filtered.map(renderAppointmentCard)
            )}
          </div>
        </>
      )}
    </div>
  );
}
