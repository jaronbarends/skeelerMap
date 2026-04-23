import { createBrowserClient } from '@supabase/ssr';
import type { AuthResponse, AuthError } from '@supabase/supabase-js';

import { getErrorMessageByCode } from './authErrorTranslations';

function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// Note: both signInWithPassword and signUp return AuthResponse, so we can use the same type for both; signOut returns { error: AuthError | null }
export type AuthResult =
  | { success: true; data: AuthResponse['data'] }
  | { success: false; error: { code: string; message: string } };

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  const result = getAuthResult(data, error);
  // when user tries to sign up with an email that already exists, supabase does not return an error, but identities is empty
  if (result.success && data.user?.identities?.length === 0) {
    return {
      success: false as const,
      error: {
        code: 'email_exists',
        message: getErrorMessageByCode('email_exists'),
      },
    };
  }

  return result;
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  return getAuthResult(data, error);
}

function getAuthErrorResult(error: AuthError): { success: false; error: { code: string; message: string } } {
  // Provide a fallback 'unknown' code if error.code is undefined
  const errorCode = error.code ?? 'unknown';
  return {
    success: false as const,
    error: { code: errorCode, message: getErrorMessageByCode(errorCode) },
  };
}

function getAuthResult(data: AuthResponse['data'], error: AuthError | null): AuthResult {
  if (error) {
    return getAuthErrorResult(error);
  }
  return { success: true as const, data };
}

export async function signOut() {
  const supabase = getBrowserClient();
  return supabase.auth.signOut();
}

export type SimpleAuthResult =
  | { success: true }
  | { success: false; error: { code: string; message: string } };

export async function resetPasswordForEmail(email: string): Promise<SimpleAuthResult> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-wachtwoord`,
  });

  if (error) {
    return getAuthErrorResult(error);
  }

  return { success: true as const };
}

export async function updatePassword(password: string): Promise<SimpleAuthResult> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return getAuthErrorResult(error);
  }

  return { success: true as const };
}
