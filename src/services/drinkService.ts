import { categories } from "../data/drinks";
import { getCmsDrinks } from "./cmsService";
import type { Drink, DrinkFilters, DrinkTag } from "../types";

export function getAllDrinks(): Drink[] {
  return getCmsDrinks();
}

export function getCategories() {
  const dynamic = getAllDrinks().map((drink) => drink.category);
  return ["All", ...new Set([...categories.slice(1), ...dynamic])] as typeof categories;
}

export function getDrinkById(drinkId: string): Drink | undefined {
  const drink = getAllDrinks().find((item) => item.id === drinkId);
  if (!drink) {
    return undefined;
  }

  return {
    ...drink,
    reviews: drink.reviews.filter((review) => review.status !== "hidden"),
  };
}

export function getTrendingDrinks(limit = 4): Drink[] {
  return getAllDrinks()
    .filter((drink) => drink.trending || drink.featured)
    .slice(0, limit);
}

export function getTopRatedDrinks(limit = 4): Drink[] {
  return [...getAllDrinks()].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function filterDrinks(query: string, filters: DrinkFilters): Drink[] {
  const normalizedQuery = query.toLowerCase().trim();

  return getAllDrinks().filter((drink) => {
    const matchesQuery =
      !normalizedQuery ||
      drink.name.toLowerCase().includes(normalizedQuery) ||
      drink.category.toLowerCase().includes(normalizedQuery) ||
      drink.tags.some((tag) => tag.includes(normalizedQuery)) ||
      drink.description.toLowerCase().includes(normalizedQuery) ||
      (normalizedQuery === "top rated" && drink.rating >= 4.3) ||
      (normalizedQuery === "under 1000" && drink.price < 1000) ||
      (normalizedQuery === "smooth" && drink.tags.includes("smooth")) ||
      matchesTagPhrase(drink.tags, normalizedQuery);

    const matchesCategory =
      filters.category === "All" || drink.category === filters.category;

    const matchesPrice =
      filters.priceRange === "All" ||
      (filters.priceRange === "Under 500" && drink.price < 500) ||
      (filters.priceRange === "500-1000" &&
        drink.price >= 500 &&
        drink.price <= 1000) ||
      (filters.priceRange === "1000-2000" &&
        drink.price > 1000 &&
        drink.price <= 2000) ||
      (filters.priceRange === "2000+" && drink.price > 2000);

    const matchesRating =
      filters.minRating === "All" ||
      (filters.minRating === "4.0+" && drink.rating >= 4.0) ||
      (filters.minRating === "4.3+" && drink.rating >= 4.3) ||
      (filters.minRating === "4.5+" && drink.rating >= 4.5);

    return matchesQuery && matchesCategory && matchesPrice && matchesRating;
  });
}

function matchesTagPhrase(tags: DrinkTag[], query: string): boolean {
  return tags.some((tag) => tag.replace("-", " ").includes(query));
}
