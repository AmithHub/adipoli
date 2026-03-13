import { DrinkArtwork } from "../components/DrinkArtwork";
import { getDrinkById } from "../services/drinkService";
import type { Drink, Route, UserProfile } from "../types";

interface ProfilePageProps {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  triedDrinks: string[];
  likedDrinks: string[];
  onNavigate: (route: Route) => void;
  onOpenAuth: () => void;
  onRemoveTried: (drinkId: string) => void;
  onRemoveLiked: (drinkId: string) => void;
}

function getFavoriteCategory(triedDrinks: string[], likedDrinks: string[]): string {
  const counts = new Map<string, number>();

  [...triedDrinks, ...likedDrinks].forEach((drinkId) => {
    const drink = getDrinkById(drinkId);
    if (!drink) {
      return;
    }

    counts.set(drink.category, (counts.get(drink.category) ?? 0) + 1);
  });

  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top?.[0] ?? "Not enough history yet";
}

export function ProfilePage({
  profile,
  isAuthenticated,
  triedDrinks,
  likedDrinks,
  onNavigate,
  onOpenAuth,
  onRemoveTried,
  onRemoveLiked,
}: ProfilePageProps) {
  const triedItems = triedDrinks
    .map((drinkId) => getDrinkById(drinkId))
    .filter((drink): drink is Drink => Boolean(drink));
  const likedItems = likedDrinks
    .map((drinkId) => getDrinkById(drinkId))
    .filter((drink): drink is Drink => Boolean(drink));
  const favoriteCategory = getFavoriteCategory(triedDrinks, likedDrinks);

  return (
    <div className="page">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {profile?.username?.charAt(0).toUpperCase() ?? "A"}
        </div>
        <div className="profile-hero-copy">
          <p className="eyebrow">My Profile</p>
          <h1>{profile?.username ?? "Guest Buddy"}</h1>
          <p className="hero-copy">
            {profile?.email ?? "Create a profile to save your drink history more personally."}
          </p>
        </div>
        <button className="secondary-button profile-edit-button" onClick={onOpenAuth}>
          {isAuthenticated ? "Edit profile" : "Create profile"}
        </button>
      </section>

      <section className="profile-stats-grid">
        <article className="metric-card">
          <p>Drinks tried</p>
          <strong>{triedItems.length}</strong>
        </article>
        <article className="metric-card">
          <p>Liked drinks</p>
          <strong>{likedItems.length}</strong>
        </article>
        <article className="metric-card">
          <p>Favorite type</p>
          <strong>{favoriteCategory}</strong>
        </article>
      </section>

      <section>
        <div className="section-header compact">
          <div>
            <h2>Drinks I've Tried</h2>
            <p>Built automatically from your right swipes in Discover.</p>
          </div>
        </div>
        {triedItems.length ? (
          <div className="profile-drink-grid">
            {triedItems.map((drink) => (
              <article key={drink.id} className="profile-drink-card">
                <button
                  className="profile-drink-visual"
                  onClick={() => onNavigate({ name: "detail", drinkId: drink.id })}
                >
                  <DrinkArtwork drink={drink} />
                </button>
                <div className="profile-drink-body">
                  <div className="title-row">
                    <h3>{drink.name}</h3>
                    <span className="rating-pill">{drink.rating.toFixed(1)}</span>
                  </div>
                  <p className="muted-line">
                    {drink.category} • ₹{drink.price}
                  </p>
                  <div className="stats-row">
                    <span>Hangover {drink.hangoverScore}/10</span>
                    <span>{drink.tags[0]}</span>
                  </div>
                  <div className="profile-card-actions">
                    <button
                      className="secondary-button"
                      onClick={() => onNavigate({ name: "detail", drinkId: drink.id })}
                    >
                      Rate this drink
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => onRemoveTried(drink.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            You haven&apos;t marked any drinks as tried yet. Start swiping to build your
            list.
          </div>
        )}
      </section>

      <section>
        <div className="section-header compact">
          <div>
            <h2>Liked Drinks</h2>
            <p>Your favorites from the swipe feed and drink details.</p>
          </div>
        </div>
        {likedItems.length ? (
          <div className="profile-drink-grid">
            {likedItems.map((drink) => (
              <article key={drink.id} className="profile-drink-card">
                <button
                  className="profile-drink-visual"
                  onClick={() => onNavigate({ name: "detail", drinkId: drink.id })}
                >
                  <DrinkArtwork drink={drink} />
                </button>
                <div className="profile-drink-body">
                  <div className="title-row">
                    <h3>{drink.name}</h3>
                    <span className="rating-pill">{drink.rating.toFixed(1)}</span>
                  </div>
                  <p className="muted-line">
                    {drink.category} • Hangover {drink.hangoverScore}/10
                  </p>
                  <div className="profile-card-actions">
                    <button
                      className="secondary-button"
                      onClick={() => onNavigate({ name: "detail", drinkId: drink.id })}
                    >
                      View drink details
                    </button>
                    <button
                      className="ghost-button"
                      onClick={() => onRemoveLiked(drink.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-panel">You haven&apos;t liked any drinks yet.</div>
        )}
      </section>
    </div>
  );
}
