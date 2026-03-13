import { useState } from "react";

interface AdminLoginPageProps {
  onLogin: (email: string, password: string) => boolean;
}

export function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [email, setEmail] = useState("admin@adipoli.app");
  const [password, setPassword] = useState("adipoli123");
  const [error, setError] = useState("");

  function handleSubmit() {
    const ok = onLogin(email, password);
    if (!ok) {
      setError("Use the MVP admin credentials to continue.");
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="eyebrow">Adipoli CMS</p>
        <h1>Admin Login</h1>
        <p className="hero-copy">
          Manage drinks, images, reviews, and what users see in the app.
        </p>

        <label className="field-label" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          className="auth-input"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
        />

        <label className="field-label" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          className="auth-input"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
        />

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" onClick={handleSubmit}>
          Login
        </button>

        <p className="admin-login-hint">
          Mock credentials prefilled for MVP: <strong>admin@adipoli.app</strong>
        </p>
      </div>
    </div>
  );
}
