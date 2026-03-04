import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient(rememberMe?: boolean) {
  let isRememberMe = rememberMe;
  if (isRememberMe === undefined && typeof window !== "undefined") {
    isRememberMe = localStorage.getItem("remember_me") === "true";
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: isRememberMe ? 31536000 : undefined,
      }
    }
  );
}

export const supabase = getSupabaseBrowserClient();