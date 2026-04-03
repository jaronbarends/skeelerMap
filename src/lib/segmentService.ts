import { Segment } from '@/lib/segments';

export async function fetchSegments(abortSignal: AbortSignal): Promise<Segment[]> {
  try {
    const res = await fetch('/api/segments', { signal: abortSignal });
    return res.json();
  } catch {
    return [];
  }
}

export async function createSegment({
  rating,
  coordinates,
}: {
  rating: number;
  coordinates: [number, number][];
}): Promise<{ id: string }> {
  const res = await fetch('/api/segments', {
    method: 'POST',
    body: JSON.stringify({ rating, coordinates }),
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
  rating: number,
  coordinates?: [number, number][]
): Promise<void> {
  const res = await fetch('/api/segments', {
    method: 'PATCH',
    body: JSON.stringify({ id, rating, coordinates }),
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
