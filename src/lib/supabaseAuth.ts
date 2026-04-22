import { createBrowserClient } from '@supabase/ssr';
import { type AuthResponse } from '@supabase/supabase-js';

import { getErrorMessageByCode } from './authErrorTranslations';

function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export async function signUp(email: string, password: string) {
  const supabase = getBrowserClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
}
export type SignInResult =
  | { success: true; data: AuthResponse['data'] }
  | { success: false; error: { code: string; message: string } };

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const supabase = getBrowserClient();
  // return supabase.auth.signInWithPassword({ email, password });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Provide a fallback 'unknown' code if error.code is undefined
    const errorCode = error.code ?? 'unknown';
    const message = getErrorMessageByCode(errorCode);

    return {
      success: false as const,
      error: {
        code: errorCode,
        message,
      },
    };
  }
  return {
    success: true as const,
    data,
  };
}

export async function signOut() {
  const supabase = getBrowserClient();
  return supabase.auth.signOut();
}
