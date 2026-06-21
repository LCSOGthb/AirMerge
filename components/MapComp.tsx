"use client";

import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComp({ lat, lon }: { lat: number; lon: number }) {
  const center: LatLngExpression = [lat, lon];
  const token = process.env.NEXT_PUBLIC_AQICN_TOKEN ?? "";

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {token && (
        <TileLayer
          url={`https://tiles.waqi.info/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${token}`}
          opacity={0.5}
          attribution="AQICN"
        />
      )}
    </MapContainer>
  );
}
