import type { ReactNode } from "react";
import type { Route } from "../types";

interface AppShellProps {
  route: Route;
  isSwipeOpen: boolean;
  onNavigate: (route: Route) => void;
  children: ReactNode;
}

const navItems: Array<{
  label: string;
  icon: string;
  route: Route;
  ariaLabel?: string;
}> = [
  { label: "Home", icon: "⌂", route: { name: "home" } },
  { label: "Catalog", icon: "◫", route: { name: "catalog" } },
  { label: "Discover", icon: "✦", route: { name: "swipe" } },
  { label: "Boards", icon: "◈", route: { name: "leaderboards" }, ariaLabel: "Leaderboards" },
  { label: "Profile", icon: "●", route: { name: "profile" }, ariaLabel: "My Profile" },
];

export function AppShell({ route, isSwipeOpen, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <main className="screen">{children}</main>
      <footer className="app-footer">
        <p>Drinking alcohol is injurious to health. Please drink responsibly.</p>
      </footer>
      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => {
          const active =
            item.route.name === "swipe" ? isSwipeOpen : route.name === item.route.name;
          return (
            <button
              key={item.label}
              className={active ? "nav-item active" : "nav-item"}
              onClick={() => onNavigate(item.route)}
              aria-label={item.ariaLabel ?? item.label}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
