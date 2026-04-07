"use client";

import { useEffect } from "react";
import { incrementSpotView, incrementSpotLineView, incrementBlogView } from "@/lib/api";

interface ViewTrackerProps {
  type: "spot" | "spotline" | "blog";
  id: string;
}

export default function ViewTracker({ type, id }: ViewTrackerProps) {
  useEffect(() => {
    if (type === "spot") {
      incrementSpotView(id);
    } else if (type === "spotline") {
      incrementSpotLineView(id);
    } else {
      incrementBlogView(id);
    }
  }, [type, id]);

  return null;
}
