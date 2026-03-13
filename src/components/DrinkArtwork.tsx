import type { Drink } from "../types";
import beerImage from "../assets/drinks/beer.svg";
import brandyImage from "../assets/drinks/brandy.svg";
import rumImage from "../assets/drinks/rum.svg";
import vodkaImage from "../assets/drinks/vodka.svg";
import whiskyImage from "../assets/drinks/whisky.svg";

interface DrinkArtworkProps {
  drink: Drink;
  hideCaption?: boolean;
}

const artworkByCategory = {
  Whisky: whiskyImage,
  Rum: rumImage,
  Brandy: brandyImage,
  Vodka: vodkaImage,
  Beer: beerImage,
} as const;

export function DrinkArtwork({ drink, hideCaption = false }: DrinkArtworkProps) {
  return (
    <div className="drink-artwork" aria-hidden="true">
      <img
        className="drink-artwork-image"
        src={artworkByCategory[drink.category]}
        alt=""
      />
      <div className="drink-artwork-sheen" />
      <div className="drink-artwork-chip">{drink.category}</div>
      {hideCaption ? null : <div className="art-caption">{drink.name}</div>}
    </div>
  );
}
