import L from 'leaflet';

import { tilesProvider } from '@/lib/tilesProvider';

export async function fetchRoute(from: L.LatLng, to: L.LatLng): Promise<[number, number][]> {
  const url = `${tilesProvider.routingUrl}${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // GeoJSON coordinates are [lng, lat]; Leaflet needs [lat, lng]
    const geoCoords = data.routes[0].geometry.coordinates as [number, number][];
    return geoCoords.map(([lng, lat]) => [lat, lng]);
  } catch {
    return [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ];
  }
}
