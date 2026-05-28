import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import type { WorkRow, WorkUpdate } from "@/lib/supabase/types";

/**
 * Scheduled-publish sweeper. Vercel Cron POSTs here on the schedule defined
 * in `vercel.json`. Reads every draft work with `scheduled_at <= now()` and
 * flips it to published, clearing the schedule so it doesn't re-fire.
 *
 * Auth: Vercel Cron attaches `Authorization: Bearer <CRON_SECRET>` to the
 * request. We compare against the same secret read from env so a public hit
 * to this endpoint is a no-op.
 */
export const dynamic = "force-dynamic";

type Pending = Pick<WorkRow, "id" | "slug" | "scheduled_at">;

function unauthorized(reason: string) {
  return NextResponse.json({ ok: false, reason }, { status: 401 });
}

async function runSweep() {
  const supabase = getAdminSupabase();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("works")
    .select("id, slug, scheduled_at")
    .eq("status", "draft")
    .is("deleted_at", null)
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", nowIso)
    .returns<Pending[]>();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  const pending = (data ?? []) as Pending[];

  const flipped: string[] = [];
  for (const row of pending) {
    const patch: WorkUpdate = {
      status: "published",
      published_at: row.scheduled_at ?? nowIso,
      scheduled_at: null
    };
    const { error: updateErr } = await supabase
      .from("works")
      .update(patch as never)
      .eq("id", row.id);
    if (updateErr) continue;
    flipped.push(row.slug);
  }

  if (flipped.length > 0) {
    revalidatePath("/");
    revalidatePath("/works");
    for (const slug of flipped) revalidatePath(`/read/${slug}`);
  }

  return NextResponse.json({ ok: true, flipped: flipped.length, slugs: flipped });
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return unauthorized("CRON_SECRET not configured");
  const header = req.headers.get("authorization");
  if (header !== `Bearer ${secret}`) return unauthorized("bad authorization");
  return runSweep();
}

export async function POST(req: Request) {
  return GET(req);
}
