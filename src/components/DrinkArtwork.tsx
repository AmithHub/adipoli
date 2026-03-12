import type { Drink } from "../types";

interface DrinkArtworkProps {
  drink: Drink;
}

export function DrinkArtwork({ drink }: DrinkArtworkProps) {
  const isBeer = drink.category === "Beer";

  return (
    <div
      className={`drink-artwork ${isBeer ? "beer-artwork" : "bottle-artwork"}`}
      style={{ background: drink.imageAccent }}
      aria-hidden="true"
    >
      <div className="art-glow" />
      <div className="drink-vessel">
        <div className="drink-vessel-cap" />
        <div className="drink-vessel-label">{drink.category}</div>
      </div>
      <div className="art-caption">{drink.name}</div>
    </div>
  );
}
