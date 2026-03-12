import type { MouseEvent, TouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DrinkArtwork } from "../components/DrinkArtwork";
import { getAllDrinks } from "../services/drinkService";

interface SwipePageProps {
  triedDrinks: string[];
  likedDrinks: string[];
  onClose: () => void;
  onMarkTried: (drinkId: string) => void;
  onToggleLike: (drinkId: string) => void;
}

export function SwipePage({
  triedDrinks,
  likedDrinks,
  onClose,
  onMarkTried,
  onToggleLike,
}: SwipePageProps) {
  const allDrinks = getAllDrinks();
  const candidates = useMemo(() => allDrinks, [allDrinks]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cardLeaving, setCardLeaving] = useState<"left" | "right" | null>(null);
  const [likeBurst, setLikeBurst] = useState(false);
  const [likedPulse, setLikedPulse] = useState(false);
  const lastTapRef = useRef(0);

  const drink = candidates[index];
  const isTried = drink ? triedDrinks.includes(drink.id) : false;
  const isLiked = drink ? likedDrinks.includes(drink.id) : false;

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setCardLeaving(null);
  }, [index]);

  useEffect(() => {
    if (!likeBurst) {
      return;
    }

    const timeout = window.setTimeout(() => setLikeBurst(false), 650);
    return () => window.clearTimeout(timeout);
  }, [likeBurst]);

  useEffect(() => {
    if (!likedPulse) {
      return;
    }

    const timeout = window.setTimeout(() => setLikedPulse(false), 400);
    return () => window.clearTimeout(timeout);
  }, [likedPulse]);

  function handleChoice(tried: boolean) {
    if (!drink) {
      return;
    }

    if (tried) {
      onMarkTried(drink.id);
      setFeedback(`Added ${drink.name} to Drinks I've Tried.`);
    } else {
      setFeedback(`Skipped ${drink.name}. We will keep this style in mind.`);
    }

    setIndex((current) => current + 1);
  }

  function handleLike() {
    if (!drink) {
      return;
    }

    onToggleLike(drink.id);
    setFeedback(
      isLiked
        ? `Removed ${drink.name} from your likes.`
        : `Liked ${drink.name}. We will show you more like this.`,
    );
    setLikeBurst(!isLiked);
    setLikedPulse(true);
  }

  function advanceCard(direction: "left" | "right") {
    setCardLeaving(direction);
    window.setTimeout(() => {
      handleChoice(direction === "right");
    }, 180);
  }

  function startDrag(x: number, y: number) {
    setDragStart({ x, y });
    setDragOffset({ x: 0, y: 0 });
  }

  function updateDrag(x: number, y: number) {
    if (!dragStart) {
      return;
    }

    setDragOffset({
      x: x - dragStart.x,
      y: y - dragStart.y,
    });
  }

  function finishDrag(x: number, y: number) {
    if (!dragStart) {
      return;
    }

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (deltaY > 120 && Math.abs(deltaX) < 70) {
      setDragStart(null);
      setDragOffset({ x: 0, y: 0 });
      onClose();
      return;
    }

    if (deltaX > 90) {
      setDragStart(null);
      advanceCard("right");
      return;
    }

    if (deltaX < -90) {
      setDragStart(null);
      advanceCard("left");
      return;
    }

    setDragStart(null);
    setDragOffset({ x: 0, y: 0 });
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 260) {
      handleLike();
    }
    lastTapRef.current = now;
    startDrag(touch.clientX, touch.clientY);
  }

  function handleTouchMove(event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0];
    if (touch) {
      updateDrag(touch.clientX, touch.clientY);
    }
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0];
    if (touch) {
      finishDrag(touch.clientX, touch.clientY);
    }
  }

  function handleMouseDown(event: MouseEvent<HTMLElement>) {
    startDrag(event.clientX, event.clientY);
  }

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    if (dragStart) {
      updateDrag(event.clientX, event.clientY);
    }
  }

  function handleMouseUp(event: MouseEvent<HTMLElement>) {
    if (dragStart) {
      finishDrag(event.clientX, event.clientY);
    }
  }

  if (!drink) {
    return (
      <div className="swipe-overlay">
        <div className="swipe-backdrop" onClick={onClose} />
        <div className="swipe-modal swipe-modal-complete">
          <button
            className="swipe-close-button"
            onClick={onClose}
            aria-label="Close swipe drinks"
          >
            ×
          </button>
          <div className="page empty-state-page">
            <h1>Swipe complete</h1>
            <p>You have gone through the current mock lineup.</p>
            <div className="tried-summary">
              <strong>{triedDrinks.length}</strong>
              <span>drinks saved in your history</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rotation = dragOffset.x / 14;
  const decisionLabel =
    dragOffset.x > 28 ? "TRIED" : dragOffset.x < -28 ? "NOT YET" : "";

  return (
    <div className="swipe-overlay">
      <div className="swipe-backdrop" onClick={onClose} />
      <section className="swipe-modal">
        <div className="swipe-sheet-handle" />
        <header className="swipe-modal-header">
          <div>
            <p className="eyebrow">Swipe Drinks</p>
            <h1>Tonight&apos;s quick pick</h1>
          </div>
          <button
            className="swipe-close-button"
            onClick={onClose}
            aria-label="Close swipe drinks"
          >
            ×
          </button>
        </header>

        <p className="hero-copy swipe-intro-copy">
          Swipe right if you&apos;ve already had it, left if not. Double tap to
          like it for future recommendations.
        </p>

        <section
          className={
            cardLeaving === "left"
              ? "swipe-card swipe-card-leaving-left"
              : cardLeaving === "right"
                ? "swipe-card swipe-card-leaving-right"
                : "swipe-card"
          }
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
          }}
          onDoubleClick={handleLike}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {decisionLabel ? (
            <div
              className={
                decisionLabel === "TRIED"
                  ? "swipe-decision-badge tried"
                  : "swipe-decision-badge skipped"
              }
            >
              {decisionLabel}
            </div>
          ) : null}
          {likeBurst ? <div className="like-burst">♥</div> : null}
          <button
            className={likedPulse || isLiked ? "swipe-like-button liked" : "swipe-like-button"}
            onClick={handleLike}
            aria-label={isLiked ? "Unlike this drink" : "Like this drink"}
          >
            ♥
          </button>
          <div className="swipe-card-progress">
            <span>{index + 1}</span>
            <small>/ {candidates.length}</small>
          </div>
          <div className="swipe-card-grabber" />
          <div className="swipe-card-media">
            <DrinkArtwork drink={drink} />
          </div>
          <div className="swipe-body">
            <div className="title-row">
              <h2>{drink.name}</h2>
              <span className="rating-pill">{drink.rating.toFixed(1)}</span>
            </div>
            <p className="muted-line">
              {drink.category} • ₹{drink.price}
            </p>
            <p>{drink.description}</p>
            <div className="swipe-tag-row">
              {drink.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
            <div className="swipe-status-row">
              <span className={isTried ? "status-pill active" : "status-pill"}>
                {isTried ? "Already tried" : "Not marked tried"}
              </span>
              <span className={isLiked ? "status-pill active" : "status-pill"}>
                {isLiked ? "Liked" : "Double tap to like"}
              </span>
            </div>
          </div>
        </section>

        <section className="swipe-actions">
          <button
            className="secondary-button danger-button"
            onClick={() => advanceCard("left")}
          >
            Not Tried
          </button>
          <button className="primary-button" onClick={() => advanceCard("right")}>
            Tried
          </button>
        </section>

        <p className="swipe-hint">
          Swipe down to close • Swipe left to skip • Swipe right to mark tried
        </p>
        {feedback ? <div className="feedback-banner">{feedback}</div> : null}
      </section>
    </div>
  );
}
