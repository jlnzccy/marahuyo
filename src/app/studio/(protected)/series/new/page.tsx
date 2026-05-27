import { FilePlus } from "lucide-react";
import { createWork } from "@/app/studio/(protected)/_actions/works";

export const metadata = { title: "New series · Studio" };

async function create(formData: FormData) {
  "use server";
  const title = (formData.get("title") as string) ?? "Untitled";
  await createWork({ kind: "series", title });
}

export default function NewSeriesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <p className="meta mb-2">studio · new series</p>
        <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
          Begin a <span className="font-italic italic font-normal">new series</span>.
        </h1>
        <p className="mt-2 font-italic italic text-base text-muted">
          chapters come after. nothing is published until you say so.
        </p>
      </header>

      <form
        action={create}
        className="space-y-8 rounded-2xl border border-border/60 bg-surface/40 p-6"
      >
        <label className="block">
          <span className="meta">series title</span>
          <input
            type="text"
            name="title"
            required
            autoFocus
            placeholder="give the arc a working title"
            className="mt-1.5 w-full rounded-md border border-border/80 bg-canvas px-3 py-2 font-serif text-lg text-ink placeholder:text-whisper focus:border-accent focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-sans text-sm font-medium text-canvas transition-opacity hover:opacity-95"
        >
          <FilePlus className="h-3.5 w-3.5" /> create series
        </button>
      </form>
    </div>
  );
}
