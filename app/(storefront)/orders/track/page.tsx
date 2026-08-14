import { Suspense } from "react";
import { OrderTrackForm } from "@/components/account/order-track-form";

export const metadata = { title: "Track order" };

export default function TrackOrderPage() {
  return (
    <Suspense>
      <OrderTrackForm />
    </Suspense>
  );
}
