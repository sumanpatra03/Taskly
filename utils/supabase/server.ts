import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    "https://vunmyyohwyrqoewpiedy.supabase.co"!,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bm15eW9od3lycW9ld3BpZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MjM2MTUsImV4cCI6MjA1ODQ5OTYxNX0.FARUNgJOMKNkZXJ_43J9u_1yRoSnXS-xzF4pK0FqpQY"!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
