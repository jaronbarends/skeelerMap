import { NextRequest, NextResponse } from 'next/server';

import { Segment } from '@/lib/segments';
import { getSupabaseServerClient } from '@/lib/supabaseAuth.server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_segments');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const segments: Segment[] = data.map((row: any) => ({
    id: row.id,
    ratingValue: row.rating,
    userId: row.user_id ?? null,
    // parse to array, swap supabase's GeoJSON format lng/lat to lat/lng for leaflet
    coordinates: JSON.parse(row.geometry).coordinates.map(([lng, lat]: [number, number]) => [
      lat,
      lng,
    ]),
  }));

  return NextResponse.json(segments);
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ratingValue, coordinates } = await request.json();
  const geojson = coordsToGeojson(coordinates);

  const { data, error } = await supabase
    .from('segments')
    .insert({
      user_id: user.id,
      rating: ratingValue,
      geometry: JSON.stringify(geojson),
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ratingValue, coordinates } = await request.json();

  const updateData: { rating: number; geometry?: string } = { rating: ratingValue };
  if (coordinates) {
    const geojson = coordsToGeojson(coordinates);
    updateData.geometry = JSON.stringify(geojson);
  }

  const { error } = await supabase.from('segments').update(updateData).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  const { error } = await supabase.from('segments').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

function coordsToGeojson(coordinates: [number, number][]) {
  return {
    type: 'LineString',
    // swap leaflet's lat/lng to lng/lat for supabase's GeoJSON format
    coordinates: coordinates.map(([lat, lng]: [number, number]) => [lng, lat]),
  };
}
