import { createBrowserClient } from '@supabase/ssr';
import type { AuthResponse, AuthError } from '@supabase/supabase-js';

import type { Feedback } from '@/components/auth/FormFeedback';

import { getFeedbackByCode } from './authFeedbackTranslations';

export type AuthCallbackType = 'signup' | 'recovery';

// Note: both signInWithPassword and signUp return AuthResponse, so we can use the same type for both
export type AuthResult =
  | { success: true; data: AuthResponse['data'] }
  | { success: false; error: { code: string; feedback: Feedback } };

export type SimpleAuthResult =
  | { success: true }
  | { success: false; error: { code: string; feedback: Feedback } };

const SIGNUP_CALLBACK_URL = getCallbackUrl('signup');
const RESET_PASSWORD_CALLBACK_URL = getCallbackUrl('recovery');

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: SIGNUP_CALLBACK_URL,
    },
  });

  const result = getAuthResult(data, error);
  // when user tries to sign up with an email that already exists, supabase does not return an error, but identities is empty
  if (result.success && data.user?.identities?.length === 0) {
    return {
      success: false as const,
      error: {
        code: 'email_exists',
        feedback: getFeedbackByCode('email_exists'),
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

export async function signOut(): Promise<SimpleAuthResult> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signOut();
  return getSimpleAuthResult(error);
}

export async function resetPasswordForEmail(email: string): Promise<SimpleAuthResult> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: RESET_PASSWORD_CALLBACK_URL,
  });
  return getSimpleAuthResult(error);
}

export async function resendConfirmationEmail(email: string): Promise<SimpleAuthResult> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: SIGNUP_CALLBACK_URL,
    },
  });

  return getSimpleAuthResult(error);
}

export async function updatePassword(password: string): Promise<SimpleAuthResult> {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.updateUser({ password });
  return getSimpleAuthResult(error);
}

function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

function getAuthErrorResult(error: AuthError): {
  success: false;
  error: { code: string; feedback: Feedback };
} {
  // Provide a fallback 'unknown' code if error.code is undefined
  const errorCode = error.code ?? 'unknown';
  return {
    success: false as const,
    error: { code: errorCode, feedback: getFeedbackByCode(errorCode) },
  };
}

function getSimpleAuthResult(error: AuthError | null): SimpleAuthResult {
  if (error) {
    return getAuthErrorResult(error);
  }
  return { success: true as const };
}

function getAuthResult(data: AuthResponse['data'], error: AuthError | null): AuthResult {
  if (error) {
    return getAuthErrorResult(error);
  }
  return { success: true as const, data };
}

function getCallbackUrl(type: AuthCallbackType) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is not set');
  }
  return `${siteUrl}/auth/callback?type=${type}`;
}
