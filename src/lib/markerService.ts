import { Marker, MarkerType } from '@/lib/markers';

export async function fetchMarkers(abortSignal: AbortSignal): Promise<Marker[]> {
  try {
    const res = await fetch('/api/markers', { signal: abortSignal });
    return res.json();
  } catch {
    return [];
  }
}

export async function createMarker(data: {
  type: MarkerType;
  description: string | null;
  lat: number;
  lng: number;
}): Promise<{ id: string }> {
  const sanitizedData = {
    ...data,
    description: stripTags(data.description),
  };
  const res = await fetch('/api/markers', {
    method: 'POST',
    body: JSON.stringify(sanitizedData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.json();
    // eslint-disable-next-line no-console
    console.error(body.error);
    throw new Error('Kan de marker niet opslaan');
  }
  return res.json();
}

export async function updateMarker(
  id: string,
  data: { type: MarkerType; description: string | null }
): Promise<void> {
  const sanitizedData = {
    ...data,
    description: stripTags(data.description),
  };
  const res = await fetch('/api/markers', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...sanitizedData }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.json();
    // eslint-disable-next-line no-console
    console.error(body.error);
    throw new Error('Kan de marker niet aanpassen');
  }
}

export async function removeMarker(id: string): Promise<void> {
  const res = await fetch('/api/markers', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.json();
    // eslint-disable-next-line no-console
    console.error(body.error);
    throw new Error('Kan de marker niet verwijderen');
  }
}

function stripTags(html: string | null): string | null {
  if (!html) {
    return null;
  }
  return html.replace(/<[^>]*>?/g, '');
}
