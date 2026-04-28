import { Suspense } from 'react';

import MapUIContainer from '@/components/map/MapUIContainer';
import ToastWrapper from '@/components/toast/ToastWrapper';
import { getUser } from '@/lib/supabaseAuth.server';

export default async function Home() {
  const user = await getUser();

  return (
    <main>
      <MapUIContainer currentUserId={user?.id ?? null} />
      <Suspense>
        <ToastWrapper />
      </Suspense>
    </main>
  );
}
