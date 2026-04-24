import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import { type AuthCallbackType } from '@/lib/supabaseAuth';
import { getUrlWithToast } from '@/lib/toastMessages';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type: AuthCallbackType = searchParams.get('type') as AuthCallbackType;

  let successUrl: string;
  let failureUrl: string;

  if (type === 'signup') {
    successUrl = getUrlWithToast(origin, 'accountConfirmed');
    failureUrl = `${origin}/bevestigings-link-opnieuw-aanvragen`;
  } else if (type === 'recovery') {
    successUrl = `${origin}/nieuw-wachtwoord`;
    failureUrl = `${origin}/wachtwoord-vergeten?expired=1`;
  } else {
    return NextResponse.redirect(`${origin}/error?message=Invalid+callback+type`);
  }

  if (!code) {
    // not having a code means the link is invalid or has expired
    return NextResponse.redirect(failureUrl);
  }

  const loggedInUserRedirect = await loginUser(request, code, successUrl, failureUrl);
  return loggedInUserRedirect;
}

async function loginUser(
  request: NextRequest,
  code: string,
  successUrl: string,
  failureUrl: string
) {
  const response = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(failureUrl);
  }

  return response;
}
