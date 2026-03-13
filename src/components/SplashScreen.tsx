export function SplashScreen() {
  return (
    <div className="splash-screen" aria-label="Adipoli splash screen">
      <div className="splash-backdrop" />
      <div className="splash-glow" />

      <div className="splash-stage">
        <div className="splash-cheers">
          <div className="cheers-bubble" aria-hidden="true">
            <span>Cheers!</span>
          </div>

          <div className="beer-mug beer-mug-left">
            <div className="beer-fill">
              <div className="beer-liquid">
                <div className="beer-surface" />
                <div className="beer-wave beer-wave-back" />
                <div className="beer-wave beer-wave-front" />
                <div className="beer-droplet beer-droplet-one" />
                <div className="beer-droplet beer-droplet-two" />
              </div>
            </div>
            <div className="beer-foam">
              <span className="foam-bubble foam-bubble-one" />
              <span className="foam-bubble foam-bubble-two" />
              <span className="foam-bubble foam-bubble-three" />
              <span className="foam-bubble foam-bubble-four" />
              <span className="foam-bubble foam-bubble-five" />
            </div>
            <div className="beer-body" />
            <div className="beer-handle" />
            <div className="beer-shine" />
          </div>

          <div className="clink-burst" aria-hidden="true">
            <span className="clink-pulse" />
            <span className="clink-spark spark-one" />
            <span className="clink-spark spark-two" />
            <span className="clink-spark spark-three" />
            <span className="clink-drop drop-one" />
            <span className="clink-drop drop-two" />
            <span className="clink-drop drop-three" />
          </div>

          <div className="beer-mug beer-mug-right">
            <div className="beer-fill">
              <div className="beer-liquid">
                <div className="beer-surface" />
                <div className="beer-wave beer-wave-back" />
                <div className="beer-wave beer-wave-front" />
                <div className="beer-droplet beer-droplet-one" />
                <div className="beer-droplet beer-droplet-two" />
              </div>
            </div>
            <div className="beer-foam">
              <span className="foam-bubble foam-bubble-one" />
              <span className="foam-bubble foam-bubble-two" />
              <span className="foam-bubble foam-bubble-three" />
              <span className="foam-bubble foam-bubble-four" />
              <span className="foam-bubble foam-bubble-five" />
            </div>
            <div className="beer-body" />
            <div className="beer-handle" />
            <div className="beer-shine" />
          </div>
        </div>

        <div className="splash-brand">
          <h1>അടിപൊളി</h1>
          <p>Your 'അടി' company.</p>
        </div>
      </div>

      <p className="splash-footer">
        Drinking alcohol is injurious to health. Drink responsibly.
      </p>
    </div>
  );
}
