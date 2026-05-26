/**
 * Centralized env access. Throws a clear error if a required value is missing,
 * so misconfigured deployments fail loudly instead of with cryptic Supabase errors.
 */
function read(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable: ${name}. See .env.local.example.`
    );
  }
  return value;
}

export const supabaseEnv = {
  url: () => read("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  anonKey: () =>
    read("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  serviceRoleKey: () =>
    read("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY)
};

export const studioEnv = {
  username: () => read("STUDIO_USERNAME", process.env.STUDIO_USERNAME),
  password: () => read("STUDIO_PASSWORD", process.env.STUDIO_PASSWORD),
  sessionSecret: () =>
    read("STUDIO_SESSION_SECRET", process.env.STUDIO_SESSION_SECRET)
};

/** True when Supabase env vars are present — used to gate live data fetches. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
