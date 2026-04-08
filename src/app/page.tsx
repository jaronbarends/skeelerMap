import { Suspense } from 'react';

import MapUIContainer from '@/components/map/MapUIContainer';
import Toast from '@/components/Toast';

export default function Home() {
  return (
    <>
      <MapUIContainer />
      <Suspense>
        <Toast />
      </Suspense>
    </>
  );
}
