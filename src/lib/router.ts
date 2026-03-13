import type { Route } from "../types";

export function parseHashRoute(): Route {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const section = pathname.replace("/admin", "").replace(/^\/+/, "");
    const normalizedSection =
      section === "drinks" ||
      section === "images" ||
      section === "reviews" ||
      section === "categories" ||
      section === "leaderboards" ||
      section === "content"
        ? section
        : "dashboard";

    return { name: "admin", section: normalizedSection };
  }

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
    window.history.pushState({}, "", "/#/");
    return;
  }

  if (route.name === "catalog") {
    const query = route.query ? `?q=${encodeURIComponent(route.query)}` : "";
    window.history.pushState({}, "", `/#/catalog${query}`);
    return;
  }

  if (route.name === "detail") {
    window.history.pushState({}, "", `/#/drink/${route.drinkId}`);
    return;
  }

  if (route.name === "swipe") {
    window.history.pushState({}, "", "/#/swipe");
    return;
  }

  if (route.name === "leaderboards") {
    window.history.pushState({}, "", "/#/leaderboards");
    return;
  }

  if (route.name === "profile") {
    window.history.pushState({}, "", "/#/profile");
    return;
  }

  const section = route.section === "dashboard" ? "" : `/${route.section}`;
  window.history.pushState({}, "", `/admin${section}`);
}
