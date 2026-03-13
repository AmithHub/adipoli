import type { AdminReviewRecord } from "../services/cmsService";

interface AdminReviewsPageProps {
  reviews: AdminReviewRecord[];
  onApprove: (drinkId: string, reviewId: string) => void;
  onHide: (drinkId: string, reviewId: string) => void;
  onDelete: (drinkId: string, reviewId: string) => void;
}

export function AdminReviewsPage({
  reviews,
  onApprove,
  onHide,
  onDelete,
}: AdminReviewsPageProps) {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Review Moderation</p>
          <h1>Moderate reviews</h1>
        </div>
      </div>

      <div className="admin-review-list">
        {reviews.map((review) => (
          <article key={review.id} className="admin-panel-card admin-review-card">
            <div className="title-row">
              <h3>{review.username ?? review.author}</h3>
              <span className="rating-pill">{review.overall.toFixed(1)}</span>
            </div>
            <p className="muted-line">
              {review.drinkName} • {new Date(review.dateSubmitted ?? Date.now()).toLocaleDateString()}
            </p>
            <p>{review.comment}</p>
            <div className="review-meta">
              <span>Taste {review.taste.toFixed(1)}</span>
              <span>Smoothness {review.smoothness.toFixed(1)}</span>
              <span>Hangover {review.hangover}/10</span>
              <span>Status {review.status ?? "approved"}</span>
            </div>
            <div className="profile-card-actions">
              <button
                className="primary-button"
                onClick={() => onApprove(review.drinkId, review.id)}
              >
                Approve review
              </button>
              <button
                className="secondary-button"
                onClick={() => onHide(review.drinkId, review.id)}
              >
                Hide review
              </button>
              <button
                className="ghost-button"
                onClick={() => onDelete(review.drinkId, review.id)}
              >
                Delete review
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
