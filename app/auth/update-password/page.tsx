import { Container } from "@/components/layout/container";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata = { title: "Update password" };

export default function UpdatePasswordPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <UpdatePasswordForm />
    </Container>
  );
}
