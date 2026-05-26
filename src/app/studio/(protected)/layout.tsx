import { redirect } from "next/navigation";
import { getStudioSession } from "@/lib/supabase/auth";
import { StudioChrome } from "@/app/studio/_components/chrome";

export const metadata = {
  title: "Studio",
  robots: { index: false, follow: false }
};

export default async function StudioProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getStudioSession();
  if (!session) redirect("/studio/login");
  if (!session.isOwner) redirect("/");

  return <StudioChrome username={session.username}>{children}</StudioChrome>;
}
