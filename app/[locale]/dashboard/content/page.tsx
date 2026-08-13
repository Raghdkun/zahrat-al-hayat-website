"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { Plus, Trash2, Save, Loader2, Upload, ChevronUp, ChevronDown, FileText, X } from "lucide-react";

const SECTIONS = ["hero", "about", "services", "founder", "footer"] as const;
type Section = (typeof SECTIONS)[number];

const SECTION_LABELS: Record<Section, { ar: string; en: string }> = {
  hero: { ar: "الرئيسية", en: "Hero" },
  about: { ar: "عن المركز", en: "About" },
  services: { ar: "الخدمات", en: "Services" },
  founder: { ar: "المؤسسة", en: "Founder" },
  footer: { ar: "الفوتر", en: "Footer" },
};

function ImageUploader({
  imageUrl,
  onUpload,
  onRemove,
  isRtl,
}: {
  imageUrl: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  isRtl: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      onUpload(url);
      toast.success(isRtl ? "تم رفع الصورة بنجاح ✓" : "Image uploaded successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر رفع الصورة، حاول مرة أخرى" : "Image upload failed, please try again");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{isRtl ? "الصورة" : "Image"}</Label>
      {imageUrl && (
        <div className="flex items-center gap-3">
          <img src={imageUrl} alt="" className="h-16 w-24 object-cover rounded border" />
          <Button variant="outline" size="sm" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
            <span className={isRtl ? "mr-1" : "ml-1"}>{isRtl ? "إزالة" : "Remove"}</span>
          </Button>
        </div>
      )}
      <div>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          <span className={isRtl ? "mr-1" : "ml-1"}>{isRtl ? "رفع صورة" : "Upload image"}</span>
        </Button>
      </div>
    </div>
  );
}

interface ContentBlock {
  id: string;
  key: string;
  valueAr: string;
  valueEn: string;
  imageUrl: string | null;
  section: string;
  sortOrder: number;
  updatedAt: string;
}

interface NewBlockForm {
  key: string;
  section: Section;
  valueAr: string;
  valueEn: string;
  imageUrl: string;
}

