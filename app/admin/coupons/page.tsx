import { CouponsManager } from "@/components/admin/coupons-manager";
import { listAdminCoupons } from "@/lib/data-access/admin";

export default async function AdminCouponsPage() {
  const coupons = await listAdminCoupons();
  return <CouponsManager coupons={coupons} />;
}
