import type { Route } from "../types";
import { DrinkCard } from "../components/DrinkCard";
import { SearchBar } from "../components/SearchBar";
import { SectionHeader } from "../components/SectionHeader";
import { getTopRatedDrinks, getTrendingDrinks } from "../services/drinkService";

interface HomePageProps {
  onNavigate: (route: Route) => void;
}

const quickActions: Array<{ label: string; route: Route }> = [
  { label: "Help me choose", route: { name: "catalog", query: "smooth" } },
  { label: "Top rated drinks", route: { name: "catalog", query: "top rated" } },
  { label: "Best under ₹1000", route: { name: "catalog", query: "under 1000" } },
  { label: "Swipe drinks", route: { name: "swipe" } },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const trending = getTrendingDrinks();
  const topRated = getTopRatedDrinks();

  return (
    <div className="page page-home">
      <section className="hero-card">
        <p className="eyebrow">Your buddy inside the liquor shop</p>
        <h1>Adipoli</h1>
        <p className="hero-copy">
          Open the app, check a few trusted scores, and decide what to buy in
          under 10 seconds.
        </p>
        <SearchBar onSearch={(query) => onNavigate({ name: "catalog", query })} />
      </section>

      <section className="quick-actions-grid">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="quick-action-button"
            onClick={() => onNavigate(action.route)}
          >
            {action.label}
          </button>
        ))}
      </section>

      <section>
        <SectionHeader
          title="Trending drinks"
          subtitle="Popular Kerala picks right now"
          actionLabel="See all"
          onAction={() => onNavigate({ name: "catalog" })}
        />
        <div className="card-list">
          {trending.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              onSelect={(drinkId) => onNavigate({ name: "detail", drinkId })}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Top rated drinks"
          subtitle="Community favorites for smooth buying decisions"
          actionLabel="Browse"
          onAction={() => onNavigate({ name: "catalog", query: "4.3+" })}
        />
        <div className="card-list">
          {topRated.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              onSelect={(drinkId) => onNavigate({ name: "detail", drinkId })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
