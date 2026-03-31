import { Compass, MapPin } from "lucide-react";

interface EmptyFeedProps {
  type: "spot" | "route";
  onResetArea?: () => void;
}

const config = {
  spot: {
    icon: Compass,
    message: "이 지역에 Spot이 아직 없어요",
  },
  route: {
    icon: MapPin,
    message: "이 지역에 Route가 아직 없어요",
  },
} as const;

export default function EmptyFeed({ type, onResetArea }: EmptyFeedProps) {
  const { icon: Icon, message } = config[type];

  return (
    <div className="px-4 py-16 text-center">
      <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
      <p className="mb-1 text-sm font-medium text-gray-600">{message}</p>
      {onResetArea && (
        <button
          onClick={onResetArea}
          className="mt-4 rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          전체 지역 보기
        </button>
      )}
    </div>
  );
}
