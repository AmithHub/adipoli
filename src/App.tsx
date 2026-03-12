import { useEffect, useState } from "react";
import { AgeGate } from "./components/AgeGate";
import { AppShell } from "./components/AppShell";
import { CatalogPage } from "./pages/CatalogPage";
import { DrinkDetailPage } from "./pages/DrinkDetailPage";
import { HomePage } from "./pages/HomePage";
import { SwipePage } from "./pages/SwipePage";
import { usePersistentState } from "./hooks/usePersistentState";
import { navigateTo, parseHashRoute } from "./lib/router";
import {
  getAgeVerified,
  getLikedDrinks,
  getTriedDrinks,
  setAgeVerified,
  setLikedDrinks,
  setTriedDrinks,
} from "./lib/storage";
import type { Route } from "./types";

export function App() {
  const [ageVerified, setAgeVerifiedState] = usePersistentState(
    getAgeVerified,
    setAgeVerified,
  );
  const [triedDrinks, setTriedDrinksState] = usePersistentState(
    getTriedDrinks,
    setTriedDrinks,
  );
  const [likedDrinks, setLikedDrinksState] = usePersistentState(
    getLikedDrinks,
    setLikedDrinks,
  );
  const [route, setRoute] = useState<Route>(parseHashRoute);
  const [swipeOverlayOpen, setSwipeOverlayOpen] = useState(ageVerified);

  useEffect(() => {
    const syncRoute = () => setRoute(parseHashRoute());
    window.addEventListener("hashchange", syncRoute);
    syncRoute();
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    if (ageVerified) {
      setSwipeOverlayOpen(true);
    }
  }, [ageVerified]);

  function handleNavigate(nextRoute: Route) {
    if (nextRoute.name === "swipe") {
      setSwipeOverlayOpen(true);
      return;
    }

    navigateTo(nextRoute);
    setRoute(nextRoute);
  }

  let page;

  if (route.name === "home") {
    page = <HomePage onNavigate={handleNavigate} />;
  } else if (route.name === "catalog") {
    page = <CatalogPage query={route.query} onNavigate={handleNavigate} />;
  } else if (route.name === "detail") {
    page = <DrinkDetailPage drinkId={route.drinkId} onNavigate={handleNavigate} />;
  } else {
    page = <HomePage onNavigate={handleNavigate} />;
  }

  if (!ageVerified) {
    return (
      <AgeGate
        onConfirm={() => {
          setAgeVerifiedState(true);
          navigateTo({ name: "home" });
          setRoute({ name: "home" });
          setSwipeOverlayOpen(true);
        }}
      />
    );
  }

  return (
    <>
      <AppShell route={route} onNavigate={handleNavigate}>
        {page}
      </AppShell>
      {swipeOverlayOpen ? (
        <SwipePage
          triedDrinks={triedDrinks}
          likedDrinks={likedDrinks}
          onClose={() => setSwipeOverlayOpen(false)}
          onMarkTried={(drinkId) =>
            setTriedDrinksState((current) =>
              current.includes(drinkId) ? current : [...current, drinkId],
            )
          }
          onToggleLike={(drinkId) =>
            setLikedDrinksState((current) =>
              current.includes(drinkId)
                ? current.filter((id) => id !== drinkId)
                : [...current, drinkId],
            )
          }
        />
      ) : null}
    </>
  );
}
