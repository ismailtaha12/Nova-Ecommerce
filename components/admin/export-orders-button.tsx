"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { exportOrdersCsvAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ExportOrdersButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await exportOrdersCsvAction();
          if (result.error) {
            toast.error(result.error);
            return;
          }
          const blob = new Blob([result.csv ?? ""], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "nova-orders.csv";
          link.click();
          URL.revokeObjectURL(url);
        })
      }
    >
      {pending ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
