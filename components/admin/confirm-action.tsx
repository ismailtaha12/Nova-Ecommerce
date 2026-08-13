"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConfirmAction({
  title,
  description,
  confirmLabel = "Confirm",
  pendingLabel = "Working…",
  destructive,
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  pendingLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<{ error?: string } | void>;
  children: (opts: { open: () => void; pending: boolean }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      {children({ open: () => setOpen(true), pending })}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={!pending} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await onConfirm();
                  if (result && result.error) {
                    toast.error(result.error);
                    return;
                  }
                  setOpen(false);
                });
              }}
            >
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
