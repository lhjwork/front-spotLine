import type { QrScanHistoryItem } from "@/types";

const STORAGE_KEY = "qr-scan-history";
const BANNER_DISMISSED_KEY = "qr-session-banner-dismissed";
const MAX_ITEMS = 50;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isStorageAvailable(): boolean {
  try {
    const key = "__qr_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function cleanExpired(items: QrScanHistoryItem[]): QrScanHistoryItem[] {
  const cutoff = Date.now() - TTL_MS;
  return items.filter((item) => new Date(item.scannedAt).getTime() > cutoff);
}

export function getQrScanHistory(): QrScanHistoryItem[] {
  if (!isStorageAvailable()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: QrScanHistoryItem[] = JSON.parse(raw);
    const cleaned = cleanExpired(items);
    if (cleaned.length !== items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function addQrScanToHistory(item: Omit<QrScanHistoryItem, "scannedAt">): void {
  if (!isStorageAvailable()) return;
  try {
    const items = getQrScanHistory();
    // Update timestamp if same spot already scanned
    const existingIdx = items.findIndex((i) => i.spotId === item.spotId);
    const newItem: QrScanHistoryItem = { ...item, scannedAt: new Date().toISOString() };
    if (existingIdx >= 0) {
      items[existingIdx] = newItem;
    } else {
      items.push(newItem);
    }
    // FIFO eviction
    const trimmed = items.length > MAX_ITEMS ? items.slice(items.length - MAX_ITEMS) : items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // graceful fail
  }
}

export function removeQrScanItem(spotId: string): void {
  if (!isStorageAvailable()) return;
  try {
    const items = getQrScanHistory();
    const filtered = items.filter((i) => i.spotId !== spotId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // graceful fail
  }
}

export function clearQrScanHistory(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // graceful fail
  }
}

export function getTodayScanCount(): number {
  const items = getQrScanHistory();
  const today = new Date().toDateString();
  return items.filter((i) => new Date(i.scannedAt).toDateString() === today).length;
}

export function isBannerDismissedToday(): boolean {
  if (!isStorageAvailable()) return true;
  try {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed) return false;
    return new Date(dismissed).toDateString() === new Date().toDateString();
  } catch {
    return false;
  }
}

export function dismissBannerToday(): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(BANNER_DISMISSED_KEY, new Date().toISOString());
  } catch {
    // graceful fail
  }
}
