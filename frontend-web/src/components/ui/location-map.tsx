import { MapPin, Navigation } from "lucide-react";
import { directionsUrl, normalizeMapEmbed } from "@/lib/map-location";

interface Props { address?: string | null; mapEmbedUrl?: string | null; mapsUrl?: string | null }

export function LocationMap({ address, mapEmbedUrl, mapsUrl }: Props) {
  if (!address?.trim()) return <p className="text-sm text-slate-500">Địa chỉ văn phòng đang được cập nhật.</p>;
  const embed = mapEmbedUrl && normalizeMapEmbed(mapEmbedUrl);
  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
        <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />{address}
      </p>
      {embed && <iframe title={`Bản đồ: ${address}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full rounded-2xl border border-slate-200 bg-slate-50" allowFullScreen />}
      <a href={directionsUrl(address, mapsUrl)} target="_blank" rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-800 hover:bg-sky-100">
        <Navigation aria-hidden className="h-4 w-4" />Chỉ đường
      </a>
    </div>
  );
}
