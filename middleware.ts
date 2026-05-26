import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieEntry = { name: string; value: string; options?: CookieOptions };

/**
 * Refreshes the Supabase auth session cookie on every Studio request.
 * Final owner-email enforcement happens inside the /studio layout so we
 * can render a friendly redirect; middleware only keeps cookies fresh.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (entries: CookieEntry[]) => {
        entries.forEach(({ name, value, options }) => {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();
  return res;
}

export const config = {
  matcher: ["/studio/:path*"]
};
