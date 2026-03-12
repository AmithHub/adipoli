import React from "react";

interface AgeGateProps {
  onConfirm: () => void;
}

export function AgeGate({ onConfirm }: AgeGateProps) {
  const [denied, setDenied] = React.useState(false);

  return (
    <div className="age-gate">
      <div className="ambient-glow ambient-glow-left" />
      <div className="ambient-glow ambient-glow-right" />
      <section className="age-card">
        <p className="eyebrow">Adipoli</p>
        <div className="age-warning-symbol" aria-hidden="true">
          <div className="age-warning-ring">
            <div className="age-warning-surface">
              <div className="age-warning-bottle" />
              <div className="age-warning-glass" />
            </div>
            <div className="age-warning-slash" />
          </div>
        </div>
        <h1>Age Verification</h1>
        <p className="hero-copy">
          You must be of legal drinking age to enter this app.
        </p>
        <p className="question">
          Are you above the legal drinking age of 23?
        </p>

        <div className="button-stack">
          <button className="primary-button" onClick={onConfirm}>
            Yes, I am above 23
          </button>
          <button className="secondary-button" onClick={() => setDenied(true)}>
            No
          </button>
        </div>

        {denied ? (
          <div className="denied-box">
            Access denied. Please exit the app if you are below the legal
            drinking age.
          </div>
        ) : null}

        <div className="warning-box">
          <strong>Statutory Warning</strong>
          <span>Drinking alcohol is injurious to health.</span>
        </div>
      </section>
    </div>
  );
}
