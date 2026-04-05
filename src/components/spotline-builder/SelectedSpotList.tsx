"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { MapPin } from "lucide-react";
import { useSpotLineBuilderStore } from "@/store/useSpotLineBuilderStore";
import SelectedSpotCard from "./SelectedSpotCard";

export default function SelectedSpotList() {
  const spots = useSpotLineBuilderStore((s) => s.spots);
  const reorderSpots = useSpotLineBuilderStore((s) => s.reorderSpots);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSpots(active.id as string, over.id as string);
    }
  };

  if (spots.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-gray-400">
        <MapPin className="h-10 w-10" />
        <p className="text-sm">Spot을 검색해서 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-0 overflow-y-auto px-4 pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={spots.map((s) => s.spot.id)}
          strategy={verticalListSortingStrategy}
        >
          {spots.map((s, i) => (
            <SelectedSpotCard
              key={s.spot.id}
              builderSpot={s}
              index={i}
              isLast={i === spots.length - 1}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
