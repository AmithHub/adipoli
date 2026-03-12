import { useMemo, useState } from "react";
import { DrinkCard } from "../components/DrinkCard";
import { SearchBar } from "../components/SearchBar";
import type { DrinkFilters, Route } from "../types";
import { filterDrinks, getCategories } from "../services/drinkService";

interface CatalogPageProps {
  query?: string;
  onNavigate: (route: Route) => void;
}

const defaultFilters: DrinkFilters = {
  category: "All",
  priceRange: "All",
  minRating: "All",
};

export function CatalogPage({ query = "", onNavigate }: CatalogPageProps) {
  const [filters, setFilters] = useState<DrinkFilters>(defaultFilters);
  const categories = getCategories();

  const filteredDrinks = useMemo(
    () => filterDrinks(query, filters),
    [filters, query],
  );

  return (
    <div className="page">
      <section className="page-header-card">
        <p className="eyebrow">Browse the shelf</p>
        <h1>Drink Catalog</h1>
        <p className="hero-copy">
          Filter by category, budget, and rating to find a solid pick fast.
        </p>
        <SearchBar
          initialValue={query}
          onSearch={(nextQuery) => onNavigate({ name: "catalog", query: nextQuery })}
        />
      </section>

      <section className="filter-panel">
        <label>
          Category
          <select
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value as DrinkFilters["category"],
              }))
            }
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Price range
          <select
            value={filters.priceRange}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                priceRange: event.target.value as DrinkFilters["priceRange"],
              }))
            }
          >
            <option>All</option>
            <option>Under 500</option>
            <option>500-1000</option>
            <option>1000-2000</option>
            <option>2000+</option>
          </select>
        </label>

        <label>
          Rating
          <select
            value={filters.minRating}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                minRating: event.target.value as DrinkFilters["minRating"],
              }))
            }
          >
            <option>All</option>
            <option>4.0+</option>
            <option>4.3+</option>
            <option>4.5+</option>
          </select>
        </label>
      </section>

      <section className="catalog-grid">
        {filteredDrinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            onSelect={(drinkId) => onNavigate({ name: "detail", drinkId })}
          />
        ))}
      </section>
    </div>
  );
}
