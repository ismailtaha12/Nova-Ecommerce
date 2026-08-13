"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      className="mt-8 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("You are on the list.");
        setEmail("");
      }}
    >
      <Label htmlFor="newsletter-email" className="text-[11px] tracking-[0.2em] uppercase">
        Newsletter
      </Label>
      <div className="mt-2 flex gap-2">
        <Input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="h-11 rounded-md"
        />
        <Button type="submit" className="h-11 px-5">
          Join
        </Button>
      </div>
    </form>
  );
}
