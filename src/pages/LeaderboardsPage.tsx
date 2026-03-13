import type { Route } from "../types";
import { DrinkCard } from "../components/DrinkCard";
import { SectionHeader } from "../components/SectionHeader";
import { getTopRatedDrinks, getTrendingDrinks } from "../services/drinkService";

interface LeaderboardsPageProps {
  onNavigate: (route: Route) => void;
}

export function LeaderboardsPage({ onNavigate }: LeaderboardsPageProps) {
  const topRated = getTopRatedDrinks(6);
  const trending = getTrendingDrinks(6);

  return (
    <div className="page">
      <section className="page-header-card">
        <p className="eyebrow">Leaderboard Preview</p>
        <h1>Top picks from the Adipoli crowd</h1>
        <p className="hero-copy">
          This MVP preview keeps the leaderboard easy to scan while we prepare the
          full ranking experience.
        </p>
      </section>

      <section>
        <SectionHeader
          title="Top rated drinks"
          subtitle="Highest rated bottles in the current mock data"
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

      <section>
        <SectionHeader
          title="Trending this week"
          subtitle="The bottles people keep checking first"
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
    </div>
  );
}