export default function ContentPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newBlock, setNewBlock] = useState<NewBlockForm>({
    key: "",
    section: "hero",
    valueAr: "",
    valueEn: "",
    imageUrl: "",
  });

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setBlocks(data);
    } catch {
      toast.error(isRtl ? "تعذّر تحميل المحتوى" : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const handleCreate = async () => {
    if (!newBlock.key.trim()) {
      toast.error(isRtl ? "المفتاح مطلوب" : "Key is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newBlock.key.trim(),
          section: newBlock.section,
          valueAr: newBlock.valueAr,
          valueEn: newBlock.valueEn,
          imageUrl: newBlock.imageUrl || null,
          sortOrder: blocks.filter((b) => b.section === newBlock.section).length,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم إنشاء الكتلة بنجاح ✓" : "Block created successfully ✓");
      setNewBlock({ key: "", section: "hero", valueAr: "", valueEn: "", imageUrl: "" });
      setShowNewForm(false);
      await fetchBlocks();
    } catch {
      toast.error(isRtl ? "تعذّر إنشاء الكتلة" : "Failed to create block");
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (block: ContentBlock) => {
    setSaving(block.id);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: block.id,
          valueAr: block.valueAr,
          valueEn: block.valueEn,
          imageUrl: block.imageUrl,
          sortOrder: block.sortOrder,
          section: block.section,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم حفظ المحتوى بنجاح ✓" : "Content saved successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر حفظ المحتوى، حاول مرة أخرى" : "Couldn't save content, please try again");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم حذف الكتلة بنجاح ✓" : "Block deleted successfully ✓");
      setConfirmDeleteId(null);
      await fetchBlocks();
    } catch {
      toast.error(isRtl ? "تعذّر حذف الكتلة" : "Failed to delete block");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReorder = async (block: ContentBlock, direction: "up" | "down") => {
    const sectionBlocks = blocks
      .filter((b) => b.section === block.section)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sectionBlocks.findIndex((b) => b.id === block.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sectionBlocks.length) return;

    const current = sectionBlocks[idx];
    const swap = sectionBlocks[swapIdx];
    const tempOrder = current.sortOrder;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === current.id) return { ...b, sortOrder: swap.sortOrder };
        if (b.id === swap.id) return { ...b, sortOrder: tempOrder };
        return b;
      })
    );

    try {
      await Promise.all([
        fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: current.id, sortOrder: swap.sortOrder }),
        }),
        fetch("/api/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: swap.id, sortOrder: tempOrder }),
        }),
      ]);
      toast.success(isRtl ? "تم تغيير الترتيب ✓" : "Order updated ✓");
    } catch {
      toast.error(isRtl ? "تعذّر تغيير الترتيب" : "Failed to update order");
      await fetchBlocks();
    }
  };

  const updateBlock = (id: string, field: keyof ContentBlock, value: string | number) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const sectionBlockCount = (section: string) => blocks.filter((b) => b.section === section).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">{isRtl ? "إدارة المحتوى" : "Content Management"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRtl ? "تحكم بجميع نصوص وصور الموقع" : "Manage all website text and images"}
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="signature-gradient text-white"
        >
          {showNewForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className={isRtl ? "mr-2" : "ml-2"}>
            {showNewForm
              ? isRtl ? "إلغاء" : "Cancel"
              : isRtl ? "إضافة كتلة جديدة" : "Add New Block"}
          </span>
        </Button>
      </div>

      {/* New Block Form */}
      {showNewForm && (
        <Card className="mb-6 border-dashed border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              <FileText className="h-4 w-4 inline-block" />
              <span className={isRtl ? "mr-2" : "ml-2"}>
                {isRtl ? "كتلة محتوى جديدة" : "New Content Block"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "المفتاح (Key)" : "Key"}</Label>
                <Input
                  value={newBlock.key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewBlock((p) => ({ ...p, key: e.target.value }))
                  }
                  placeholder={isRtl ? "مثال: hero_title" : "e.g. hero_title"}
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>{isRtl ? "القسم" : "Section"}</Label>
                <select
                  value={newBlock.section}
                  onChange={(e) => setNewBlock((p) => ({ ...p, section: e.target.value as Section }))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {SECTION_LABELS[s].ar} / {SECTION_LABELS[s].en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "النص العربي" : "Arabic Text"}</Label>
                <Textarea
                  value={newBlock.valueAr}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewBlock((p) => ({ ...p, valueAr: e.target.value }))
                  }
                  className="mt-1"
                  rows={2}
                  dir="rtl"
                />
              </div>
              <div>
                <Label>{isRtl ? "النص الإنجليزي" : "English Text"}</Label>
                <Textarea
                  value={newBlock.valueEn}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewBlock((p) => ({ ...p, valueEn: e.target.value }))
                  }
                  className="mt-1"
                  rows={2}
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <Label>{isRtl ? "رابط الصورة (اختياري)" : "Image URL (optional)"}</Label>
              <Input
                value={newBlock.imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewBlock((p) => ({ ...p, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="mt-1"
                dir="ltr"
              />
            </div>
            <Button onClick={handleCreate} disabled={creating} className="signature-gradient text-white">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className={isRtl ? "mr-2" : "ml-2"}>
                {isRtl ? "إنشاء" : "Create"}
              </span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="hero">
        <TabsList className="mb-6 flex-wrap">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s} value={s} className="gap-1">
              <span>{SECTION_LABELS[s].ar}</span>
              <span className="text-muted-foreground">/</span>
              <span>{SECTION_LABELS[s].en}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {sectionBlockCount(s)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => {
          const sectionBlocks = blocks
            .filter((b) => b.section === section)
            .sort((a, b) => a.sortOrder - b.sortOrder);

          return (
            <TabsContent key={section} value={section}>
              {sectionBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-3 opacity-30" />
                  <p>{isRtl ? "لا توجد كتل محتوى في هذا القسم" : "No content blocks in this section"}</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {sectionBlocks.map((block, idx) => (
                    <Card key={block.id} className="relative">
                      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {block.key}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {isRtl ? "ترتيب:" : "Order:"} {block.sortOrder}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={idx === 0}
                            onClick={() => handleReorder(block, "up")}
                            title={isRtl ? "تحريك لأعلى" : "Move up"}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={idx === sectionBlocks.length - 1}
                            onClick={() => handleReorder(block, "down")}
                            title={isRtl ? "تحريك لأسفل" : "Move down"}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>{isRtl ? "النص العربي" : "Arabic Text"}</Label>
                            {block.valueAr.length > 100 ? (
                              <Textarea
                                value={block.valueAr}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  updateBlock(block.id, "valueAr", e.target.value)
                                }
                                className="mt-1"
                                rows={3}
                                dir="rtl"
                              />
                            ) : (
                              <Input
                                value={block.valueAr}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateBlock(block.id, "valueAr", e.target.value)
                                }
                                className="mt-1"
                                dir="rtl"
                              />
                            )}
                          </div>
                          <div>
                            <Label>{isRtl ? "النص الإنجليزي" : "English Text"}</Label>
                            {block.valueEn.length > 100 ? (
                              <Textarea
                                value={block.valueEn}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  updateBlock(block.id, "valueEn", e.target.value)
                                }
                                className="mt-1"
                                rows={3}
                                dir="ltr"
                              />
                            ) : (
                              <Input
                                value={block.valueEn}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  updateBlock(block.id, "valueEn", e.target.value)
                                }
                                className="mt-1"
                                dir="ltr"
                              />
                            )}
                          </div>
                        </div>

                        {block.imageUrl !== null && (
                          <ImageUploader
                            imageUrl={block.imageUrl ?? ""}
                            onUpload={(url) => updateBlock(block.id, "imageUrl", url)}
                            onRemove={() => updateBlock(block.id, "imageUrl", "")}
                            isRtl={isRtl}
                          />
                        )}

                        <div className="w-32">
                          <Label>{isRtl ? "ترتيب العرض" : "Sort Order"}</Label>
                          <Input
                            type="number"
                            value={block.sortOrder}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              updateBlock(block.id, "sortOrder", parseInt(e.target.value) || 0)
                            }
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleSave(block)}
                              disabled={saving === block.id}
                              className="signature-gradient text-white"
                            >
                              {saving === block.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              <span className={isRtl ? "mr-2" : "ml-2"}>
                                {isRtl ? "حفظ" : "Save"}
                              </span>
                            </Button>

                            {confirmDeleteId === block.id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-red-600 font-medium">
                                  {isRtl ? "تأكيد الحذف؟" : "Confirm delete?"}
                                </span>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(block.id)}
                                  disabled={deletingId === block.id}
                                >
                                  {deletingId === block.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  <span className={isRtl ? "mr-1" : "ml-1"}>
                                    {isRtl ? "نعم، احذف" : "Yes, delete"}
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  {isRtl ? "إلغاء" : "Cancel"}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setConfirmDeleteId(block.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className={isRtl ? "mr-1" : "ml-1"}>
                                  {isRtl ? "حذف" : "Delete"}
                                </span>
                              </Button>
                            )}
                          </div>

                          {block.updatedAt && (
                            <span className="text-xs text-muted-foreground">
                              {isRtl ? "آخر تحديث:" : "Last updated:"}{" "}
                              {new Date(block.updatedAt).toLocaleDateString(isRtl ? "ar-SY" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
