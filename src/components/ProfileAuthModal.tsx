import { useState } from "react";
import type { UserProfile } from "../types";

interface ProfileAuthModalProps {
  onClose: () => void;
  onSubmit: (profile: UserProfile) => void;
}

function buildUsername(email: string): string {
  const localPart = email.split("@")[0] ?? "adipoli-user";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) {
    return "Adipoli Buddy";
  }

  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ProfileAuthModal({
  onClose,
  onSubmit,
}: ProfileAuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      setError("Enter both email and password to continue.");
      return;
    }

    onSubmit({
      email: normalizedEmail,
      username: buildUsername(normalizedEmail),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close profile login">
          ×
        </button>
        <p className="eyebrow">My Profile</p>
        <h2 id="auth-modal-title">Login / Create Profile</h2>
        <p className="hero-copy">
          Save your tried drinks, likes, and future ratings with a quick mock login.
        </p>

        <label className="field-label" htmlFor="profile-email">
          Email
        </label>
        <input
          id="profile-email"
          className="auth-input"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
        />

        <label className="field-label" htmlFor="profile-password">
          Password
        </label>
        <input
          id="profile-password"
          className="auth-input"
          type="password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
        />

        {error ? <p className="form-error">{error}</p> : null}

        <div className="auth-actions">
          <button className="primary-button" onClick={handleSubmit}>
            Login
          </button>
          <button className="secondary-button" onClick={handleSubmit}>
            Create Account
          </button>
        </div>

        <button className="ghost-button auth-google-button" type="button">
          Continue with Google
        </button>
      </div>
    </div>
  );
}
