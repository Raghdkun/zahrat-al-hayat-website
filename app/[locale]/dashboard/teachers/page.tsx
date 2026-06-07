"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Save,
  Upload,
  Trash2,
  X,
  Edit2,
  UserPlus,
  Clock,
  DollarSign,
  Mail,
} from "lucide-react";

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface Teacher {
  id: string;
  userId: string;
  bioAr: string;
  bioEn: string;
  specialties: string[];
  avatarUrl: string | null;
  hourlyRate: number;
  currency: string;
  isActive: boolean;
  user: { name: string; email: string; image: string | null };
  availability: (AvailabilitySlot & { id: string; isActive: boolean })[];
}

interface TeacherForm {
  name: string;
  email: string;
  password: string;
  bioAr: string;
  bioEn: string;
  specialties: string;
  avatarUrl: string;
  hourlyRate: string;
  currency: string;
  availability: AvailabilitySlot[];
}

const emptyForm: TeacherForm = {
  name: "",
  email: "",
  password: "",
  bioAr: "",
  bioEn: "",
  specialties: "",
  avatarUrl: "",
  hourlyRate: "0",
  currency: "USD",
  availability: [],
};

const dayNamesAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeachersPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dayNames = isRtl ? dayNamesAr : dayNamesEn;

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      const data = await res.json();
      setTeachers(data);
    } catch {
      toast.error(isRtl ? "تعذّر تحميل المدربين، حاول مرة أخرى" : "Couldn't load teachers, please try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (t: Teacher) => {
    setEditingId(t.id);
    setForm({
      name: t.user.name,
      email: t.user.email,
      password: "",
      bioAr: t.bioAr,
      bioEn: t.bioEn,
      specialties: t.specialties.join(", "),
      avatarUrl: t.avatarUrl ?? "",
      hourlyRate: String(t.hourlyRate),
      currency: t.currency,
      availability: t.availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        slotDuration: a.slotDuration ?? 60,
      })),
    });
    setShowForm(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setForm((f) => ({ ...f, avatarUrl: url }));
      toast.success(isRtl ? "تم رفع صورة المدرب ✓" : "Teacher image uploaded ✓");
    } catch {
      toast.error(isRtl ? "تعذّر رفع الصورة" : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addAvailability = () => {
    setForm((f) => ({
      ...f,
      availability: [...f.availability, { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", slotDuration: 60 }],
    }));
  };

  const removeAvailability = (idx: number) => {
    setForm((f) => ({ ...f, availability: f.availability.filter((_, i) => i !== idx) }));
  };

  const updateAvailability = (idx: number, field: keyof AvailabilitySlot, value: string | number) => {
    setForm((f) => ({
      ...f,
      availability: f.availability.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error(isRtl ? "الاسم والبريد مطلوبان" : "Name and email are required");
      return;
    }
    if (!editingId && !form.password) {
      toast.error(isRtl ? "كلمة المرور مطلوبة" : "Password is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editingId && { id: editingId }),
        name: form.name,
        email: form.email,
        ...(form.password && { password: form.password }),
        bioAr: form.bioAr,
        bioEn: form.bioEn,
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        avatarUrl: form.avatarUrl || null,
        hourlyRate: parseFloat(form.hourlyRate) || 0,
        currency: form.currency,
        availability: form.availability,
      };
      const res = await fetch("/api/teachers", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success(isRtl ? "تم حفظ بيانات المدرب بنجاح ✓" : "Teacher saved successfully ✓");
      setShowForm(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isRtl ? "تعذّر حفظ بيانات المدرب" : "Couldn't save teacher"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch("/api/teachers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم إلغاء تنشيط المدرب ✓" : "Teacher deactivated ✓");
      fetchTeachers();
    } catch {
      toast.error(isRtl ? "تعذّر تحديث حالة المدرب" : "Couldn't update teacher status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#4e0078]" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isRtl ? "المدربون" : "Teachers"} ({teachers.length})
        </h1>
        <Button onClick={openCreate} className="signature-gradient text-white">
          <UserPlus className="h-4 w-4 me-2" />
          {isRtl ? "إضافة مدرب" : "Add Teacher"}
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="mb-6 border-[#4e0078]/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {editingId ? (isRtl ? "تعديل المدرب" : "Edit Teacher") : (isRtl ? "إضافة مدرب جديد" : "Add New Teacher")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {form.avatarUrl ? (
                <div className="relative">
                  <img src={form.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-[#4e0078]/20" />
                  <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => setForm((f) => ({ ...f, avatarUrl: "" }))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#faf0ff] flex items-center justify-center border-2 border-dashed border-[#4e0078]/30">
                  <UserPlus className="h-8 w-8 text-[#4e0078]/40" />
                </div>
              )}
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : <Upload className="h-3 w-3 me-1" />}
                  {isRtl ? "رفع صورة" : "Upload Photo"}
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "الاسم" : "Name"} *</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>{isRtl ? "البريد الإلكتروني" : "Email"} *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1" dir="ltr" />
              </div>
              {!editingId && (
                <div>
                  <Label>{isRtl ? "كلمة المرور" : "Password"} *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="mt-1" dir="ltr" />
                </div>
              )}
              <div>
                <Label>{isRtl ? "التخصصات (مفصولة بفاصلة)" : "Specialties (comma separated)"}</Label>
                <Input value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {/* Bio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "نبذة بالعربية" : "Bio (Arabic)"}</Label>
                <Textarea value={form.bioAr} onChange={(e) => setForm((f) => ({ ...f, bioAr: e.target.value }))} className="mt-1" rows={3} dir="rtl" />
              </div>
              <div>
                <Label>{isRtl ? "نبذة بالإنجليزية" : "Bio (English)"}</Label>
                <Textarea value={form.bioEn} onChange={(e) => setForm((f) => ({ ...f, bioEn: e.target.value }))} className="mt-1" rows={3} dir="ltr" />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "السعر بالساعة" : "Hourly Rate"}</Label>
                <Input type="number" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} className="mt-1" dir="ltr" />
              </div>
              <div>
                <Label>{isRtl ? "العملة" : "Currency"}</Label>
                <Input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="mt-1" dir="ltr" />
              </div>
            </div>

            {/* Availability */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-bold">{isRtl ? "أوقات العمل" : "Availability"}</Label>
                <Button variant="outline" size="sm" onClick={addAvailability}>
                  <Plus className="h-3 w-3 me-1" />
                  {isRtl ? "إضافة وقت" : "Add Slot"}
                </Button>
              </div>
              <div className="space-y-3">
                {form.availability.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#faf0ff] rounded-lg">
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateAvailability(idx, "dayOfWeek", parseInt(e.target.value))}
                      className="border rounded px-2 py-1.5 text-sm bg-white"
                    >
                      {dayNames.map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateAvailability(idx, "startTime", e.target.value)}
                      className="w-28"
                      dir="ltr"
                    />
                    <span className="text-muted-foreground">→</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateAvailability(idx, "endTime", e.target.value)}
                      className="w-28"
                      dir="ltr"
                    />
                    <Input
                      type="number"
                      value={slot.slotDuration}
                      onChange={(e) => updateAvailability(idx, "slotDuration", parseInt(e.target.value) || 60)}
                      className="w-20"
                      dir="ltr"
                      placeholder="min"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeAvailability(idx)}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
                {form.availability.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {isRtl ? "لم يتم إضافة أوقات عمل" : "No availability slots added"}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="signature-gradient text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRtl ? "حفظ" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className={`transition-all hover:shadow-md ${!teacher.isActive ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {teacher.avatarUrl ? (
                  <img src={teacher.avatarUrl} alt={teacher.user.name} className="h-12 w-12 rounded-full object-cover border-2 border-[#4e0078]/20" />
                ) : (
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#4e0078] text-white text-lg">
                      {teacher.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{teacher.user.name}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    {teacher.user.email}
                  </p>
                </div>
                <Badge variant={teacher.isActive ? "default" : "secondary"} className="shrink-0">
                  {teacher.isActive ? (isRtl ? "نشط" : "Active") : (isRtl ? "غير نشط" : "Inactive")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {(isRtl ? teacher.bioAr : teacher.bioEn) && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {isRtl ? teacher.bioAr : teacher.bioEn}
                </p>
              )}
              {teacher.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {teacher.specialties.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-[#faf0ff]">{s}</Badge>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign className="h-3.5 w-3.5 text-[#4e0078]" />
                  <span className="font-bold text-[#4e0078]">{teacher.hourlyRate} {teacher.currency}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{teacher.availability.length} {isRtl ? "أوقات" : "slots"}</span>
                </div>
              </div>
              {teacher.availability.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {teacher.availability.map((av, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {dayNames[av.dayOfWeek]} {av.startTime}-{av.endTime}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(teacher)}>
                  <Edit2 className="h-3 w-3 me-1" />
                  {isRtl ? "تعديل" : "Edit"}
                </Button>
                {teacher.isActive && (
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDeactivate(teacher.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {teachers.length === 0 && (
          <div className="col-span-3 text-center py-16">
            <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-muted-foreground">
              {isRtl ? "لا يوجد مدربون بعد" : "No teachers yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isRtl ? "أضف أول مدرب باستخدام الزر أعلاه" : "Add your first teacher using the button above"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
