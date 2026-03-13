import { useState } from "react";
import type { ChangeEvent } from "react";
import { buildStyledProductImage } from "./imageStyling";
import { ManagedDrinkImage } from "../components/ManagedDrinkImage";
import type { Drink } from "../types";

interface AdminImagesPageProps {
  drinks: Drink[];
  onReplaceImage: (drinkId: string, imageUrl?: string) => Promise<void> | void;
}

export function AdminImagesPage({
  drinks,
  onReplaceImage,
}: AdminImagesPageProps) {
  const [message, setMessage] = useState("");

  async function handleFileChange(drinkId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await buildStyledProductImage(file);
      await onReplaceImage(drinkId, dataUrl);
      setMessage("Image styled for Adipoli and synced to the app.");
    } catch {
      setMessage("Image could not be processed. Try a smaller or clearer bottle image.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Image Management</p>
          <h1>Manage drink images</h1>
        </div>
      </div>

      {message ? <div className="feedback-banner">{message}</div> : null}

      <div className="admin-image-grid">
        {drinks.map((drink) => (
          <article key={drink.id} className="admin-panel-card admin-image-card">
            <div className="admin-image-preview">
              <ManagedDrinkImage drink={drink} alt={drink.name} />
            </div>
            <div className="admin-image-copy">
              <strong>{drink.name}</strong>
              <span>{drink.category}</span>
            </div>
            <label className="secondary-button admin-upload-button">
              Upload / Replace
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  void handleFileChange(drink.id, event);
                }}
              />
            </label>
            <button className="ghost-button" onClick={() => onReplaceImage(drink.id, "")}>
              Delete image
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
