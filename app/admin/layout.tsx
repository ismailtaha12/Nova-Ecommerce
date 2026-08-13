import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/data-access/auth";

export const metadata = { title: "Admin · Nova" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }}
      />
      <div className="min-w-0 flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
