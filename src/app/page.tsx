import { Suspense } from 'react';

import Toast from '@/components/Toast';
import MapUIContainer from '@/components/map/MapUIContainer';
import { getUser } from '@/lib/supabaseAuth.server';

export default async function Home() {
  const user = await getUser();

  return (
    <main>
      <MapUIContainer currentUserId={user?.id ?? null} />
      <Suspense>
        <Toast />
      </Suspense>
    </main>
  );
}
