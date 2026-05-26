import { FilePlus } from "lucide-react";
import { createWork } from "@/app/studio/(protected)/_actions/works";

export const metadata = { title: "New work · Studio" };

const KINDS: { value: "poem" | "essay" | "oneshot"; label: string; hint: string }[] = [
  { value: "poem", label: "Poem", hint: "preserves indents, soft returns, and raw whitespace." },
  { value: "essay", label: "Essay", hint: "long-form prose with headings and pull quotes." },
  { value: "oneshot", label: "One-shot", hint: "short notes, fragments, dispatches at 3 a.m." }
];

async function create(formData: FormData) {
  "use server";
  const kind = formData.get("kind") as "poem" | "essay" | "oneshot";
  const title = (formData.get("title") as string) ?? "Untitled";
  await createWork({ kind, title });
}

export default function NewWorkPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <p className="meta mb-2">studio · new work</p>
        <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
          Begin a <span className="font-italic italic font-normal">new piece</span>.
        </h1>
        <p className="mt-2 font-italic italic text-base text-muted">
          you can change everything later. nothing is published until you say so.
        </p>
      </header>

      <form action={create} className="space-y-8 rounded-2xl border border-border/60 bg-surface/40 p-6">
        <fieldset className="space-y-3">
          <legend className="meta mb-2">what kind of work</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {KINDS.map((k, i) => (
              <label
                key={k.value}
                className="group flex cursor-pointer flex-col gap-1 rounded-xl border border-border/60 bg-canvas p-4 transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-canvas"
              >
                <input
                  type="radio"
                  name="kind"
                  value={k.value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <span className="font-serif text-lg font-bold">{k.label}</span>
                <span className="font-italic italic text-xs leading-snug opacity-80">{k.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="meta">title</span>
          <input
            type="text"
            name="title"
            required
            autoFocus
            placeholder="give it a working title"
            className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-serif text-lg text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-sans text-sm font-medium text-canvas transition-opacity hover:opacity-95"
        >
          <FilePlus className="h-3.5 w-3.5" /> create draft
        </button>
      </form>
    </div>
  );
}
