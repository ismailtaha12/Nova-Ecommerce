import { InventoryPanel } from "@/components/admin/inventory-panel";
import { listAdminProducts, listInventoryLogs } from "@/lib/data-access/admin";

export default async function InventoryPage() {
  const [products, logs] = await Promise.all([listAdminProducts(), listInventoryLogs()]);
  const active = products.filter((product) => !product.archived);

  return <InventoryPanel products={active} logs={logs} />;
}
