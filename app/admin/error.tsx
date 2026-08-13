"use client";

import { FailedRequest } from "@/components/states/empty-state";

export default function AdminErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <FailedRequest reset={reset} />;
}
