import { Suspense } from 'react';

import MapUIContainer from '@/components/map/MapUIContainer';
import Toast from '@/components/Toast';
import { getUser } from '@/lib/supabaseAuth.server';

export default async function Home() {
  const user = await getUser();

  return (
    <>
      <MapUIContainer currentUserId={user?.id ?? null} />
      <Suspense>
        <Toast />
      </Suspense>
    </>
  );
}
