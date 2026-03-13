const AGE_KEY = "adipoli-age-verified";
const TRIED_KEY = "adipoli-tried-drinks";
const LIKED_KEY = "adipoli-liked-drinks";
const SWIPE_HINT_DISMISSED_KEY = "adipoli-swipe-hint-dismissed";

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
