import { useMemo, useState } from "react";
import {
  buildEmptyDrink,
  getManagedCategories,
  normalizeTags,
} from "../services/cmsService";
import type { Drink } from "../types";

interface AdminDrinksPageProps {
  drinks: Drink[];
  onSaveDrink: (drink: Drink) => void;
  onDeleteDrink: (drinkId: string) => void;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminDrinksPage({
  drinks,
  onSaveDrink,
  onDeleteDrink,
}: AdminDrinksPageProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Drink["category"]>("All");
  const [draft, setDraft] = useState<Drink>(() => drinks[0] ?? buildEmptyDrink());
  const categories = getManagedCategories();

  const filteredDrinks = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return drinks.filter((drink) => {
      const matchesSearch =
        !normalized ||
        drink.name.toLowerCase().includes(normalized) ||
        drink.description.toLowerCase().includes(normalized);
      const matchesCategory =
        categoryFilter === "All" || drink.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, drinks, search]);

  function updateDraft<K extends keyof Drink>(key: K, value: Drink[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="admin-page admin-drinks-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Drink Management</p>
          <h1>Manage drinks</h1>
        </div>
        <button className="primary-button" onClick={() => setDraft(buildEmptyDrink())}>
          Add new drink
        </button>
      </div>

      <section className="admin-toolbar">
        <input
          className="auth-input"
          type="search"
          placeholder="Search drinks"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="auth-input"
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(event.target.value as "All" | Drink["category"])
          }
        >
          <option value="All">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </section>

      <div className="admin-two-column admin-drinks-layout">
        <section className="admin-panel-card admin-list-card">
          <div className="admin-list">
            {filteredDrinks.map((drink) => (
              <button
                key={drink.id}
                className={drink.id === draft.id ? "admin-list-item active" : "admin-list-item"}
                onClick={() => setDraft(drink)}
              >
                <strong>{drink.name}</strong>
                <span>
                  {drink.category} • ₹{drink.price}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-panel-card admin-form-card">
          <div className="admin-form-grid">
            <label className="field-label">
              Drink name
              <input
                className="auth-input"
                value={draft.name}
                onChange={(event) => {
                  const name = event.target.value;
                  updateDraft("name", name);
                  if (!draft.createdAt || draft.id.startsWith("drink-")) {
                    updateDraft("id", slugify(name) || `drink-${Date.now()}`);
                  }
                }}
              />
            </label>

            <label className="field-label">
              Category
              <select
                className="auth-input"
                value={draft.category}
                onChange={(event) =>
                  updateDraft("category", event.target.value as Drink["category"])
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Price
              <input
                className="auth-input"
                type="number"
                value={draft.price}
                onChange={(event) => updateDraft("price", Number(event.target.value))}
              />
            </label>

            <label className="field-label">
              Bottle size
              <input
                className="auth-input"
                value={draft.bottleSize ?? ""}
                onChange={(event) => updateDraft("bottleSize", event.target.value)}
              />
            </label>

            <label className="field-label">
              ABV
              <input
                className="auth-input"
                type="number"
                step="0.1"
                value={draft.abv ?? 0}
                onChange={(event) => updateDraft("abv", Number(event.target.value))}
              />
            </label>

            <label className="field-label">
              Hangover score
              <input
                className="auth-input"
                type="number"
                min="1"
                max="10"
                value={draft.hangoverScore}
                onChange={(event) =>
                  updateDraft("hangoverScore", Number(event.target.value))
                }
              />
            </label>

            <label className="field-label">
              Rating
              <input
                className="auth-input"
                type="number"
                step="0.1"
                value={draft.rating}
                onChange={(event) => updateDraft("rating", Number(event.target.value))}
              />
            </label>

            <label className="field-label">
              Taste
              <input
                className="auth-input"
                type="number"
                step="0.1"
                value={draft.taste}
                onChange={(event) => updateDraft("taste", Number(event.target.value))}
              />
            </label>

            <label className="field-label">
              Smoothness
              <input
                className="auth-input"
                type="number"
                step="0.1"
                value={draft.smoothness}
                onChange={(event) => updateDraft("smoothness", Number(event.target.value))}
              />
            </label>

            <label className="field-label">
              Value
              <input
                className="auth-input"
                type="number"
                step="0.1"
                value={draft.valueForMoney}
                onChange={(event) =>
                  updateDraft("valueForMoney", Number(event.target.value))
                }
              />
            </label>

            <label className="field-label admin-form-span">
              Tags
              <input
                className="auth-input"
                value={draft.tags.join(", ")}
                onChange={(event) => updateDraft("tags", normalizeTags(event.target.value))}
              />
            </label>

            <label className="field-label admin-form-span">
              Description
              <textarea
                className="admin-textarea"
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
              />
            </label>
          </div>

          <div className="admin-toggle-grid">
            {[
              ["trending", "Trending"],
              ["featured", "Featured"],
              ["topRated", "Top rated"],
              ["bestValue", "Best value"],
              ["lowHangover", "Low hangover"],
            ].map(([key, label]) => (
              <label key={key} className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(draft[key as keyof Drink])}
                  onChange={(event) =>
                    updateDraft(key as keyof Drink, event.target.checked as never)
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="profile-card-actions">
            <button className="primary-button" onClick={() => onSaveDrink(draft)}>
              Save drink
            </button>
            <button
              className="ghost-button"
              onClick={() => onDeleteDrink(draft.id)}
              disabled={!drinks.some((drink) => drink.id === draft.id)}
            >
              Delete drink
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
