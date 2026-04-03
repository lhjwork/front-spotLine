"use client";

import { useEffect } from "react";
import { incrementSpotView, incrementRouteView } from "@/lib/api";

interface ViewTrackerProps {
  type: "spot" | "route";
  id: string;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
  useEffect(() => {
    if (type === "spot") {
      incrementSpotView(id);
    } else {
      incrementRouteView(id);
    }
  }, [type, id]);

  return null;
}
