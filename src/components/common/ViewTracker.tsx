"use client";

import { useEffect } from "react";
import { incrementSpotView, incrementSpotLineView } from "@/lib/api";

interface ViewTrackerProps {
  type: "spot" | "spotline";
  id: string;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
  useEffect(() => {
    if (type === "spot") {
      incrementSpotView(id);
    } else {
      incrementSpotLineView(id);
    }
  }, [type, id]);

  return null;
}
