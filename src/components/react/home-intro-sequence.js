import { useEffect, useState } from "react";

export const HOME_CONTENT_EFFECT_PLAYED_KEY = "dexter-home-content-effect-played";
export const HERO_TITLE_EFFECT_PLAYED_KEY = "dexter-hero-title-effect-played";
export const HERO_TITLE_EFFECT_COMPLETE_EVENT = "hero-title-effect-complete";

function hasHomeContentPlayed() {
  if (typeof window === "undefined") return false;

  return window.sessionStorage.getItem(HOME_CONTENT_EFFECT_PLAYED_KEY) === "true";
}

function hasHeroTitlePlayed() {
  if (typeof window === "undefined") return false;

  return window.sessionStorage.getItem(HERO_TITLE_EFFECT_PLAYED_KEY) === "true";
}

export function useHomeIntroSequence() {
  const [hasPlayed, setHasPlayed] = useState(() => hasHomeContentPlayed());
  const [isReady, setIsReady] = useState(() => (
    hasHomeContentPlayed() || hasHeroTitlePlayed()
  ));
  const shouldAnimate = isReady && !hasPlayed;

  useEffect(() => {
    function handleHeroComplete() {
      setIsReady(true);
    }

    window.addEventListener(HERO_TITLE_EFFECT_COMPLETE_EVENT, handleHeroComplete);

    if (hasHeroTitlePlayed()) {
      window.setTimeout(handleHeroComplete, 0);
    }

    return () => window.removeEventListener(HERO_TITLE_EFFECT_COMPLETE_EVENT, handleHeroComplete);
  }, []);

  const markIntroComplete = () => {
    window.sessionStorage.setItem(HOME_CONTENT_EFFECT_PLAYED_KEY, "true");
    setHasPlayed(true);
  };

  return { isReady, shouldAnimate, markIntroComplete };
}
