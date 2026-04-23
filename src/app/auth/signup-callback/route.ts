import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import { getUrlWithToast } from '@/lib/toastMessages';

/*
NOTE: this callback route handles the PKCE code exchange (exchangeCodeForSession). Not just used for account confirmation, but also for email change confirmation or magic links.
*/

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  const successUrl = getUrlWithToast(origin, 'accountConfirmed');
  const failureUrl = `${origin}/bevestigings-link-opnieuw-aanvragen`;

  if (!code) {
    return NextResponse.redirect(failureUrl);
  }

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
