import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

async function getUserScopedClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function GET() {
  const { data, error } = await supabase.rpc('get_segments');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const segments = data.map((row: any) => ({
    id: row.id,
    rating: row.rating,
    user_id: row.user_id ?? null,
    // parse to array, swap supabase's GeoJSON format lng/lat to lat/lng for leaflet
    coordinates: JSON.parse(row.geometry).coordinates.map(([lng, lat]: [number, number]) => [
      lat,
      lng,
    ]),
  }));

  return NextResponse.json(segments);
}

export async function POST(request: NextRequest) {
  const client = await getUserScopedClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { rating, coordinates } = await request.json();
  const geojson = coordsToGeojson(coordinates);

  const { data, error } = await client
    .from('segments')
    .insert({
      user_id: user.id,
      rating,
      geometry: JSON.stringify(geojson),
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const client = await getUserScopedClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, rating, coordinates } = await request.json();

  const updateData: { rating: number; geometry?: string } = { rating };
  if (coordinates) {
    const geojson = coordsToGeojson(coordinates);
    updateData.geometry = JSON.stringify(geojson);
  }

  const { error } = await client.from('segments').update(updateData).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: NextRequest) {
  const client = await getUserScopedClient();
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  const { error } = await client.from('segments').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}

function coordsToGeojson(coordinates: [number, number][]) {
  return {
    type: 'LineString',
    // swap leaflet's lat/lng to lng/lat for supabase's GeoJSON format
    coordinates: coordinates.map(([lat, lng]: [number, number]) => [lng, lat]),
  };
}
