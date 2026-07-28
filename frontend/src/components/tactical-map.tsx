"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { DashboardData } from "@/types/wasdal";
import { Badge } from "@/components/ui";
import { priorityTone } from "@/lib/utils";

const colorByPriority = {
  Critical: "#DC2626",
  High: "#D97706",
  Medium: "#2563EB",
  Low: "#16A34A"
};

export function TacticalMap({ points }: { points: DashboardData["map_points"] }) {
  // Center to Tangerang Selatan by default
  const center: [number, number] = [-6.2886, 106.7179];
  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border min-h-[400px]">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <CircleMarker
            key={point.id}
            center={[point.latitude, point.longitude]}
            radius={10}
            pathOptions={{
              color: colorByPriority[point.priority],
              fillColor: colorByPriority[point.priority],
              fillOpacity: 0.78,
              weight: 2
            }}
          >
            <Popup>
              <div className="max-w-[220px] space-y-2">
                <div className="text-xs font-semibold text-slate-900">{point.number}</div>
                <div className="text-sm text-slate-700">{point.title}</div>
                <Badge className={priorityTone(point.priority)}>{point.priority}</Badge>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
