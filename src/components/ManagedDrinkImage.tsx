import { useEffect, useState } from "react";
import beerImage from "../assets/drinks/beer.svg";
import brandyImage from "../assets/drinks/brandy.svg";
import rumImage from "../assets/drinks/rum.svg";
import vodkaImage from "../assets/drinks/vodka.svg";
import whiskyImage from "../assets/drinks/whisky.svg";
import ginImage from "../assets/drinks/vodka.svg";
import { getDrinkImageAsset } from "../lib/imageStore";
import { getDrinkImageVersion, isManagedImageToken } from "../services/cmsService";
import type { Drink } from "../types";

interface ManagedDrinkImageProps {
  drink: Drink;
  className?: string;
  alt?: string;
}

const artworkByCategory = {
  Whisky: whiskyImage,
  Rum: rumImage,
  Brandy: brandyImage,
  Vodka: vodkaImage,
  Beer: beerImage,
  Gin: ginImage,
} as const;

export function ManagedDrinkImage({
  drink,
  className,
  alt = "",
}: ManagedDrinkImageProps) {
  const fallback = artworkByCategory[drink.category];
  const directImageUrl = isManagedImageToken(drink.imageUrl) ? "" : drink.imageUrl || "";
  const [src, setSrc] = useState(() =>
    directImageUrl || fallback,
  );

  useEffect(() => {
    let cancelled = false;
    const version = getDrinkImageVersion(drink.id);

    if (!version) {
      setSrc(directImageUrl || fallback);
      return () => {
        cancelled = true;
      };
    }

    getDrinkImageAsset(drink.id)
      .then((image) => {
        if (cancelled) {
          return;
        }
        setSrc(image || directImageUrl || fallback);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setSrc(directImageUrl || fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [directImageUrl, drink.id, fallback]);

  return <img className={className} src={src} alt={alt} />;
}
