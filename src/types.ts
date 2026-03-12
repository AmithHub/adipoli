export type DrinkCategory = "Whisky" | "Rum" | "Brandy" | "Vodka" | "Beer";

export type DrinkTag =
  | "smooth"
  | "beginner-friendly"
  | "strong"
  | "value pick"
  | "crowd favorite"
  | "party pick"
  | "low hangover";

export interface Review {
  id: string;
  author: string;
  overall: number;
  taste: number;
  smoothness: number;
  value: number;
  hangover: number;
  comment: string;
  wouldBuyAgain: boolean;
}

export interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  price: number;
  rating: number;
  hangoverScore: number;
  taste: number;
  smoothness: number;
  valueForMoney: number;
  description: string;
  tags: DrinkTag[];
  trending: boolean;
  imageAccent: string;
  reviews: Review[];
}

export interface DrinkFilters {
  category: "All" | DrinkCategory;
  priceRange: "All" | "Under 500" | "500-1000" | "1000-2000" | "2000+";
  minRating: "All" | "4.0+" | "4.3+" | "4.5+";
}

export type Route =
  | { name: "home" }
  | { name: "catalog"; query?: string }
  | { name: "detail"; drinkId: string }
  | { name: "swipe" };
