import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const shouldRememberMe = cookieStore.get("mindmoney_remember_me_oauth")?.value === "true";

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                const finalOptions = { ...options };
                if (shouldRememberMe) {
                  finalOptions.maxAge = 31536000;
                }
                cookieStore.set(name, value, finalOptions);
              })
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      try {
        cookieStore.set("mindmoney_remember_me_oauth", "", { maxAge: -1, path: "/" });
      } catch (e) { }

      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth-code-error", url.origin));
}
