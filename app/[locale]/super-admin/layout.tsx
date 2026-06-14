import { redirect } from "next/navigation";
import { createServerCaller } from "@/lib/trpc/server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function SuperAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const caller = await createServerCaller();
  const user = await caller.users.me().catch(() => null);

  if (!user || user.role !== "SUPER_ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <AdminShell
      locale={locale}
      user={{
        fullName: user.fullName,
        role: user.role,
        wilaya: user.wilaya,
        managedWilaya: user.managedWilaya,
      }}
      variant="super"
    >
      {children}
    </AdminShell>
  );
}
