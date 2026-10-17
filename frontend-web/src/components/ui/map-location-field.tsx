"use client";
import { Input } from "./input";
import { LocationMap } from "./location-map";
import { normalizeMapEmbed, normalizeMapsLink } from "@/lib/map-location";

interface Props {
  address: string; mapEmbedUrl: string; mapsUrl: string;
  onEmbedChange: (value: string) => void; onMapsChange: (value: string) => void; disabled?: boolean;
}

export function MapLocationField({ address, mapEmbedUrl, mapsUrl, onEmbedChange, onMapsChange, disabled }: Props) {
  const embed = normalizeMapEmbed(mapEmbedUrl);
  const invalid = embed === null || normalizeMapsLink(mapsUrl) === null;
  return <div className="space-y-3">
    <Input label="Bản đồ Google Maps (tùy chọn)" value={mapEmbedUrl} disabled={disabled}
      placeholder="Dán mã nhúng hoặc URL nhúng bản đồ"
      onChange={e => onEmbedChange(normalizeMapEmbed(e.target.value) ?? e.target.value)} />
    <p className="text-xs leading-relaxed text-slate-500">Trên Google Maps, chọn địa điểm → Chia sẻ → Nhúng bản đồ → Sao chép HTML, rồi dán vào ô trên.</p>
    <Input label="Liên kết Google Maps để chỉ đường (tùy chọn)" value={mapsUrl} disabled={disabled}
      placeholder="https://maps.app.goo.gl/..." onChange={e => onMapsChange(e.target.value)} />
    {invalid && <p role="alert" className="text-sm text-rose-700">Liên kết bản đồ chưa hợp lệ. URL nhúng khác với liên kết chia sẻ thông thường.</p>}
    {embed && <LocationMap address={address} mapEmbedUrl={embed} mapsUrl={mapsUrl} />}
  </div>;
}
