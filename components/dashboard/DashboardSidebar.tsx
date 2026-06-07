"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, CreditCard, FileText, ImageIcon, LayoutDashboard, LogOut, Settings, UserCircle, UserCog, Users } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

const navItems = [
  { href: "/dashboard", labelAr: "الرئيسية", labelEn: "Home", icon: LayoutDashboard },
  { href: "/dashboard/appointments", labelAr: "المواعيد", labelEn: "Appointments", icon: CalendarDays },
  { href: "/dashboard/teachers", labelAr: "المدربون", labelEn: "Teachers", icon: Users },
  { href: "/dashboard/users", labelAr: "المستخدمون", labelEn: "Users", icon: UserCog },
  { href: "/dashboard/content", labelAr: "المحتوى", labelEn: "Content", icon: FileText },
  { href: "/dashboard/gallery", labelAr: "المعرض", labelEn: "Gallery", icon: ImageIcon },
  { href: "/dashboard/payments", labelAr: "المدفوعات", labelEn: "Payments", icon: CreditCard },
  { href: "/dashboard/blog", labelAr: "المدونة", labelEn: "Blog", icon: FileText },
  { href: "/dashboard/profile", labelAr: "الملف الشخصي", labelEn: "Profile", icon: UserCircle },
  { href: "/dashboard/settings", labelAr: "الإعدادات", labelEn: "Settings", icon: Settings },
];

export default function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const { logoUrl } = useSiteSettings();
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <SidebarProvider>
      <Sidebar side={isRtl ? "right" : "left"} dir={isRtl ? "rtl" : "ltr"}>
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded-full signature-gradient flex items-center justify-center">
                <span className="text-white text-xs font-bold">زه</span>
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-[#4e0078]">{isRtl ? "زهرة الحياة" : "Zahrat Al Hayat"}</p>
              <p className="text-xs text-muted-foreground">{isRtl ? "لوحة التحكم" : "Dashboard"}</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{isRtl ? "القائمة الرئيسية" : "Main Menu"}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const fullPath = `/${locale}${item.href}`;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={pathname === fullPath}
                        render={
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            <span>{isRtl ? item.labelAr : item.labelEn}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger nativeButton={false} render={<div role="button" tabIndex={0} className="w-full flex justify-start gap-3 h-auto py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#4e0078] text-white text-xs">
                    {session?.user?.name?.charAt(0) ?? "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {role === "ADMIN" ? (isRtl ? "مدير" : "Admin") : role === "TEACHER" ? (isRtl ? "مدرب" : "Teacher") : (isRtl ? "طالب" : "Student")}
                  </Badge>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}` })}>
                <LogOut className="h-4 w-4 me-2" />
                {isRtl ? "تسجيل الخروج" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 min-w-0 min-h-screen">
        <div className="flex items-center gap-4 border-b px-4 sm:px-6 py-3 bg-background">
          <SidebarTrigger />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {isRtl ? "← العودة للموقع" : "← Back to Site"}
          </Link>
        </div>
        <div className="p-4 sm:p-6 min-w-0">{children}</div>
      </main>
    </SidebarProvider>
  );
}
