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

  window.location.hash = "/swipe";
}
