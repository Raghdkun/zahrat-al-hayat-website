import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/auth/login`);

  const role = (session.user as { role: string }).role;
  if (role === "STUDENT") redirect(`/${locale}`);

  return (
    <SessionProvider session={session}>
      <DashboardSidebar>{children}</DashboardSidebar>
    </SessionProvider>
  );
}
