"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Save,
  Upload,
  Trash2,
  X,
  Edit2,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  ImageIcon,
  Link2,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  Code,
  Quote,
} from "lucide-react";

interface BlogPost {
  id: string;
  titleAr: string;
  titleEn: string;
  slugAr: string;
  slugEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string | null;
  authorName: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface PostForm {
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string;
  authorName: string;
  isPublished: boolean;
}

const emptyForm: PostForm = {
  titleAr: "",
  titleEn: "",
  excerptAr: "",
  excerptEn: "",
  contentAr: "",
  contentEn: "",
  coverImage: "",
  authorName: "",
  isPublished: false,
};

function HtmlEditor({
  value,
  onChange,
  dir,
  placeholder,
  label,
  isRtl,
}: {
  value: string;
  onChange: (val: string) => void;
  dir: "rtl" | "ltr";
  placeholder: string;
  label: string;
  isRtl: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const syncFromEditor = useCallback(() => {
    if (editorRef.current && !showSource) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, showSource]);

  useEffect(() => {
    if (editorRef.current && !showSource) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, showSource]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncFromEditor();
  };

  const handleImageInsert = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      exec("insertHTML", `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0" />`);
      toast.success(isRtl ? "تم إدراج الصورة بنجاح ✓" : "Image inserted successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر رفع الصورة" : "Image upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const insertLink = () => {
    const url = prompt(isRtl ? "أدخل الرابط:" : "Enter URL:");
    if (url) exec("createLink", url);
  };

  const toolbarButtons = [
    { icon: Bold, cmd: () => exec("bold"), title: "Bold" },
    { icon: Italic, cmd: () => exec("italic"), title: "Italic" },
    { icon: Underline, cmd: () => exec("underline"), title: "Underline" },
    null,
    { icon: Heading1, cmd: () => exec("formatBlock", "h2"), title: "Heading 1" },
    { icon: Heading2, cmd: () => exec("formatBlock", "h3"), title: "Heading 2" },
    null,
    { icon: List, cmd: () => exec("insertUnorderedList"), title: "Bullet List" },
    { icon: ListOrdered, cmd: () => exec("insertOrderedList"), title: "Numbered List" },
    null,
    { icon: AlignLeft, cmd: () => exec("justifyLeft"), title: "Align Left" },
    { icon: AlignCenter, cmd: () => exec("justifyCenter"), title: "Center" },
    null,
    { icon: Quote, cmd: () => exec("formatBlock", "blockquote"), title: "Quote" },
    { icon: Code, cmd: () => exec("formatBlock", "pre"), title: "Code" },
    { icon: Link2, cmd: insertLink, title: "Link" },
    { icon: ImageIcon, cmd: () => fileRef.current?.click(), title: "Image" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button variant="ghost" size="sm" onClick={() => setShowSource(!showSource)} className="text-xs">
          <Code className="h-3 w-3 me-1" />
          {showSource ? "Editor" : "HTML"}
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-accent/50 border-b">
          {toolbarButtons.map((btn, i) =>
            btn === null ? (
              <div key={i} className="w-px h-5 bg-primary/20 mx-1" />
            ) : (
              <Button key={i} variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={btn.cmd} title={btn.title}>
                <btn.icon className="h-3.5 w-3.5" />
              </Button>
            )
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageInsert} />
        </div>
        {/* Content */}
        {showSource ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-0 rounded-none min-h-[250px] font-mono text-sm"
            dir="ltr"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            dir={dir}
            className="min-h-[250px] p-4 prose prose-sm max-w-none focus:outline-none"
            onInput={syncFromEditor}
            onBlur={syncFromEditor}
            data-placeholder={placeholder}
            style={{ minHeight: 250 }}
          />
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      setPosts(data);
    } catch {
      toast.error(isRtl ? "تعذّر تحميل المقالات، حاول مرة أخرى" : "Couldn't load posts, please try again");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      titleAr: post.titleAr,
      titleEn: post.titleEn,
      excerptAr: post.excerptAr,
      excerptEn: post.excerptEn,
      contentAr: post.contentAr,
      contentEn: post.contentEn,
      coverImage: post.coverImage ?? "",
      authorName: post.authorName,
      isPublished: post.isPublished,
    });
    setShowForm(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setForm((f) => ({ ...f, coverImage: url }));
      toast.success(isRtl ? "تم رفع الصورة بنجاح ✓" : "Image uploaded successfully ✓");
    } catch {
      toast.error(isRtl ? "تعذّر رفع الصورة" : "Image upload failed");
    } finally {
      setUploading(false);
      if (coverRef.current) coverRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.titleAr && !form.titleEn) {
      toast.error(isRtl ? "العنوان مطلوب" : "Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/blog", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(editingId && { id: editingId }), ...form, coverImage: form.coverImage || null }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم حفظ المقال بنجاح ✓" : "Post saved successfully ✓");
      setShowForm(false);
      fetchPosts();
    } catch {
      toast.error(isRtl ? "تعذّر حفظ المقال" : "Couldn't save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) return;
    try {
      const res = await fetch("/api/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success(isRtl ? "تم حذف المقال بنجاح ✓" : "Post deleted successfully ✓");
      fetchPosts();
    } catch {
      toast.error(isRtl ? "تعذّر حذف المقال" : "Couldn't delete post");
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, isPublished: !post.isPublished }),
      });
      if (!res.ok) throw new Error();
      toast.success(post.isPublished ? (isRtl ? "تم إلغاء نشر المقال ✓" : "Post unpublished ✓") : (isRtl ? "تم نشر المقال بنجاح ✓" : "Post published successfully ✓"));
      fetchPosts();
    } catch {
      toast.error(isRtl ? "تعذّر تحديث حالة النشر" : "Couldn't update publish status");
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
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">{isRtl ? "المدونة" : "Blog"} ({posts.length})</h1>
        <Button onClick={openCreate} className="signature-gradient text-white">
          <Plus className="h-4 w-4 me-2" />
          {isRtl ? "مقال جديد" : "New Post"}
        </Button>
      </div>

      {/* Editor Form */}
      {showForm && (
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId ? (isRtl ? "تعديل المقال" : "Edit Post") : (isRtl ? "مقال جديد" : "New Post")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cover Image */}
            <div>
              <Label>{isRtl ? "صورة الغلاف" : "Cover Image"}</Label>
              <div className="mt-2 flex items-center gap-4">
                {form.coverImage ? (
                  <div className="relative">
                    <img src={form.coverImage} alt="" className="h-32 w-48 object-cover rounded-lg border" />
                    <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-32 w-48 rounded-lg bg-accent/50 flex items-center justify-center border-2 border-dashed border-primary/30">
                    <ImageIcon className="h-8 w-8 text-primary/40" />
                  </div>
                )}
                <div>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  <Button variant="outline" size="sm" onClick={() => coverRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : <Upload className="h-3 w-3 me-1" />}
                    {isRtl ? "رفع صورة" : "Upload"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Author */}
            <div className="max-w-sm">
              <Label>{isRtl ? "اسم الكاتب" : "Author Name"}</Label>
              <Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className="mt-1" placeholder={isRtl ? "اختياري" : "Optional"} />
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "العنوان بالعربية" : "Arabic Title"}</Label>
                <Input value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} className="mt-1" dir="rtl" />
              </div>
              <div>
                <Label>{isRtl ? "العنوان بالإنجليزية" : "English Title"}</Label>
                <Input value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} className="mt-1" dir="ltr" />
              </div>
            </div>

            {/* Excerpts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRtl ? "الملخص بالعربية" : "Arabic Excerpt"}</Label>
                <Textarea value={form.excerptAr} onChange={(e) => setForm((f) => ({ ...f, excerptAr: e.target.value }))} className="mt-1" rows={2} dir="rtl" />
              </div>
              <div>
                <Label>{isRtl ? "الملخص بالإنجليزية" : "English Excerpt"}</Label>
                <Textarea value={form.excerptEn} onChange={(e) => setForm((f) => ({ ...f, excerptEn: e.target.value }))} className="mt-1" rows={2} dir="ltr" />
              </div>
            </div>

            {/* Rich Content Editors */}
            <Tabs defaultValue="ar">
              <TabsList>
                <TabsTrigger value="ar">{isRtl ? "المحتوى بالعربية" : "Arabic Content"}</TabsTrigger>
                <TabsTrigger value="en">{isRtl ? "المحتوى بالإنجليزية" : "English Content"}</TabsTrigger>
              </TabsList>
              <TabsContent value="ar">
                <HtmlEditor
                  value={form.contentAr}
                  onChange={(val) => setForm((f) => ({ ...f, contentAr: val }))}
                  dir="rtl"
                  placeholder={isRtl ? "اكتب المحتوى بالعربية..." : "Write Arabic content..."}
                  label=""
                  isRtl={isRtl}
                />
              </TabsContent>
              <TabsContent value="en">
                <HtmlEditor
                  value={form.contentEn}
                  onChange={(val) => setForm((f) => ({ ...f, contentEn: val }))}
                  dir="ltr"
                  placeholder={isRtl ? "اكتب المحتوى بالإنجليزية..." : "Write English content..."}
                  label=""
                  isRtl={isRtl}
                />
              </TabsContent>
            </Tabs>

            {/* Publish + Save */}
            <div className="flex items-center gap-4 pt-2">
              <Button onClick={handleSave} disabled={saving} className="signature-gradient text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRtl ? "حفظ" : "Save"}
              </Button>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} className="rounded" />
                {isRtl ? "نشر المقال" : "Publish"}
              </label>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="transition-all hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-4">
              {post.coverImage && (
                <img src={post.coverImage} alt="" className="h-20 w-28 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base truncate">
                    {isRtl ? (post.titleAr || post.titleEn) : (post.titleEn || post.titleAr)}
                  </h3>
                  <Badge variant={post.isPublished ? "default" : "secondary"} className="shrink-0">
                    {post.isPublished ? (isRtl ? "منشور" : "Published") : (isRtl ? "مسودة" : "Draft")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {isRtl ? (post.excerptAr || post.excerptEn) : (post.excerptEn || post.excerptAr)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {post.authorName && <span>{isRtl ? "بقلم:" : "By:"} {post.authorName}</span>}
                  <span>{new Date(post.createdAt).toLocaleDateString(isRtl ? "ar-SY" : "en-US")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => togglePublish(post)} title={post.isPublished ? "Unpublish" : "Publish"}>
                  {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <Edit2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-muted-foreground">
              {isRtl ? "لا توجد مقالات بعد" : "No blog posts yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isRtl ? "أنشئ أول مقال باستخدام الزر أعلاه" : "Create your first post using the button above"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
