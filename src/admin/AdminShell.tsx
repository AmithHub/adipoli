import { useMemo, useState } from "react";
import { AdminDashboardPage } from "./AdminDashboardPage";
import { AdminDrinksPage } from "./AdminDrinksPage";
import { AdminImagesPage } from "./AdminImagesPage";
import { AdminLoginPage } from "./AdminLoginPage";
import { AdminReviewsPage } from "./AdminReviewsPage";
import {
  authenticateAdmin,
  deleteDrink,
  deleteReview,
  getAdminSections,
  getAdminSession,
  getAllReviews,
  getCmsDrinks,
  getDashboardStats,
  logoutAdmin,
  saveDrink,
  updateDrinkImage,
  updateReviewStatus,
} from "../services/cmsService";
import type { AdminSection, Route } from "../types";

interface AdminShellProps {
  route: Extract<Route, { name: "admin" }>;
  onNavigate: (route: Route) => void;
}

export function AdminShell({ route, onNavigate }: AdminShellProps) {
  const [authenticated, setAuthenticated] = useState(() => getAdminSession());
  const [drinks, setDrinks] = useState(() => getCmsDrinks());
  const sections = getAdminSections();
  const stats = useMemo(() => getDashboardStats(), [drinks]);
  const reviews = useMemo(() => getAllReviews(), [drinks]);

  function goToSection(section: AdminSection) {
    onNavigate({ name: "admin", section });
  }

  function renderContent() {
    if (route.section === "dashboard") {
      return <AdminDashboardPage stats={stats} onNavigate={goToSection} />;
    }

    if (route.section === "drinks") {
      return (
        <AdminDrinksPage
          drinks={drinks}
          onSaveDrink={(drink) => setDrinks(saveDrink(drink))}
          onDeleteDrink={(drinkId) => setDrinks(deleteDrink(drinkId))}
        />
      );
    }

    if (route.section === "images") {
      return (
        <AdminImagesPage
          drinks={drinks}
          onReplaceImage={async (drinkId, imageUrl) => {
            const next = await updateDrinkImage(drinkId, imageUrl);
            setDrinks(next);
          }}
        />
      );
    }

    if (route.section === "reviews") {
      return (
        <AdminReviewsPage
          reviews={reviews}
          onApprove={(drinkId, reviewId) =>
            setDrinks(updateReviewStatus(drinkId, reviewId, "approved"))
          }
          onHide={(drinkId, reviewId) =>
            setDrinks(updateReviewStatus(drinkId, reviewId, "hidden"))
          }
          onDelete={(drinkId, reviewId) => setDrinks(deleteReview(drinkId, reviewId))}
        />
      );
    }

    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <p className="eyebrow">Coming Soon</p>
            <h1>{route.section}</h1>
          </div>
        </div>
        <section className="admin-panel-card">
          This module is reserved for the next CMS phase. The shared data structure is
          already prepared for it.
        </section>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminLoginPage
        onLogin={(email, password) => {
          const ok = authenticateAdmin(email, password);
          setAuthenticated(ok);
          return ok;
        }}
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <p className="eyebrow">Adipoli</p>
          <h2>CMS Panel</h2>
        </div>

        <nav className="admin-sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.key}
              className={
                route.section === section.key ? "admin-nav-item active" : "admin-nav-item"
              }
              onClick={() => goToSection(section.key)}
            >
              <span>{section.label}</span>
              {section.ready ? null : <small>Soon</small>}
            </button>
          ))}
        </nav>

        <button
          className="ghost-button admin-logout-button"
          onClick={() => {
            logoutAdmin();
            setAuthenticated(false);
          }}
        >
          Logout
        </button>
      </aside>

      <main className="admin-content">{renderContent()}</main>
    </div>
  );
}
