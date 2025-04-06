import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// paths that don't require authentication
const publicPaths = [
  "/", 
  "/login", 
  "/create-account",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
  "/auth/auth-error",
  "/profile/:id", 
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    "https://vunmyyohwyrqoewpiedy.supabase.co"!,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bm15eW9od3lycW9ld3BpZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MjM2MTUsImV4cCI6MjA1ODQ5OTYxNX0.FARUNgJOMKNkZXJ_43J9u_1yRoSnXS-xzF4pK0FqpQY"!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentPath = request.nextUrl.pathname;
  const nextPath =
    currentPath === "/login" || currentPath === "/create-account"
      ? request.nextUrl.searchParams.get("next") || "/" // Default to landing page
      : currentPath;

  // Check if the current path matches any public path pattern
  const isPublicPath = publicPaths.some((path) => {
    // Convert path pattern to regex
    const pattern = path.replace(":id", "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  });

  if (!session && !isPublicPath) {
    // no user, redirect to login page with current path as next
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  if (
    session &&
    (currentPath === "/login" || currentPath === "/create-account")
  ) {
    // For logged in users trying to access auth pages, redirect to the next path
    const url = new URL(nextPath, request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
