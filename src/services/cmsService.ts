import { drinks as seedDrinks } from "../data/drinks";
import {
  deleteDrinkImageAsset,
  saveDrinkImageAsset,
} from "../lib/imageStore";
import {
  getProfilePromptSwipeCount,
  setProfilePromptSwipeCount,
} from "../lib/storage";
import type { AdminSection, Drink, DrinkCategory, DrinkTag, Review } from "../types";

const CMS_DRINKS_KEY = "adipoli-cms-drinks";
const CMS_IMAGES_KEY = "adipoli-cms-images";
const ADMIN_SESSION_KEY = "adipoli-admin-session";
const ADMIN_EMAIL = "admin@adipoli.app";
const ADMIN_PASSWORD = "adipoli123";
const CMS_UPDATED_EVENT = "adipoli-cms-updated";

export interface AdminReviewRecord extends Review {
  drinkId: string;
  drinkName: string;
}

export interface AdminDashboardStats {
  totalDrinks: number;
  totalReviews: number;
  totalSwipeInteractions: number;
  topRatedDrinks: Drink[];
  recentDrinks: Drink[];
}

function ensureDrinkDefaults(drink: Drink, index: number): Drink {
  return {
    ...drink,
    bottleSize: drink.bottleSize ?? (drink.category === "Beer" ? "650 ml" : "750 ml"),
    abv:
      drink.abv ??
      ({
        Whisky: 42.8,
        Rum: 42.8,
        Brandy: 42.8,
        Vodka: 42.8,
        Beer: 8,
        Gin: 42.8,
      } satisfies Record<DrinkCategory, number>)[drink.category],
    featured: drink.featured ?? drink.trending,
    topRated: drink.topRated ?? drink.rating >= 4.3,
    bestValue: drink.bestValue ?? drink.valueForMoney >= 4.4,
    lowHangover: drink.lowHangover ?? drink.hangoverScore <= 4,
    createdAt:
      drink.createdAt ??
      new Date(Date.UTC(2026, 0, Math.max(1, index + 1))).toISOString(),
    reviews: drink.reviews.map((review, reviewIndex) => ({
      ...review,
      username: review.username ?? review.author,
      status: review.status ?? "approved",
      dateSubmitted:
        review.dateSubmitted ??
        new Date(Date.UTC(2026, 1, Math.max(1, index + reviewIndex + 1))).toISOString(),
    })),
  };
}

function getSeedDrinks(): Drink[] {
  return seedDrinks.map(ensureDrinkDefaults);
}

function getCmsImages(): Record<string, number> {
  const raw = window.localStorage.getItem(CMS_IMAGES_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function setCmsImages(images: Record<string, number>): void {
  window.localStorage.setItem(CMS_IMAGES_KEY, JSON.stringify(images));
}

export function buildManagedImageToken(drinkId: string, version: number): string {
  return `cms-image:${drinkId}:${version}`;
}

export function isManagedImageToken(imageUrl?: string): boolean {
  return Boolean(imageUrl?.startsWith("cms-image:"));
}

export function getCmsDrinks(): Drink[] {
  const raw = window.localStorage.getItem(CMS_DRINKS_KEY);
  const images = getCmsImages();
  let imagesUpdated = false;

  if (!raw) {
    const seeded = getSeedDrinks();
    setCmsDrinks(seeded);
    return seeded.map((drink) => ({
      ...drink,
      imageUrl:
        (images[drink.id] ? buildManagedImageToken(drink.id, images[drink.id]) : "") ||
        (!isManagedImageToken(drink.imageUrl) ? drink.imageUrl : ""),
    }));
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const normalizedDrinks = parsed.map((drink, index) => {
        const normalized = ensureDrinkDefaults(drink as Drink, index);
        if (normalized.imageUrl && !images[normalized.id]) {
          if (isManagedImageToken(normalized.imageUrl)) {
            const version = Number(normalized.imageUrl.split(":").pop());
            images[normalized.id] = Number.isFinite(version) ? version : Date.now();
            imagesUpdated = true;
          }
        }

        const directImageUrl = !isManagedImageToken(normalized.imageUrl)
          ? normalized.imageUrl || ""
          : "";

        return {
          ...normalized,
          imageUrl:
            (images[normalized.id]
              ? buildManagedImageToken(normalized.id, images[normalized.id])
              : "") || directImageUrl,
        };
      });

      if (imagesUpdated) {
        setCmsImages(images);
      }

      return normalizedDrinks;
    }
  } catch {
    return getSeedDrinks();
  }

  return getSeedDrinks().map((drink) => ({
    ...drink,
    imageUrl:
      (images[drink.id] ? buildManagedImageToken(drink.id, images[drink.id]) : "") ||
      (!isManagedImageToken(drink.imageUrl) ? drink.imageUrl : ""),
  }));
}

export function setCmsDrinks(drinks: Drink[]): void {
  window.localStorage.setItem(CMS_DRINKS_KEY, JSON.stringify(drinks));
  window.dispatchEvent(new Event(CMS_UPDATED_EVENT));
}

export function subscribeToCmsUpdates(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CMS_DRINKS_KEY) {
      onChange();
    }
  };

  window.addEventListener(CMS_UPDATED_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CMS_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getDashboardStats(): AdminDashboardStats {
  const drinks = getCmsDrinks();
  const reviews = getAllReviews();

  return {
    totalDrinks: drinks.length,
    totalReviews: reviews.length,
    totalSwipeInteractions: getProfilePromptSwipeCount(),
    topRatedDrinks: [...drinks].sort((a, b) => b.rating - a.rating).slice(0, 4),
    recentDrinks: [...drinks]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      )
      .slice(0, 4),
  };
}

