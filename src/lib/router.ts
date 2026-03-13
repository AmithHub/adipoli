import type { Route } from "../types";

export function parseHashRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  const [path, queryString] = hash.split("?");
  const params = new URLSearchParams(queryString ?? "");

  if (path.startsWith("/catalog")) {
    return { name: "catalog", query: params.get("q") ?? undefined };
  }

  if (path.startsWith("/drink/")) {
    const drinkId = path.replace("/drink/", "");
    return { name: "detail", drinkId };
  }

  if (path.startsWith("/swipe")) {
    return { name: "swipe" };
  }

  if (path.startsWith("/leaderboards")) {
    return { name: "leaderboards" };
  }

  if (path.startsWith("/profile")) {
    return { name: "profile" };
  }

  return { name: "home" };
}

export function navigateTo(route: Route): void {
  if (route.name === "home") {
    window.location.hash = "/";
    return;
  }

  if (route.name === "catalog") {
    const query = route.query ? `?q=${encodeURIComponent(route.query)}` : "";
    window.location.hash = `/catalog${query}`;
    return;
  }

  if (route.name === "detail") {
    window.location.hash = `/drink/${route.drinkId}`;
    return;
  }

  if (route.name === "swipe") {
    window.location.hash = "/swipe";
    return;
  }

  if (route.name === "leaderboards") {
    window.location.hash = "/leaderboards";
    return;
  }

  window.location.hash = "/profile";
}
