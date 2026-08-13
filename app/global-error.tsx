"use client";

import { FailedRequest } from "@/components/states/empty-state";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <FailedRequest reset={reset} />
      </body>
    </html>
  );
}
