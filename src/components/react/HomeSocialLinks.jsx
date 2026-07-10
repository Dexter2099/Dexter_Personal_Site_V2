import { AnimatedGroup } from "./animated-group";
import { useHomeIntroSequence } from "./home-intro-sequence";

const hoverLabels = {
  GitHub: "Github",
  LinkedIn: "Linkedin",
  Email: "Email"
};

function SocialIcon({ label }) {
  if (label === "GitHub") {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 1.75C6.34 1.75 1.75 6.42 1.75 12.18c0 4.61 2.93 8.52 7.01 9.9.51.1.69-.23.69-.5 0-.25-.01-1.08-.01-1.95-2.85.63-3.45-1.22-3.45-1.22-.47-1.22-1.14-1.54-1.14-1.54-.93-.65.07-.64.07-.64 1.03.07 1.58 1.08 1.58 1.08.91 1.59 2.4 1.13 2.98.86.09-.68.36-1.13.65-1.39-2.28-.27-4.67-1.17-4.67-5.19 0-1.15.4-2.09 1.06-2.83-.11-.27-.46-1.35.1-2.82 0 0 .87-.28 2.85 1.08.83-.24 1.71-.36 2.59-.37.88 0 1.77.13 2.6.37 1.97-1.36 2.84-1.08 2.84-1.08.56 1.47.21 2.55.1 2.82.66.74 1.06 1.68 1.06 2.83 0 4.03-2.39 4.91-4.68 5.18.37.33.7.97.7 1.95 0 1.41-.01 2.55-.01 2.9 0 .28.18.61.7.5 4.07-1.39 6.99-5.29 6.99-9.9C22.25 6.42 17.66 1.75 12 1.75Z" />
      </svg>
    );
  }

  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M5.32 8.35a1.82 1.82 0 1 1 0-3.65 1.82 1.82 0 0 1 0 3.65Zm-1.57 1.38h3.14v10.12H3.75V9.73Zm5.1 0h3.01v1.38h.04c.42-.8 1.44-1.64 2.96-1.64 3.16 0 3.74 2.08 3.74 4.79v5.59h-3.14v-4.95c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.91 1.29-1.91 2.61v5.04H8.85V9.73Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4.5 7.25h15v9.5h-15z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m5.5 8 6.5 5 6.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomeSocialLinks({ socialLinks }) {
  const { isReady, shouldAnimate } = useHomeIntroSequence();
  const reservedSocialStyle = isReady ? undefined : { visibility: "hidden", pointerEvents: "none" };

  return (
    <AnimatedGroup
      key={isReady ? "ready" : "reserved"}
      className="hero__links home-socials"
      aria-label="Profile links"
      aria-hidden={!isReady}
      preset="scale"
      trigger={shouldAnimate}
      style={reservedSocialStyle}
    >
      {socialLinks.map((link) => (
        <a
          key={link.label}
          className="home-social-link"
          href={link.href}
          aria-label={link.ariaLabel}
          target={link.href.startsWith("http") ? "_blank" : undefined}
          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
        >
          <span className="home-social-link__icon" aria-hidden="true">
            <SocialIcon label={link.label} />
          </span>
          <span className="home-social-link__label" aria-hidden="true">{hoverLabels[link.label] ?? link.label}</span>
          <span className="sr-only">{link.label}</span>
        </a>
      ))}
    </AnimatedGroup>
  );
}
