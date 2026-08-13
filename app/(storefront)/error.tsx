"use client";

import { FailedRequest } from "@/components/states/empty-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <FailedRequest reset={reset} />;
}
