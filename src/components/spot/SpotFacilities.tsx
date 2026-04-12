import { Car, Wifi, Dog, Truck, Package, Calendar, Cigarette, Baby, type LucideIcon } from "lucide-react";

interface SpotFacilitiesProps {
  facilities: string[];
}

const FACILITY_MAP: Record<string, { icon: LucideIcon; label: string }> = {
  parking: { icon: Car, label: "주차" },
  wifi: { icon: Wifi, label: "와이파이" },
  pet: { icon: Dog, label: "반려동물" },
  delivery: { icon: Truck, label: "배달" },
  takeout: { icon: Package, label: "포장" },
  reservation: { icon: Calendar, label: "예약" },
  smokingroom: { icon: Cigarette, label: "흡연실" },
  nursery: { icon: Baby, label: "수유실" },
};

export default function SpotFacilities({ facilities }: SpotFacilitiesProps) {
  const mapped = facilities
    .map((f) => ({ key: f, ...FACILITY_MAP[f] }))
    .filter((f) => f.icon);

  if (mapped.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {mapped.map(({ key, icon: Icon, label }) => (
          <span
            key={key}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
