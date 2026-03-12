import type { ReactNode } from "react";
import type { Route } from "../types";

interface AppShellProps {
  route: Route;
  onNavigate: (route: Route) => void;
  children: ReactNode;
}

const navItems: Array<{ label: string; route: Route }> = [
  { label: "Home", route: { name: "home" } },
  { label: "Catalog", route: { name: "catalog" } },
  { label: "Swipe", route: { name: "swipe" } },
];

export function AppShell({ route, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <main className="screen">{children}</main>
      <footer className="app-footer">
        <p>Drinking alcohol is injurious to health. Please drink responsibly.</p>
      </footer>
      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => {
          const active =
            item.route.name === "swipe" ? false : route.name === item.route.name;
          return (
            <button
              key={item.label}
              className={active ? "nav-item active" : "nav-item"}
              onClick={() => onNavigate(item.route)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
