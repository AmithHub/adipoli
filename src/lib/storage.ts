import type { UserProfile } from "../types";

const AGE_KEY = "adipoli-age-verified";
const TRIED_KEY = "adipoli-tried-drinks";
const LIKED_KEY = "adipoli-liked-drinks";
const SWIPE_HINT_DISMISSED_KEY = "adipoli-swipe-hint-dismissed";
const USER_PROFILE_KEY = "adipoli-user-profile";
const AUTHENTICATED_KEY = "adipoli-authenticated";
const PROFILE_PROMPT_DISMISSALS_KEY = "adipoli-profile-prompt-dismissals";
const PROFILE_PROMPT_SWIPE_COUNT_KEY = "adipoli-profile-prompt-swipe-count";
const SPLASH_SEEN_KEY = "adipoli-splash-seen-session";
const DISCOVER_INTRO_SEEN_KEY = "adipoli-discover-intro-seen";

export function getAgeVerified(): boolean {
  return window.localStorage.getItem(AGE_KEY) === "true";
}

export function setAgeVerified(value: boolean): void {
  window.localStorage.setItem(AGE_KEY, String(value));
}

export function getTriedDrinks(): string[] {
  const raw = window.localStorage.getItem(TRIED_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setTriedDrinks(drinkIds: string[]): void {
  window.localStorage.setItem(TRIED_KEY, JSON.stringify(drinkIds));
}

export function getLikedDrinks(): string[] {
  const raw = window.localStorage.getItem(LIKED_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLikedDrinks(drinkIds: string[]): void {
  window.localStorage.setItem(LIKED_KEY, JSON.stringify(drinkIds));
}

export function getSwipeHintDismissed(): boolean {
  return window.localStorage.getItem(SWIPE_HINT_DISMISSED_KEY) === "true";
}

export function setSwipeHintDismissed(value: boolean): void {
  window.localStorage.setItem(SWIPE_HINT_DISMISSED_KEY, String(value));
}

export function getUserProfile(): UserProfile | null {
  const raw = window.localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.username === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed as UserProfile;
    }
  } catch {
    return null;
  }

  return null;
}

export function setUserProfile(profile: UserProfile | null): void {
  if (!profile) {
    window.localStorage.removeItem(USER_PROFILE_KEY);
    return;
  }

  window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export function getAuthenticated(): boolean {
  return window.localStorage.getItem(AUTHENTICATED_KEY) === "true";
}

export function setAuthenticated(value: boolean): void {
  window.localStorage.setItem(AUTHENTICATED_KEY, String(value));
}

export function getProfilePromptDismissals(): number {
  const raw = window.localStorage.getItem(PROFILE_PROMPT_DISMISSALS_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setProfilePromptDismissals(value: number): void {
  window.localStorage.setItem(PROFILE_PROMPT_DISMISSALS_KEY, String(value));
}

export function getProfilePromptSwipeCount(): number {
  const raw = window.localStorage.getItem(PROFILE_PROMPT_SWIPE_COUNT_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setProfilePromptSwipeCount(value: number): void {
  window.localStorage.setItem(PROFILE_PROMPT_SWIPE_COUNT_KEY, String(value));
}

export function getSplashSeen(): boolean {
  return window.sessionStorage.getItem(SPLASH_SEEN_KEY) === "true";
}

export function setSplashSeen(value: boolean): void {
  window.sessionStorage.setItem(SPLASH_SEEN_KEY, String(value));
}

export function getDiscoverIntroSeen(): boolean {
  return window.localStorage.getItem(DISCOVER_INTRO_SEEN_KEY) === "true";
}

export function setDiscoverIntroSeen(value: boolean): void {
  window.localStorage.setItem(DISCOVER_INTRO_SEEN_KEY, String(value));
}
