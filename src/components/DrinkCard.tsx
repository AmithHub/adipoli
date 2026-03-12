import type { Drink } from "../types";
import { DrinkArtwork } from "./DrinkArtwork";

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drinkId: string) => void;
}

export function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  return (
    <button className="drink-card" onClick={() => onSelect(drink.id)}>
      <DrinkArtwork drink={drink} />
      <div className="drink-card-body">
        <div className="title-row">
          <h3>{drink.name}</h3>
          <span className="rating-pill">{drink.rating.toFixed(1)}</span>
        </div>
        <p className="muted-line">
          {drink.category} • ₹{drink.price}
        </p>
        <div className="stats-row">
          <span>Hangover {drink.hangoverScore}/10</span>
          <span>{drink.tags[0]}</span>
        </div>
      </div>
    </button>
  );
}
