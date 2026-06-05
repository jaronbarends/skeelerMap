import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
  const timeout = new Promise((_, reject) => {
    // Vercel has a default limit of 1.5s for middleware response
    // if Supabase is paused, this limit will be hit resulting in an error
    // 504: GATEWAY_TIMEOUT Code: MIDDLEWARE_INVOCATION_TIMEOUT
    // set timeout to pass on the response before that; user will be considered logged out
    setTimeout(() => reject(new Error('middleware timeout')), 1000);
  });
  // call getUser to be able to refresh JWT
  try {
    await Promise.race([supabase.auth.getUser(), timeout]);
  } catch {
    // Supabase slow or down — let the request through unauthenticated
    return response;
  }
  return response;
}

// exclude next.js internals, static files, images
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
