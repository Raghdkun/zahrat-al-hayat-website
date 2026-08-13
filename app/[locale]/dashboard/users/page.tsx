"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Save,
  Shield,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  image: string | null;
  createdAt: string;
};

type FormData = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
};

const emptyForm: FormData = { name: "", email: "", password: "", role: "STUDENT" };

const roleBadge = (role: string, isRtl: boolean) => {
  const map: Record<string, { label: string; className: string }> = {
    ADMIN: { label: isRtl ? "مدير" : "Admin", className: "bg-primary/10 text-primary" },
    TEACHER: { label: isRtl ? "مدرب" : "Teacher", className: "bg-brand-secondary/10 text-brand-secondary" },
    STUDENT: { label: isRtl ? "طالب" : "Student", className: "bg-tertiary/10 text-tertiary" },
  };
  const info = map[role] ?? { label: role, className: "" };
  return <Badge variant="secondary" className={info.className}>{info.label}</Badge>;
};

export default function UsersPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const sessionUserId = session?.user?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error(isRtl ? "تعذّر تحميل المستخدمين، حاول مرة أخرى" : "Couldn't load users, please try again");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, isRtl]);

  useEffect(() => {
    if (role === "ADMIN") fetchUsers();
  }, [role, fetchUsers]);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error(isRtl ? "الاسم والبريد مطلوبان" : "Name and email are required");
      return;
    }
    const pwdWeak = (p: string) => p.length < 8 || !/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/[0-9]/.test(p);
    const pwdMsg = isRtl
      ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم"
      : "Password must be 8+ chars with uppercase, lowercase and a number";
    if (!isEditing && (!formData.password || pwdWeak(formData.password))) {
      toast.error(pwdMsg);
      return;
    }
    if (isEditing && formData.password && pwdWeak(formData.password)) {
      toast.error(pwdMsg);
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (isEditing) payload.id = formData.id;
      if (formData.password) payload.password = formData.password;

      const res = await fetch("/api/users", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success(isRtl ? "تم حفظ المستخدم بنجاح ✓" : "User saved successfully ✓");
      setShowForm(false);
      setFormData(emptyForm);
      setIsEditing(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isRtl ? "تعذّر حفظ المستخدم" : "Couldn't save user"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    if (deleteId === sessionUserId) {
      toast.error(isRtl ? "لا يمكنك حذف نفسك" : "Cannot delete yourself");
      setDeleteId(null);
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success(isRtl ? "تم حذف المستخدم بنجاح ✓" : "User deleted successfully ✓");
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isRtl ? "تعذّر حذف المستخدم" : "Couldn't delete user"));
    }
  };

  const openEdit = (user: User) => {
    setFormData({ id: user.id, name: user.name, email: user.email, password: "", role: user.role });
    setIsEditing(true);
    setShowForm(true);
  };

  const openAdd = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setShowForm(true);
  };

  if (role !== "ADMIN") {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">{isRtl ? "غير مصرح" : "Unauthorized"}</h2>
            <p className="text-muted-foreground">{isRtl ? "ليس لديك صلاحية الوصول لهذه الصفحة" : "You do not have permission to access this page"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const teacherCount = users.filter((u) => u.role === "TEACHER").length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">{isRtl ? "إدارة المستخدمين" : "User Management"}</h1>
        <Button className="signature-gradient text-white" onClick={openAdd}>
          <Plus className="h-4 w-4 me-2" />
          {isRtl ? "إضافة مستخدم" : "Add User"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-accent/50 border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-primary">{users.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "إجمالي المستخدمين" : "Total Users"}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-primary">{adminCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "المدراء" : "Admins"}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-brand-secondary">{teacherCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "المدربون" : "Teachers"}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-display font-semibold text-tertiary">{studentCount}</p>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? "الطلاب" : "Students"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRtl ? "بحث بالاسم أو البريد..." : "Search by name or email..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList>
            <TabsTrigger value="ALL">{isRtl ? "الكل" : "All"}</TabsTrigger>
            <TabsTrigger value="ADMIN">{isRtl ? "مدراء" : "Admins"}</TabsTrigger>
            <TabsTrigger value="TEACHER">{isRtl ? "مدربون" : "Teachers"}</TabsTrigger>
            <TabsTrigger value="STUDENT">{isRtl ? "طلاب" : "Students"}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{isEditing ? (isRtl ? "تعديل مستخدم" : "Edit User") : (isRtl ? "إضافة مستخدم جديد" : "Add New User")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRtl ? "الاسم" : "Name"}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRtl ? "أدخل الاسم" : "Enter name"}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isRtl ? "أدخل البريد" : "Enter email"}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {isRtl ? "كلمة المرور" : "Password"}
                  {isEditing && <span className="text-xs text-muted-foreground ms-1">({isRtl ? "اتركه فارغاً للإبقاء" : "leave empty to keep"})</span>}
                </Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEditing ? (isRtl ? "كلمة مرور جديدة (اختياري)" : "New password (optional)") : (isRtl ? "أدخل كلمة المرور" : "Enter password")}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? "الدور" : "Role"}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as FormData["role"] })}
                >
                  <option value="STUDENT">{isRtl ? "طالب" : "Student"}</option>
                  <option value="TEACHER">{isRtl ? "مدرب" : "Teacher"}</option>
                  <option value="ADMIN">{isRtl ? "مدير" : "Admin"}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button className="signature-gradient text-white" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Save className="h-4 w-4 me-2" />}
                {isRtl ? "حفظ" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setFormData(emptyForm); setIsEditing(false); }}>
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-red-800">
              {isRtl ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?"}
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                {isRtl ? "نعم، احذف" : "Yes, Delete"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isRtl ? "قائمة المستخدمين" : "Users List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isRtl ? "لا يوجد مستخدمون" : "No users found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/50 hover:bg-accent/50">
                  <TableHead className="font-bold text-primary">{isRtl ? "الاسم" : "Name"}</TableHead>
                  <TableHead className="font-bold text-primary">{isRtl ? "البريد" : "Email"}</TableHead>
                  <TableHead className="font-bold text-primary">{isRtl ? "الدور" : "Role"}</TableHead>
                  <TableHead className="font-bold text-primary">{isRtl ? "تاريخ الإنشاء" : "Created"}</TableHead>
                  <TableHead className="font-bold text-primary">{isRtl ? "إجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{roleBadge(user.role, isRtl)}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString(isRtl ? "ar-SY" : "en-US")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(user.id)}
                          disabled={user.id === sessionUserId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
