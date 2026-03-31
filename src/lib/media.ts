import type { SpotMediaItem } from "@/types";

const S3_BUCKET = "lhj-spotline-assets-2026";
const S3_REGION = "ap-northeast-2";

export function getMediaUrl(s3Key: string): string {
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${s3Key}`;
}

export function isVideoMedia(item: SpotMediaItem): boolean {
  return item.mediaType === "VIDEO";
}

export function formatDuration(sec: number | null): string {
  if (!sec) return "0:00";
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
