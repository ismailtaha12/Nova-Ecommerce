import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = { title: "Admin · Nova" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 p-6 md:p-10">{children}</div>
    </div>
  );
}
