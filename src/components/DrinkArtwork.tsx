import type { Drink } from "../types";
import { ManagedDrinkImage } from "./ManagedDrinkImage";

interface DrinkArtworkProps {
  drink: Drink;
  hideCaption?: boolean;
}

export function DrinkArtwork({ drink, hideCaption = false }: DrinkArtworkProps) {
  return (
    <div className="drink-artwork" aria-hidden="true">
      <ManagedDrinkImage drink={drink} className="drink-artwork-image" />
      <div className="drink-artwork-sheen" />
      <div className="drink-artwork-chip">{drink.category}</div>
      {hideCaption ? null : <div className="art-caption">{drink.name}</div>}
    </div>
  );
}
