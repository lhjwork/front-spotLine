const ONBOARDING_KEY = "spotline_onboarding_completed";

export function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDING_KEY) !== "true";
  } catch {
    return true;
  }
}

export function completeOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    // localStorage unavailable (private browsing)
  }
}
