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
  const center: [number, number] = points[0] ? [points[0].latitude, points[0].longitude] : [-6.2, 106.83];
  return (
    <div className="h-[360px] overflow-hidden rounded-lg border border-border">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full">
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
