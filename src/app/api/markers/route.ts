import { NextRequest, NextResponse } from 'next/server';

import { Marker, MarkerType } from '@/lib/markers';
import { getSupabaseServerClient } from '@/lib/supabaseAuth.server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_markers');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const markers: Marker[] = data.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    lat: row.lat,
    lng: row.lng,
    type: row.type,
    description: row.description ?? null,
  }));

  return NextResponse.json(markers);
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, description, lat, lng } = (await request.json()) as {
    type: MarkerType;
    description: string | null;
    lat: number;
    lng: number;
  };

  const location = `SRID=4326;POINT(${lng} ${lat})`;

  const { data, error } = await supabase
    .from('markers')
    .insert({
      user_id: user.id,
      type,
      description,
      location,
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

  const { id, type, description } = (await request.json()) as {
    id: string;
    type?: MarkerType;
    description?: string | null;
  };

  const updateData: { type?: MarkerType; description?: string | null } = {};
  if (type !== undefined) {
    updateData.type = type;
  }
  if (description !== undefined) {
    updateData.description = description;
  }

  if (Object.keys(updateData).length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  const { error, count } = await supabase
    .from('markers')
    .update(updateData, { count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (typeof count !== 'number') {
    return NextResponse.json({ error: 'Unexpected missing count.' }, { status: 500 });
  }
  if (count === 0) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
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

  const { id } = (await request.json()) as { id: string };

  const { error, count } = await supabase
    .from('markers')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (typeof count !== 'number') {
    return NextResponse.json({ error: 'Unexpected missing count.' }, { status: 500 });
  }
  if (count === 0) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
