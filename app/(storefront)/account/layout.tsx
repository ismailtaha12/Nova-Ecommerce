import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { Container } from "@/components/layout/container";
import { getSessionUser } from "@/lib/data-access/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  return (
    <Container className="py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </Container>
  );
}
