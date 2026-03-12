import type { Route } from "../types";
import { DrinkArtwork } from "../components/DrinkArtwork";
import { getDrinkById } from "../services/drinkService";

interface DrinkDetailPageProps {
  drinkId: string;
  onNavigate: (route: Route) => void;
}

export function DrinkDetailPage({
  drinkId,
  onNavigate,
}: DrinkDetailPageProps) {
  const drink = getDrinkById(drinkId);

  if (!drink) {
    return (
      <div className="page empty-state-page">
        <h1>Drink not found</h1>
        <p>That bottle is not in the current mock catalog.</p>
        <button className="primary-button" onClick={() => onNavigate({ name: "catalog" })}>
          Back to catalog
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="back-button" onClick={() => onNavigate({ name: "catalog" })}>
        Back
      </button>

      <section className="detail-hero">
        <DrinkArtwork drink={drink} />
        <div className="detail-meta">
          <p className="eyebrow">{drink.category}</p>
          <h1>{drink.name}</h1>
          <p className="hero-copy">{drink.description}</p>
          <div className="detail-pill-row">
            <span className="detail-pill">₹{drink.price}</span>
            <span className="detail-pill">Rating {drink.rating.toFixed(1)}</span>
            <span className="detail-pill">Hangover {drink.hangoverScore}/10</span>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <p>Taste</p>
          <strong>{drink.taste.toFixed(1)}</strong>
        </article>
        <article className="metric-card">
          <p>Smoothness</p>
          <strong>{drink.smoothness.toFixed(1)}</strong>
        </article>
        <article className="metric-card">
          <p>Value for money</p>
          <strong>{drink.valueForMoney.toFixed(1)}</strong>
        </article>
      </section>

      <section className="hangover-card">
        <div className="section-header compact">
          <div>
            <h2>Hangover meter</h2>
            <p>Lower is better for next-day comfort.</p>
          </div>
          <strong>{drink.hangoverScore}/10</strong>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${(drink.hangoverScore / 10) * 100}%` }}
          />
        </div>
      </section>

      <section className="tags-section">
        {drink.tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </section>

      <section className="reviews-section">
        <div className="section-header compact">
          <div>
            <h2>Community reviews</h2>
            <p>Mock feedback for the MVP</p>
          </div>
        </div>
        <div className="reviews-list">
          {drink.reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="title-row">
                <h3>{review.author}</h3>
                <span className="rating-pill">{review.overall.toFixed(1)}</span>
              </div>
              <p>{review.comment}</p>
              <div className="review-meta">
                <span>Taste {review.taste.toFixed(1)}</span>
                <span>Smoothness {review.smoothness.toFixed(1)}</span>
                <span>Value {review.value.toFixed(1)}</span>
                <span>Next day {review.hangover}/10</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
