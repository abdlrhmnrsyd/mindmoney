import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const response = NextResponse.redirect(new URL("/dashboard", url.origin));

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

                // Set directly on the cookieStore (for server side context)
                cookieStore.set(name, value, finalOptions);

                // Ensure it gets attached to the outgoing redirect response 
                // because `@supabase/ssr` with App Router sometimes loses options on redirect
                response.cookies.set({
                  name,
                  value,
                  ...finalOptions
                });
              })

              // Clean up the temporary OAuth cookie on both store and response
              cookieStore.set("mindmoney_remember_me_oauth", "", { maxAge: -1, path: "/" });
              response.cookies.set("mindmoney_remember_me_oauth", "", { maxAge: -1, path: "/" });
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}