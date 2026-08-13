import { Container } from "@/components/layout/container";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const sp = await searchParams;
  const nextRaw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next =
    nextRaw &&
    nextRaw.startsWith("/") &&
    !nextRaw.startsWith("//") &&
    !nextRaw.includes("://")
      ? nextRaw
      : "/account";

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <LoginForm next={next} />
    </Container>
  );
}
