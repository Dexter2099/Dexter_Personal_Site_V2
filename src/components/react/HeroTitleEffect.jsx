import { useEffect, useState } from "react";
import { TextEffect } from "./text-effect";

const HERO_TITLE_EFFECT_PLAYED_KEY = "dexter-hero-title-effect-played";
const HERO_TITLE_EFFECT_COMPLETE_EVENT = "hero-title-effect-complete";

export default function HeroTitleEffect() {
  const [hasPlayed, setHasPlayed] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.sessionStorage.getItem(HERO_TITLE_EFFECT_PLAYED_KEY) === "true";
  });

  const handleAnimationComplete = () => {
    window.sessionStorage.setItem(HERO_TITLE_EFFECT_PLAYED_KEY, "true");
    setHasPlayed(true);
  };
  const shouldAnimate = !hasPlayed;

  const notifyTitleComplete = () => {
    window.dispatchEvent(new Event(HERO_TITLE_EFFECT_COMPLETE_EVENT));
  };

  useEffect(() => {
    if (hasPlayed) {
      window.setTimeout(notifyTitleComplete, 0);
    }
  }, [hasPlayed]);

  return (
    <>
      <TextEffect
        as="h1"
        per="char"
        preset="fade"
        id="home-title"
        trigger={shouldAnimate}
      >
        Dexter Mehta
      </TextEffect>
      <TextEffect
        as="p"
        per="char"
        preset="fade"
        className="hero__role"
        delay={0.35}
        trigger={shouldAnimate}
        onAnimationComplete={handleAnimationComplete}
      >
        Backend Developer
      </TextEffect>
    </>
  );
}
