import { useState } from "react";
import { TextEffect } from "./text-effect";

const HERO_TITLE_EFFECT_PLAYED_KEY = "dexter-hero-title-effect-played";

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

  return (
    <>
      <TextEffect
        as="h1"
        per="char"
        preset="fade"
        id="home-title"
        containerTransition={{ staggerChildren: 0.1 }}
        segmentTransition={{ duration: 0.4 }}
        trigger={shouldAnimate}
      >
        Dexter Mehta
      </TextEffect>
      <TextEffect
        as="p"
        per="char"
        preset="fade"
        className="hero__role"
        containerTransition={{ staggerChildren: 0.1 }}
        segmentTransition={{ duration: 0.4 }}
        trigger={shouldAnimate}
        onAnimationComplete={handleAnimationComplete}
      >
        Backend Developer
      </TextEffect>
    </>
  );
}