export function getAllReviews(): AdminReviewRecord[] {
  return getCmsDrinks().flatMap((drink) =>
    drink.reviews.map((review) => ({
      ...review,
      drinkId: drink.id,
      drinkName: drink.name,
    })),
  );
}

export function saveDrink(drink: Drink): Drink[] {
  const current = getCmsDrinks();
  const next = current.some((item) => item.id === drink.id)
    ? current.map((item) => (item.id === drink.id ? drink : item))
    : [{ ...drink, createdAt: drink.createdAt ?? new Date().toISOString() }, ...current];

  setCmsDrinks(next);
  return next;
}

export function deleteDrink(drinkId: string): Drink[] {
  const next = getCmsDrinks().filter((drink) => drink.id !== drinkId);
  setCmsDrinks(next);
  return next;
}

export async function updateDrinkImage(drinkId: string, imageUrl?: string): Promise<Drink[]> {
  const images = getCmsImages();
  const normalizedImage = imageUrl || "";

  if (normalizedImage) {
    await saveDrinkImageAsset(drinkId, normalizedImage);
    images[drinkId] = Date.now();
  } else {
    await deleteDrinkImageAsset(drinkId);
    delete images[drinkId];
  }

  setCmsImages(images);

  const next = getCmsDrinks().map((drink) =>
    drink.id === drinkId
      ? {
          ...drink,
          imageUrl: normalizedImage,
        }
      : drink,
  );
  setCmsDrinks(next);
  return next;
}

export function getDrinkImageVersion(drinkId: string): number {
  return getCmsImages()[drinkId] || 0;
}

export function updateReviewStatus(
  drinkId: string,
  reviewId: string,
  status: "approved" | "hidden",
): Drink[] {
  const next = getCmsDrinks().map((drink) =>
    drink.id === drinkId
      ? {
          ...drink,
          reviews: drink.reviews.map((review) =>
            review.id === reviewId ? { ...review, status } : review,
          ),
        }
      : drink,
  );
  setCmsDrinks(next);
  return next;
}

export function deleteReview(drinkId: string, reviewId: string): Drink[] {
  const next = getCmsDrinks().map((drink) =>
    drink.id === drinkId
      ? {
          ...drink,
          reviews: drink.reviews.filter((review) => review.id !== reviewId),
        }
      : drink,
  );
  setCmsDrinks(next);
  return next;
}

export function getAdminSession(): boolean {
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminSession(value: boolean): void {
  window.localStorage.setItem(ADMIN_SESSION_KEY, String(value));
}

export function authenticateAdmin(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === ADMIN_EMAIL && password.trim() === ADMIN_PASSWORD;

  if (ok) {
    setAdminSession(true);
  }

  return ok;
}

export function logoutAdmin(): void {
  setAdminSession(false);
}

export function buildEmptyDrink(): Drink {
  return ensureDrinkDefaults(
    {
      id: `drink-${Date.now()}`,
      name: "",
      category: "Whisky",
      price: 0,
      bottleSize: "750 ml",
      abv: 42.8,
      rating: 4,
      hangoverScore: 5,
      taste: 4,
      smoothness: 4,
      valueForMoney: 4,
      description: "",
      tags: ["smooth"],
      trending: false,
      featured: false,
      topRated: false,
      bestValue: false,
      lowHangover: false,
      imageAccent: "linear-gradient(135deg, #f6c453 0%, #7c3f00 100%)",
      imageUrl: "",
      reviews: [],
      createdAt: new Date().toISOString(),
    },
    0,
  );
}

export function getAdminSections(): Array<{
  key: AdminSection;
  label: string;
  ready: boolean;
}> {
  return [
    { key: "dashboard", label: "Dashboard", ready: true },
    { key: "drinks", label: "Drinks", ready: true },
    { key: "images", label: "Images", ready: true },
    { key: "reviews", label: "Reviews", ready: true },
    { key: "categories", label: "Categories", ready: false },
    { key: "leaderboards", label: "Leaderboards", ready: false },
    { key: "content", label: "Content", ready: false },
  ];
}

export function getManagedCategories(): DrinkCategory[] {
  const categories = new Set<DrinkCategory>(["Whisky", "Rum", "Brandy", "Vodka", "Beer", "Gin"]);
  getCmsDrinks().forEach((drink) => categories.add(drink.category));
  return [...categories];
}

export function normalizeTags(tags: string): DrinkTag[] {
  return tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .map((tag) => tag.replace(/\s+/g, "-")) as DrinkTag[];
}

export function seedSwipeInteractions(count: number): void {
  setProfilePromptSwipeCount(count);
}
