import { BannersManager } from "@/components/admin/banners-manager";
import { listAdminBanners } from "@/lib/data-access/admin";

export default async function AdminBannersPage() {
  const banners = await listAdminBanners();
  return <BannersManager banners={banners} />;
}
