import { useState } from "react";

export const HOME_CONTENT_EFFECT_PLAYED_KEY = "dexter-home-content-effect-played";

function hasHomeContentPlayed() {
  if (typeof window === "undefined") return false;

  return window.sessionStorage.getItem(HOME_CONTENT_EFFECT_PLAYED_KEY) === "true";
}

export function useHomeIntroSequence() {
  const [hasPlayed, setHasPlayed] = useState(() => hasHomeContentPlayed());
  const shouldAnimate = !hasPlayed;

  const markIntroComplete = () => {
    window.sessionStorage.setItem(HOME_CONTENT_EFFECT_PLAYED_KEY, "true");
    setHasPlayed(true);
  };

  return { shouldAnimate, markIntroComplete };
}
