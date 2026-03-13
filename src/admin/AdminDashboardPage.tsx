import type { AdminDashboardStats } from "../services/cmsService";
import type { AdminSection, Drink } from "../types";

interface AdminDashboardPageProps {
  stats: AdminDashboardStats;
  onNavigate: (section: AdminSection) => void;
}

function DrinkMiniList({
  title,
  drinks,
}: {
  title: string;
  drinks: Drink[];
}) {
  return (
    <section className="admin-panel-card">
      <div className="section-header compact">
        <div>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="admin-mini-list">
        {drinks.map((drink) => (
          <article key={drink.id} className="admin-mini-item">
            <strong>{drink.name}</strong>
            <span>
              {drink.category} • ₹{drink.price} • {drink.rating.toFixed(1)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminDashboardPage({
  stats,
  onNavigate,
}: AdminDashboardPageProps) {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">CMS Dashboard</p>
          <h1>Adipoli Admin Overview</h1>
        </div>
      </div>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total drinks</p>
          <strong>{stats.totalDrinks}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Total reviews</p>
          <strong>{stats.totalReviews}</strong>
        </article>
        <article className="admin-stat-card">
          <p>Total swipe interactions</p>
          <strong>{stats.totalSwipeInteractions}</strong>
        </article>
      </section>

      <section className="admin-shortcuts">
        <button className="primary-button" onClick={() => onNavigate("drinks")}>
          Manage drinks
        </button>
        <button className="secondary-button" onClick={() => onNavigate("images")}>
          Manage images
        </button>
        <button className="secondary-button" onClick={() => onNavigate("reviews")}>
          Moderate reviews
        </button>
      </section>

      <div className="admin-two-column">
        <DrinkMiniList title="Top rated drinks" drinks={stats.topRatedDrinks} />
        <DrinkMiniList title="Recently added drinks" drinks={stats.recentDrinks} />
      </div>
    </div>
  );
}
