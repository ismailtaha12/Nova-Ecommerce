import { Container } from "@/components/layout/container";
import { ResetPasswordForm } from "./reset-form";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <ResetPasswordForm />
    </Container>
  );
}
