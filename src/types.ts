export type DrinkCategory = "Whisky" | "Rum" | "Brandy" | "Vodka" | "Beer" | "Gin";

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
  username?: string;
  overall: number;
  taste: number;
  smoothness: number;
  value: number;
  hangover: number;
  comment: string;
  wouldBuyAgain: boolean;
  dateSubmitted?: string;
  status?: "approved" | "hidden";
}

export interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  price: number;
  bottleSize?: string;
  abv?: number;
  rating: number;
  hangoverScore: number;
  taste: number;
  smoothness: number;
  valueForMoney: number;
  description: string;
  tags: DrinkTag[];
  trending: boolean;
  featured?: boolean;
  topRated?: boolean;
  bestValue?: boolean;
  lowHangover?: boolean;
  imageAccent: string;
  imageUrl?: string;
  createdAt?: string;
  reviews: Review[];
}

export interface DrinkFilters {
  category: "All" | DrinkCategory;
  priceRange: "All" | "Under 500" | "500-1000" | "1000-2000" | "2000+";
  minRating: "All" | "4.0+" | "4.3+" | "4.5+";
}

export interface UserProfile {
  username: string;
  email: string;
}

export type AdminSection =
  | "dashboard"
  | "drinks"
  | "images"
  | "reviews"
  | "categories"
  | "leaderboards"
  | "content";

export type Route =
  | { name: "home" }
  | { name: "catalog"; query?: string }
  | { name: "detail"; drinkId: string }
  | { name: "swipe" }
  | { name: "leaderboards" }
  | { name: "profile" }
  | { name: "admin"; section: AdminSection };
