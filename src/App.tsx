import { useEffect, useState } from "react";
import { AdminShell } from "./admin/AdminShell";
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
import { subscribeToCmsUpdates } from "./services/cmsService";
import { usePersistentState } from "./hooks/usePersistentState";
import { navigateTo, parseHashRoute } from "./lib/router";
import {
  getAgeVerified,
  getAuthenticated,
  getDiscoverIntroSeen,
  getLikedDrinks,
  getProfilePromptDismissals,
  getProfilePromptSwipeCount,
  getSplashSeen,
  getTriedDrinks,
  getUserProfile,
  setAgeVerified,
  setAuthenticated,
  setDiscoverIntroSeen,
  setLikedDrinks,
  setProfilePromptDismissals,
  setProfilePromptSwipeCount,
  setSplashSeen,
  setTriedDrinks,
  setUserProfile,
} from "./lib/storage";
import type { Route, UserProfile } from "./types";

export function App() {
  const [showSplash, setShowSplash] = useState(() => !getSplashSeen());
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
  const [swipeOverlayOpen, setSwipeOverlayOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cmsVersion, setCmsVersion] = useState(0);

  useEffect(() => {
    const syncRoute = () => setRoute(parseHashRoute());
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    syncRoute();
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    const timeout = window.setTimeout(() => setShowSplash(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) {
      setSplashSeen(true);
    }
  }, [showSplash]);

  useEffect(() => subscribeToCmsUpdates(() => setCmsVersion((current) => current + 1)), []);

  useEffect(() => {
    if (ageVerified && !getDiscoverIntroSeen()) {
      setSwipeOverlayOpen(true);
      setDiscoverIntroSeen(true);
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
    page = <HomePage key={`home-${cmsVersion}`} onNavigate={handleNavigate} />;
  } else if (route.name === "catalog") {
    page = (
      <CatalogPage
        key={`catalog-${cmsVersion}-${route.query ?? ""}`}
        query={route.query}
        onNavigate={handleNavigate}
      />
    );
  } else if (route.name === "detail") {
    page = (
      <DrinkDetailPage
        key={`detail-${cmsVersion}-${route.drinkId}`}
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
    page = <LeaderboardsPage key={`leaderboards-${cmsVersion}`} onNavigate={handleNavigate} />;
  } else if (route.name === "profile") {
    page = (
      <ProfilePage
        key={`profile-${cmsVersion}`}
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
    page = <HomePage key={`home-${cmsVersion}`} onNavigate={handleNavigate} />;
  }

  if (route.name === "admin") {
    return <AdminShell route={route} onNavigate={handleNavigate} />;
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
          if (!getDiscoverIntroSeen()) {
            setSwipeOverlayOpen(true);
            setDiscoverIntroSeen(true);
          }
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
          key={`swipe-${cmsVersion}`}
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
