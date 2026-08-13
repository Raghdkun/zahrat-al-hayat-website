"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { Loader2, Plus, Trash2, Eye, EyeOff, ImageIcon, Film } from "lucide-react";

interface GalleryItem {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  type: "IMAGE" | "VIDEO";
  titleAr: string;
  titleEn: string;
  sortOrder: number;
  isPublished: boolean;
}

export default function GalleryPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = () => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error(isRtl ? "تعذّر تحميل المعرض، حاول مرة أخرى" : "Couldn't load gallery, please try again");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }
      const { url, type } = await uploadRes.json();

      const createRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          type,
          titleAr: "",
          titleEn: "",
          sortOrder: items.length,
          isPublished: true,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to save item");

      toast.success(isRtl ? "تم رفع الملف بنجاح ✓" : "File uploaded successfully ✓");
      fetchItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isRtl ? "تعذّر رفع الملف، حاول مرة أخرى" : "Upload failed, please try again"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(isRtl ? "تم حذف العنصر بنجاح ✓" : "Item deleted successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حذف العنصر" : "Couldn't delete item");
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: !item.isPublished }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
      );
    } catch {
      toast.error(isRtl ? "تعذّر تحديث الحالة" : "Couldn't update status");
    }
  };

  const handleSaveTitle = async (item: GalleryItem) => {
    try {
      const res = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, titleAr: item.titleAr, titleEn: item.titleEn }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم حفظ العنوان بنجاح ✓" : "Title saved successfully ✓");
      setEditingId(null);
    } catch {
      toast.error(isRtl ? "تعذّر حفظ العنوان" : "Couldn't save title");
    }
  };

  const updateItem = (id: string, field: keyof GalleryItem, value: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">المعرض</h1>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="signature-gradient text-white"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <Plus className="h-4 w-4 ml-2" />
            )}
            رفع ملف
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4" />
            <p>لا توجد عناصر في المعرض بعد</p>
            <p className="text-sm">اضغط على &ldquo;رفع ملف&rdquo; لإضافة صور أو فيديوهات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-muted">
                {item.type === "VIDEO" ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => {
                      const v = e.target as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.titleAr || "gallery"}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={item.type === "VIDEO" ? "default" : "secondary"} className="text-xs">
                    {item.type === "VIDEO" ? (
                      <><Film className="h-3 w-3 ml-1" />فيديو</>
                    ) : (
                      <><ImageIcon className="h-3 w-3 ml-1" />صورة</>
                    )}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0"
                    onClick={() => handleTogglePublish(item)}
                  >
                    {item.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">العنوان بالعربي</Label>
                      <Input
                        value={item.titleAr}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "titleAr", e.target.value)}
                        className="h-8 text-sm"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">English Title</Label>
                      <Input
                        value={item.titleEn}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, "titleEn", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveTitle(item)}>
                        حفظ
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer hover:bg-accent rounded p-1 -m-1 transition-colors"
                    onClick={() => setEditingId(item.id)}
                  >
                    <p className="text-sm font-medium truncate">
                      {item.titleAr || <span className="text-muted-foreground italic">بدون عنوان · اضغط للتعديل</span>}
                    </p>
                    {item.titleEn && (
                      <p className="text-xs text-muted-foreground truncate">{item.titleEn}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={item.isPublished ? "default" : "secondary"} className="text-xs">
                    {item.isPublished ? "منشور" : "مخفي"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
