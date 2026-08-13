"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, Upload, User, Lock, X } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

export default function ProfilePage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setImage(data.image || "");
        setLoading(false);
      })
      .catch(() => {
        toast.error(isRtl ? "تعذّر تحميل الملف الشخصي" : "Couldn't load profile");
        setLoading(false);
      });
  }, [isRtl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setImage(url);
      toast.success(isRtl ? "تم رفع صورة الملف الشخصي ✓" : "Profile image uploaded ✓");
    } catch {
      toast.error(isRtl ? "تعذّر رفع الصورة" : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: image || null }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProfile(updated);
      await updateSession({ name: updated.name });
      toast.success(isRtl ? "تم حفظ الملف الشخصي بنجاح ✓" : "Profile saved successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حفظ الملف الشخصي" : "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error(isRtl ? "يرجى ملء جميع حقول كلمة المرور" : "Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(isRtl ? "كلمة المرور الجديدة غير متطابقة" : "New passwords don't match");
      return;
    }
    if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error(isRtl
        ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم"
        : "Password must be 8+ chars with uppercase, lowercase and a number");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(isRtl ? "تم تغيير كلمة المرور بنجاح ✓" : "Password changed successfully ✓");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isRtl ? "تعذّر تغيير كلمة المرور" : "Couldn't change password"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isRtl ? "الملف الشخصي" : "Profile"}</h1>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isRtl ? "المعلومات الشخصية" : "Personal Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {image ? (
              <div className="relative">
                <img src={image} alt="" className="h-24 w-24 rounded-full object-cover border-2 border-primary/20" />
                <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => setImage("")}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                {profile?.name?.charAt(0) ?? "?"}
              </div>
            )}
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : <Upload className="h-3 w-3 me-1" />}
                {isRtl ? "رفع صورة" : "Upload Photo"}
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {profile?.role === "ADMIN" ? (isRtl ? "مدير" : "Admin") : profile?.role === "TEACHER" ? (isRtl ? "مدرب" : "Teacher") : (isRtl ? "طالب" : "Student")}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Name & Email */}
          <div className="space-y-4">
            <div>
              <Label>{isRtl ? "الاسم" : "Name"}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>{isRtl ? "البريد الإلكتروني" : "Email"}</Label>
              <Input value={profile?.email ?? ""} disabled className="mt-1 opacity-60" dir="ltr" />
              <p className="text-xs text-muted-foreground mt-1">
                {isRtl ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
              </p>
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="signature-gradient text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
            {isRtl ? "حفظ" : "Save"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {isRtl ? "تغيير كلمة المرور" : "Change Password"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{isRtl ? "كلمة المرور الحالية" : "Current Password"}</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" dir="ltr" />
          </div>
          <div>
            <Label>{isRtl ? "كلمة المرور الجديدة" : "New Password"}</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" dir="ltr" />
          </div>
          <div>
            <Label>{isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" dir="ltr" />
          </div>
          <Button onClick={handleChangePassword} disabled={saving} variant="outline">
            {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Lock className="h-4 w-4 me-2" />}
            {isRtl ? "تغيير كلمة المرور" : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
