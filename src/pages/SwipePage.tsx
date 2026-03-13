import type { MouseEvent, TouchEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DrinkArtwork } from "../components/DrinkArtwork";
import { getAllDrinks } from "../services/drinkService";
import { getSwipeHintDismissed, setSwipeHintDismissed } from "../lib/storage";
import type { Drink } from "../types";

interface SwipePageProps {
  isAuthenticated: boolean;
  profilePromptDismissals: number;
  profilePromptSwipeCount: number;
  triedDrinks: string[];
  likedDrinks: string[];
  onClose: () => void;
  onOpenAuth: () => void;
  onMarkTried: (drinkId: string) => void;
  onToggleLike: (drinkId: string) => void;
  onProfilePromptDismiss: () => void;
  onProfilePromptSwipeCountChange: (count: number) => void;
}

type GestureMode = "card" | "sheet" | null;
const HEADER_FADE_DISTANCE = 180;

function shuffleDrinks(drinks: Drink[]): Drink[] {
  const copy = [...drinks];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function getHeaderProgress(scrollTop: number, detailsVisible: boolean): number {
  if (detailsVisible) {
    return 0;
  }

  const rawProgress = Math.max(0, 1 - scrollTop / HEADER_FADE_DISTANCE);
  return rawProgress * rawProgress * (3 - 2 * rawProgress);
}

export function SwipePage({
  isAuthenticated,
  profilePromptDismissals,
  profilePromptSwipeCount,
  triedDrinks,
  likedDrinks,
  onClose,
  onOpenAuth,
  onMarkTried,
  onToggleLike,
  onProfilePromptDismiss,
  onProfilePromptSwipeCountChange,
}: SwipePageProps) {
  const candidates = useMemo(() => shuffleDrinks(getAllDrinks()), []);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef(0);
  const singleTapTimeoutRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [headerFadeProgress, setHeaderFadeProgress] = useState(1);
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
  const [showSwipeCoach, setShowSwipeCoach] = useState(true);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

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
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    return () => {
      if (singleTapTimeoutRef.current) {
        window.clearTimeout(singleTapTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = feedRef.current;
    const scrollTop = container?.scrollTop ?? 0;
    setHeaderFadeProgress(getHeaderProgress(scrollTop, detailsVisible));
  }, [detailsVisible]);

  function goToIndex(nextIndex: number) {
    const clamped = Math.max(0, Math.min(nextIndex, candidates.length - 1));
    setActiveIndex(clamped);
    const nextSection = feedRef.current?.children.item(clamped) as HTMLElement | null;
    nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleChoice(drink: Drink, tried: boolean) {
    const alreadyTried = triedDrinks.includes(drink.id);
    const nextSwipeCount = profilePromptSwipeCount + 1;
    const nextPromptThreshold = 2 + profilePromptDismissals * 4;

    onProfilePromptSwipeCountChange(nextSwipeCount);

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

    if (!isAuthenticated && nextSwipeCount >= nextPromptThreshold) {
      setShowProfilePrompt(true);
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

  function scheduleToggleDetails() {
    if (singleTapTimeoutRef.current) {
      window.clearTimeout(singleTapTimeoutRef.current);
    }

    singleTapTimeoutRef.current = window.setTimeout(() => {
      toggleDetails();
      singleTapTimeoutRef.current = null;
    }, 220);
  }

  function toggleDetails() {
    if (showTapHint) {
      setShowTapHint(false);
      setSwipeHintDismissed(true);
    }
    setDetailsVisible((current) => !current);
  }

  function advanceCard(drink: Drink, direction: "left" | "right") {
    setShowSwipeCoach(false);
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

     if (showSwipeCoach && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      setShowSwipeCoach(false);
    }

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

    if (showSwipeCoach) {
      setShowSwipeCoach(false);
    }

    if (showRatePrompt) {
      setShowRatePrompt(false);
    }

    if (showProfilePrompt) {
      setShowProfilePrompt(false);
    }

    if (target.closest("button")) {
      return;
    }

    if (Date.now() < suppressClickUntilRef.current) {
      return;
    }

    if (dragDrinkId === drink.id) {
      return;
    }

    scheduleToggleDetails();
  }

  function handleFeedScroll() {
    const container = feedRef.current;
    if (!container) {
      return;
    }
    if (container.scrollTop > 12) {
      setShowSwipeCoach(false);
    }

    setHeaderFadeProgress(getHeaderProgress(container.scrollTop, detailsVisible));

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
        style={{
          transform: `translateY(${sheetOffsetY}px)`,
          ["--swipe-header-space" as string]: `${92 * headerFadeProgress}px`,
        }}
      >
        <header
          className="swipe-modal-header"
          style={{
            opacity: headerFadeProgress,
            maxHeight: `calc((env(safe-area-inset-top) + 72px) * ${headerFadeProgress})`,
            marginBottom: `${12 * headerFadeProgress}px`,
            paddingTop: `calc((env(safe-area-inset-top) + 14px) * ${headerFadeProgress})`,
            transform: `translateY(${(1 - headerFadeProgress) * -12}px)`,
          }}
        >
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
        <button
          className="swipe-close-button swipe-close-floating"
          style={{ opacity: 1 - headerFadeProgress }}
          onClick={onClose}
          aria-label="Close swipe drinks"
        >
          ×
        </button>

        <div className="swipe-feed" ref={feedRef} onScroll={handleFeedScroll}>
          {candidates.map((drink, index) => {
            const isActive = index === activeIndex;
            const isDragged = dragDrinkId === drink.id;
            const isTried = triedDrinks.includes(drink.id);
            const isLiked = likedDrinks.includes(drink.id);
            const isExpanded = detailsVisible;
            const showCoach = isActive && index === 0 && showSwipeCoach;
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
                  className={[
                    "swipe-card",
                    isDragged ? "swipe-card-dragging" : "",
                    cardLeaving === "left" && isDragged
                      ? "swipe-card-leaving-left"
                      : "",
                    cardLeaving === "right" && isDragged
                      ? "swipe-card-leaving-right"
                      : "",
                    showCoach ? "swipe-card-guide" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
                    <DrinkArtwork drink={drink} hideCaption={isExpanded} />
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

        {showProfilePrompt ? (
          <div className="modal-backdrop swipe-modal-backdrop">
            <div
              className="modal-card profile-prompt-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-prompt-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => {
                  setShowProfilePrompt(false);
                  onProfilePromptDismiss();
                }}
                aria-label="Close profile prompt"
              >
                ×
              </button>
              <p className="eyebrow">Save your history</p>
              <h2 id="profile-prompt-title">Save your drink history</h2>
              <p className="hero-copy">
                Create a profile to track the drinks you&apos;ve tried and the ones
                you like.
              </p>
              <div className="profile-prompt-actions">
                <button
                  className="primary-button"
                  onClick={() => {
                    setShowProfilePrompt(false);
                    onOpenAuth();
                  }}
                >
                  Login / Create Profile
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setShowProfilePrompt(false);
                    onProfilePromptDismiss();
                  }}
                >
                  Continue without profile
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {feedback ? <div className="feedback-banner feed-feedback">{feedback}</div> : null}
      </section>
    </div>
  );
}
