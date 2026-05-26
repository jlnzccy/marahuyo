import { redirect } from "next/navigation";
import { LoginForm } from "@/app/studio/login/login-form";
import { getStudioSession } from "@/lib/supabase/auth";
import { Wordmark } from "@/components/wordmark";

export default async function StudioLoginPage() {
  const session = await getStudioSession();
  if (session?.isOwner) redirect("/studio");

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Wordmark size="md" />
          <p className="meta mt-3">studio · single tenant</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/40 p-8">
          <h1 className="font-serif text-3xl font-bold leading-tight">
            Sign in to the <span className="font-italic italic font-normal">writing</span> room.
          </h1>
          <p className="mt-2 font-italic italic text-base text-muted">
            enter your username and password.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center font-sans text-xs text-whisper">
          only the registered owner credentials may access the studio. all other attempts are quietly turned away.
        </p>
      </div>
    </div>
  );
}
