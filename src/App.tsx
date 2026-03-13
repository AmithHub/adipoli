import { useEffect, useState } from "react";
import { AgeGate } from "./components/AgeGate";
import { AppShell } from "./components/AppShell";
import { ProfileAuthModal } from "./components/ProfileAuthModal";
import { SplashScreen } from "./components/SplashScreen";
import { CatalogPage } from "./pages/CatalogPage";
import { DrinkDetailPage } from "./pages/DrinkDetailPage";
import { HomePage } from "./pages/HomePage";
import { LeaderboardsPage } from "./pages/LeaderboardsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SwipePage } from "./pages/SwipePage";
import { usePersistentState } from "./hooks/usePersistentState";
import { navigateTo, parseHashRoute } from "./lib/router";
import {
  getAgeVerified,
  getAuthenticated,
  getLikedDrinks,
  getProfilePromptDismissals,
  getProfilePromptSwipeCount,
  getTriedDrinks,
  getUserProfile,
  setAgeVerified,
  setAuthenticated,
  setLikedDrinks,
  setProfilePromptDismissals,
  setProfilePromptSwipeCount,
  setTriedDrinks,
  setUserProfile,
} from "./lib/storage";
import type { Route, UserProfile } from "./types";

export function App() {
  const [showSplash, setShowSplash] = useState(true);
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
  const [isAuthenticated, setIsAuthenticated] = usePersistentState(
    getAuthenticated,
    setAuthenticated,
  );
  const [userProfile, setUserProfileState] = usePersistentState(
    getUserProfile,
    setUserProfile,
  );
  const [profilePromptDismissals, setProfilePromptDismissalsState] = usePersistentState(
    getProfilePromptDismissals,
    setProfilePromptDismissals,
  );
  const [profilePromptSwipeCount, setProfilePromptSwipeCountState] = usePersistentState(
    getProfilePromptSwipeCount,
    setProfilePromptSwipeCount,
  );
  const [route, setRoute] = useState<Route>(parseHashRoute);
  const [swipeOverlayOpen, setSwipeOverlayOpen] = useState(ageVerified);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const syncRoute = () => setRoute(parseHashRoute());
    window.addEventListener("hashchange", syncRoute);
    syncRoute();
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowSplash(false), 6000);
    return () => window.clearTimeout(timeout);
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

    setSwipeOverlayOpen(false);
    navigateTo(nextRoute);
    setRoute(nextRoute);
  }

  let page;

  if (route.name === "home") {
    page = <HomePage onNavigate={handleNavigate} />;
  } else if (route.name === "catalog") {
    page = <CatalogPage query={route.query} onNavigate={handleNavigate} />;
  } else if (route.name === "detail") {
    page = (
      <DrinkDetailPage
        drinkId={route.drinkId}
        likedDrinks={likedDrinks}
        onNavigate={handleNavigate}
        onToggleLike={(drinkId) =>
          setLikedDrinksState((current) =>
            current.includes(drinkId)
              ? current.filter((id) => id !== drinkId)
              : [...current, drinkId],
          )
        }
      />
    );
  } else if (route.name === "leaderboards") {
    page = <LeaderboardsPage onNavigate={handleNavigate} />;
  } else if (route.name === "profile") {
    page = (
      <ProfilePage
        profile={userProfile}
        isAuthenticated={isAuthenticated}
        triedDrinks={triedDrinks}
        likedDrinks={likedDrinks}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onRemoveTried={(drinkId) =>
          setTriedDrinksState((current) => current.filter((id) => id !== drinkId))
        }
        onRemoveLiked={(drinkId) =>
          setLikedDrinksState((current) => current.filter((id) => id !== drinkId))
        }
      />
    );
  } else {
    page = <HomePage onNavigate={handleNavigate} />;
  }

  if (!ageVerified) {
    if (showSplash) {
      return <SplashScreen />;
    }

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

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      <AppShell route={route} isSwipeOpen={swipeOverlayOpen} onNavigate={handleNavigate}>
        {page}
      </AppShell>
      {swipeOverlayOpen ? (
        <SwipePage
          isAuthenticated={isAuthenticated}
          profilePromptDismissals={profilePromptDismissals}
          profilePromptSwipeCount={profilePromptSwipeCount}
          triedDrinks={triedDrinks}
          likedDrinks={likedDrinks}
          onClose={() => setSwipeOverlayOpen(false)}
          onOpenAuth={() => setAuthModalOpen(true)}
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
          onProfilePromptDismiss={() =>
            setProfilePromptDismissalsState((current) => current + 1)
          }
          onProfilePromptSwipeCountChange={(count) => setProfilePromptSwipeCountState(count)}
        />
      ) : null}
      {authModalOpen ? (
        <ProfileAuthModal
          onClose={() => setAuthModalOpen(false)}
          onSubmit={(profile: UserProfile) => {
            setUserProfileState(profile);
            setIsAuthenticated(true);
            setAuthModalOpen(false);
            navigateTo({ name: "profile" });
            setRoute({ name: "profile" });
          }}
        />
      ) : null}
    </>
  );
}
