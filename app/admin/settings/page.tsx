import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { getStoreSettings } from "@/lib/data-access/admin";
import { requireAdmin } from "@/lib/data-access/auth";

export default async function AdminSettingsPage() {
  const [settings, user] = await Promise.all([getStoreSettings(), requireAdmin()]);

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="These values persist in the database and appear in the storefront footer."
      />
      <StoreSettingsForm settings={settings} user={user} />
    </div>
  );
}
