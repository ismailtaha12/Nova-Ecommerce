"use client";

import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { deleteReviewAdminAction } from "@/lib/actions/admin";

export function ReviewDeleteButton({ reviewId }: { reviewId: string }) {
  return (
    <ConfirmAction
      title="Delete this review?"
      description="The product rating will be recalculated. This cannot be undone."
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      destructive
      onConfirm={async () => {
        const result = await deleteReviewAdminAction(reviewId);
        if (result.error) return result;
        toast.success("Review deleted");
      }}
    >
      {({ open, pending }) => (
        <button
          type="button"
          disabled={pending}
          className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
          onClick={open}
        >
          Delete
        </button>
      )}
    </ConfirmAction>
  );
}
