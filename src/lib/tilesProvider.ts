interface TilesProvider {
  url: string;
  attribution: string;
  routingUrl: string;
}

const ROUTING_URL = 'https://routing.openstreetmap.de/routed-bike/route/v1/driving/';

const OSM: TilesProvider = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  routingUrl: ROUTING_URL,
};

const CARTO: TilesProvider = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  routingUrl: ROUTING_URL,
};

export const tilesProvider = OSM; // ← switch here
