import { Segment } from '@/lib/segments';

type FetchSegmentsResult = { success: true; segments: Segment[] } | { success: false };

export async function fetchSegments(abortSignal: AbortSignal): Promise<FetchSegmentsResult> {
  try {
    const res = await fetch('/api/segments', { signal: abortSignal });
    if (!res.ok) {
      return { success: false };
    }
    return res.json();
  } catch {
    return { success: true, segments: [] };
  }
}

export async function createSegment({
  ratingValue,
  coordinates,
}: {
  ratingValue: number;
  coordinates: [number, number][];
}): Promise<{ id: string }> {
  const res = await fetch('/api/segments', {
    method: 'POST',
    body: JSON.stringify({ ratingValue, coordinates }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const data = await res.json();
    // eslint-disable-next-line no-console
    console.error(data.error);
    throw new Error('Kan het segment niet opslaan');
  }
  return res.json();
}

export async function updateSegment(
  id: string,
  ratingValue: number,
  coordinates?: [number, number][]
): Promise<void> {
  const res = await fetch('/api/segments', {
    method: 'PATCH',
    body: JSON.stringify({ id, ratingValue, coordinates }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const data = await res.json();
    // eslint-disable-next-line no-console
    console.error(data.error);
    throw new Error('Kan het segment niet aanpassen');
  }
}

export async function removeSegment(id: string): Promise<void> {
  const res = await fetch('/api/segments', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const data = await res.json();
    // eslint-disable-next-line no-console
    console.error(data.error);
    throw new Error('Kan het segment niet verwijderen');
  }
}
