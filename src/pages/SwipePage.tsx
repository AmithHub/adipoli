import type { MouseEvent, TouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DrinkArtwork } from "../components/DrinkArtwork";
import { getAllDrinks } from "../services/drinkService";
import { getSwipeHintDismissed, setSwipeHintDismissed } from "../lib/storage";
import type { Drink } from "../types";

interface SwipePageProps {
  triedDrinks: string[];
  likedDrinks: string[];
  onClose: () => void;
  onMarkTried: (drinkId: string) => void;
  onToggleLike: (drinkId: string) => void;
}

type GestureMode = "card" | "sheet" | null;

function shuffleDrinks(drinks: Drink[]): Drink[] {
  const copy = [...drinks];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function SwipePage({
  triedDrinks,
  likedDrinks,
  onClose,
  onMarkTried,
  onToggleLike,
}: SwipePageProps) {
  const candidates = useMemo(() => shuffleDrinks(getAllDrinks()), []);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef(0);
  const singleTapTimeoutRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedDrinkId, setExpandedDrinkId] = useState<string | null>(null);
  const [showTapHint, setShowTapHint] = useState(() => !getSwipeHintDismissed());
  const [feedback, setFeedback] = useState("");
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [gestureMode, setGestureMode] = useState<GestureMode>(null);
  const [dragDrinkId, setDragDrinkId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sheetOffsetY, setSheetOffsetY] = useState(0);
  const [cardLeaving, setCardLeaving] = useState<"left" | "right" | null>(null);
  const [likeBurstId, setLikeBurstId] = useState<string | null>(null);
  const [likedPulseId, setLikedPulseId] = useState<string | null>(null);
  const [lastTriedName, setLastTriedName] = useState("");
  const [showRatePrompt, setShowRatePrompt] = useState(false);

  const activeDrink = candidates[activeIndex];

  useEffect(() => {
    if (!likeBurstId) {
      return;
    }

    const timeout = window.setTimeout(() => setLikeBurstId(null), 650);
    return () => window.clearTimeout(timeout);
  }, [likeBurstId]);

  useEffect(() => {
    if (!likedPulseId) {
      return;
    }

    const timeout = window.setTimeout(() => setLikedPulseId(null), 400);
    return () => window.clearTimeout(timeout);
  }, [likedPulseId]);

  useEffect(() => {
    setExpandedDrinkId(null);
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (singleTapTimeoutRef.current) {
        window.clearTimeout(singleTapTimeoutRef.current);
      }
    };
  }, []);

  function goToIndex(nextIndex: number) {
    const clamped = Math.max(0, Math.min(nextIndex, candidates.length - 1));
    setActiveIndex(clamped);
    const nextSection = feedRef.current?.children.item(clamped) as HTMLElement | null;
    nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleChoice(drink: Drink, tried: boolean) {
    const alreadyTried = triedDrinks.includes(drink.id);

    if (tried) {
      if (!alreadyTried) {
        onMarkTried(drink.id);
      }
      setLastTriedName(drink.name);
      setShowRatePrompt(true);
      setFeedback(
        alreadyTried
          ? `${drink.name} is already in Drinks I've Tried.`
          : `Added ${drink.name} to Drinks I've Tried.`,
      );
    } else {
      setFeedback(`Skipped ${drink.name}. We will keep this style in mind.`);
    }
  }

  function handleLike(drink: Drink) {
    const isLiked = likedDrinks.includes(drink.id);
    onToggleLike(drink.id);
    setFeedback(
      isLiked
        ? `Removed ${drink.name} from your likes.`
        : `Liked ${drink.name}. We will show you more like this.`,
    );
    if (!isLiked) {
      setLikeBurstId(drink.id);
    }
    setLikedPulseId(drink.id);
  }

  function scheduleToggleDetails(drinkId: string) {
    if (singleTapTimeoutRef.current) {
      window.clearTimeout(singleTapTimeoutRef.current);
    }

    singleTapTimeoutRef.current = window.setTimeout(() => {
      toggleDetails(drinkId);
      singleTapTimeoutRef.current = null;
    }, 220);
  }

  function toggleDetails(drinkId: string) {
    if (showTapHint) {
      setShowTapHint(false);
      setSwipeHintDismissed(true);
    }
    setExpandedDrinkId((current) => (current === drinkId ? null : drinkId));
  }

  function advanceCard(drink: Drink, direction: "left" | "right") {
    setDragDrinkId(drink.id);
    setCardLeaving(direction);
    window.setTimeout(() => {
      handleChoice(drink, direction === "right");
      setCardLeaving(null);
      setDragDrinkId(null);
      setDragOffset({ x: 0, y: 0 });
      goToIndex(activeIndex + 1);
    }, 180);
  }

  function startDrag(drinkId: string, x: number, y: number) {
    setDragStart({ x, y });
    setGestureMode(null);
    setDragDrinkId(drinkId);
    setDragOffset({ x: 0, y: 0 });
  }

  function updateDrag(x: number, y: number) {
    if (!dragStart) {
      return;
    }

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (!gestureMode) {
      const atTop = (feedRef.current?.scrollTop ?? 0) <= 0;
      if (atTop && Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
        setGestureMode("sheet");
      } else if (Math.abs(deltaX) > 12) {
        setGestureMode("card");
      } else {
        return;
      }
    }

    if (gestureMode === "sheet") {
      setSheetOffsetY(Math.max(0, deltaY));
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    setDragOffset({
      x: deltaX,
      y: deltaY * 0.16,
    });
    setSheetOffsetY(0);
  }

  function finishDrag(x: number, y: number) {
    if (!dragStart || !activeDrink) {
      return;
    }

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (gestureMode === "sheet") {
      setDragStart(null);
      setGestureMode(null);
      if (deltaY > 120) {
        setSheetOffsetY(0);
        onClose();
        return;
      }
      setSheetOffsetY(0);
      return;
    }

    setDragStart(null);
    setGestureMode(null);

    if (deltaX > 90) {
      advanceCard(activeDrink, "right");
      return;
    }

    if (deltaX < -90) {
      advanceCard(activeDrink, "left");
      return;
    }

    setDragOffset({ x: 0, y: 0 });
    setDragDrinkId(null);
  }

  function handleTouchStart(drink: Drink, event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current < 260) {
      if (singleTapTimeoutRef.current) {
        window.clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      suppressClickUntilRef.current = now + 300;
      handleLike(drink);
    }
    lastTapRef.current = now;
    startDrag(drink.id, touch.clientX, touch.clientY);
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

  function handleMouseDown(drink: Drink, event: MouseEvent<HTMLElement>) {
    startDrag(drink.id, event.clientX, event.clientY);
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

  function handleCardClick(drink: Drink, event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("button")) {
      return;
    }

    if (Date.now() < suppressClickUntilRef.current) {
      return;
    }

    if (dragDrinkId === drink.id) {
      return;
    }

    scheduleToggleDetails(drink.id);
  }

  function handleFeedScroll() {
    const container = feedRef.current;
    if (!container) {
      return;
    }

    if (singleTapTimeoutRef.current) {
      window.clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = null;
    }

    const nextIndex = Math.round(container.scrollTop / container.clientHeight);
    setActiveIndex(Math.max(0, Math.min(nextIndex, candidates.length - 1)));
  }

  if (!candidates.length) {
    return null;
  }

  return (
    <div className="swipe-overlay">
      <section
        className="swipe-modal swipe-feed-shell"
        style={{ transform: `translateY(${sheetOffsetY}px)` }}
      >
        <header className="swipe-modal-header">
          <div>
            <p className="eyebrow">Adichitundo?</p>
            <h1>Discover drinks fast</h1>
          </div>
          <button
            className="swipe-close-button"
            onClick={onClose}
            aria-label="Close swipe drinks"
          >
            ×
          </button>
        </header>

        <div className="swipe-feed" ref={feedRef} onScroll={handleFeedScroll}>
          {candidates.map((drink, index) => {
            const isActive = index === activeIndex;
            const isDragged = dragDrinkId === drink.id;
            const isTried = triedDrinks.includes(drink.id);
            const isLiked = likedDrinks.includes(drink.id);
            const isExpanded = expandedDrinkId === drink.id;
            const rotation = isDragged ? dragOffset.x / 14 : 0;
            const decisionLabel =
              isDragged && dragOffset.x > 28
                ? "TRIED"
                : isDragged && dragOffset.x < -28
                  ? "NOT YET"
                  : "";

            return (
              <article key={drink.id} className="swipe-feed-item">
                <section
                  className={
                    cardLeaving === "left" && isDragged
                      ? "swipe-card swipe-card-leaving-left"
                      : cardLeaving === "right" && isDragged
                        ? "swipe-card swipe-card-leaving-right"
                        : "swipe-card"
                  }
                  style={{
                    transform: isDragged
                      ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`
                      : undefined,
                  }}
                  onDoubleClick={() => handleLike(drink)}
                  onTouchStart={(event) => handleTouchStart(drink, event)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={(event) => handleMouseDown(drink, event)}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={(event) => handleCardClick(drink, event)}
                >
                  <div className="swipe-card-gradient" />
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
                  {likeBurstId === drink.id ? <div className="like-burst">♥</div> : null}
                  <button
                    className={
                      likedPulseId === drink.id || isLiked
                        ? "swipe-like-button liked"
                        : "swipe-like-button"
                    }
                    type="button"
                    onTouchStart={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleLike(drink);
                    }}
                    onTouchEnd={(event) => {
                      event.stopPropagation();
                      handleLike(drink);
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                    aria-label={isLiked ? "Unlike this drink" : "Like this drink"}
                  >
                    ♥
                  </button>
                  <div className="swipe-card-media">
                    <DrinkArtwork drink={drink} />
                  </div>
                  <div className="swipe-top-info">
                    {isActive && showTapHint ? (
                      <p className="hero-copy swipe-intro-copy">
                        Single tap to reveal more. Double tap to like. Swipe
                        sideways for tried or not tried. Scroll for the next drink.
                      </p>
                    ) : null}
                    <div className="title-row">
                      <h2>{drink.name}</h2>
                      <span className="rating-pill">{drink.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className={isExpanded ? "swipe-body expanded" : "swipe-body"}>
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
                        {isTried ? "Already in profile" : "Swipe right to save"}
                      </span>
                      <span className={isLiked ? "status-pill active" : "status-pill"}>
                        {isLiked ? "Liked" : "Double tap to like"}
                      </span>
                    </div>
                    <div className="swipe-actions">
                      <button
                        className="secondary-button danger-button"
                        onClick={() => advanceCard(drink, "left")}
                      >
                        Not Tried
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => advanceCard(drink, "right")}
                      >
                        Tried
                      </button>
                    </div>
                  </div>
                </section>
              </article>
            );
          })}
        </div>

        {showRatePrompt ? (
          <div className="rate-later-card feed-rate-card">
            <div>
              <strong>{lastTriedName}</strong>
              <p>Add a quick rating later to sharpen your recommendations.</p>
            </div>
            <button className="ghost-button" onClick={() => setShowRatePrompt(false)}>
              Later
            </button>
          </div>
        ) : null}

        {feedback ? <div className="feedback-banner feed-feedback">{feedback}</div> : null}
      </section>
    </div>
  );
}
