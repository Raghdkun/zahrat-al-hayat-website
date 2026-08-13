"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { Loader2, Save, Upload, Trash2 } from "lucide-react";

interface Settings {
  logoUrl: string | null;
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
}

export default function SettingsPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [settings, setSettings] = useState<Settings>({
    logoUrl: null,
    facebookUrl: "",
    instagramUrl: "",
    whatsappNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          logoUrl: data.logoUrl ?? null,
          facebookUrl: data.facebookUrl ?? "",
          instagramUrl: data.instagramUrl ?? "",
          whatsappNumber: data.whatsappNumber ?? "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setSettings((prev) => ({ ...prev, logoUrl: url }));
      toast.success(isRtl ? "تم رفع الشعار بنجاح ✓" : "Logo uploaded successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر رفع الشعار، حاول مرة أخرى" : "Logo upload failed, please try again");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم حفظ الإعدادات بنجاح ✓" : "Settings saved successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حفظ الإعدادات، حاول مرة أخرى" : "Couldn't save settings, please try again");
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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold mb-6">إعدادات الموقع</h1>

      <div className="space-y-6">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الشعار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.logoUrl && (
              <div className="flex items-center gap-4">
                <Image
                  src={settings.logoUrl}
                  alt="Logo"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 object-contain rounded-lg border bg-white p-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings((prev) => ({ ...prev, logoUrl: null }))}
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  إزالة
                </Button>
              </div>
            )}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-1" />
                ) : (
                  <Upload className="h-4 w-4 ml-1" />
                )}
                رفع شعار جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">التواصل الاجتماعي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>رابط فيسبوك</Label>
              <Input
                value={settings.facebookUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings((prev) => ({ ...prev, facebookUrl: e.target.value }))
                }
                placeholder="https://facebook.com/..."
                className="mt-1"
                dir="ltr"
              />
            </div>
            <div>
              <Label>رابط انستغرام</Label>
              <Input
                value={settings.instagramUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings((prev) => ({ ...prev, instagramUrl: e.target.value }))
                }
                placeholder="https://instagram.com/..."
                className="mt-1"
                dir="ltr"
              />
            </div>
            <div>
              <Label>رقم واتساب</Label>
              <Input
                value={settings.whatsappNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                }
                placeholder="+963..."
                className="mt-1"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="signature-gradient text-white w-full"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}
