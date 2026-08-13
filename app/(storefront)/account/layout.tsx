import { AccountNav } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/account/require-auth";
import { Container } from "@/components/layout/container";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="py-12 md:py-16">
      <RequireAuth>
        <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
          <AccountNav />
          <div>{children}</div>
        </div>
      </RequireAuth>
    </Container>
  );
}
