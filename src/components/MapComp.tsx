import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// AQICN tile overlay: real-time AQI heatmap :contentReference[oaicite:6]{index=6}
export default function MapComp({ lat, lon }: { lat: number; lon: number }) {
  const center: LatLngExpression = [lat, lon];

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <TileLayer
        url={`https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${process.env.REACT_APP_AQICN_TOKEN}`}
        opacity={0.5}
        attribution="AQICN"
      />
    </MapContainer>
  );
}