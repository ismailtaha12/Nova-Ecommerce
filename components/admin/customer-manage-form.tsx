"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { updateCustomerNotesAction } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function CustomerManageForm({
  customerId,
  notes,
  disabled,
}: {
  customerId: string;
  notes: string;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [isDisabled, setIsDisabled] = useState(disabled);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateCustomerNotesAction({
        id: customerId,
        notes: String(fd.get("notes") ?? ""),
        disabled: isDisabled,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Customer updated");
    });
  }

  return (
    <form className="mt-8 max-w-lg space-y-3" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="notes">Internal notes</Label>
        <Textarea id="notes" name="notes" rows={4} defaultValue={notes} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={isDisabled} onCheckedChange={(value) => setIsDisabled(value === true)} />
        Suspend customer
      </label>
      <Button type="submit" disabled={pending}>Save</Button>
    </form>
  );
}
