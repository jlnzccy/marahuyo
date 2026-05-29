"use client";

import { useActionState } from "react";
import { Loader2, Lock, User } from "lucide-react";
import { signIn, type SignInState } from "@/app/studio/actions";

const INITIAL: SignInState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="meta">username</span>
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border/80 bg-canvas px-3 py-2 transition-all duration-300 focus-within:border-accent/80 focus-within:ring-4 focus-within:ring-accent/10">
          <User className="h-3.5 w-3.5 text-whisper" />
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            spellCheck={false}
            placeholder="username"
            className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-whisper focus:outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="meta">password</span>
        <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border/80 bg-canvas px-3 py-2 transition-all duration-300 focus-within:border-accent/80 focus-within:ring-4 focus-within:ring-accent/10">
          <Lock className="h-3.5 w-3.5 text-whisper" />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-transparent font-sans text-sm text-ink placeholder:text-whisper focus:outline-none"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 font-sans text-sm font-medium text-canvas transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {state.status === "error" && (
        <p className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 font-sans text-sm text-red-700 dark:text-red-200">
          {state.message}
        </p>
      )}
    </form>
  );
}
