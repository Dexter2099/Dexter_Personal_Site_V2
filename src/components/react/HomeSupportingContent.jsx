import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AnimatedGroup } from "./animated-group";
import { useHomeIntroSequence } from "./home-intro-sequence";

const SPOTIFY_ENDPOINT = "/api/spotify";

const techStackVariants = {
  container: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12
      }
    }
  },
  item: {
    hidden: { opacity: 0, scale: 0.82 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.28,
        duration: 0.68
      }
    }
  }
};

const spotifyVariants = {
  container: {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0,
        staggerChildren: 0.15
      }
    }
  },
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: -60,
      rotateX: 90
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.7
      }
    }
  }
};

function TechIcon({ tech }) {
  if (tech.iconPath) {
    return (
      <svg viewBox="0 0 24 24" focusable="false">
        <path d={tech.iconPath} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 3.75 13.45 8.4 18 10l-4.55 1.6L12 16.25l-1.45-4.65L6 10l4.55-1.6L12 3.75Z" />
      <path d="M18.5 15.25 19.25 17.2 21 18l-1.75.8-.75 1.95-.75-1.95L16 18l1.75-.8.75-1.95Z" />
      <path d="M5.25 14.25 5.9 15.8 7.5 16.5l-1.6.7-.65 1.55-.65-1.55-1.6-.7 1.6-.7.65-1.55Z" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="10" />
      <path d="M7.4 9.2c3.4-1 7.2-.7 10.1 1" />
      <path d="M8.1 12.2c2.8-.8 5.8-.5 8.1.8" />
      <path d="M8.8 15c2-.5 4.2-.3 5.9.6" />
    </svg>
  );
}

export default function HomeSupportingContent({ techStack, initialTracks }) {
  const { shouldAnimate, markIntroComplete } = useHomeIntroSequence();
  const [tracks, setTracks] = useState(initialTracks);

  useEffect(() => {
    async function refreshSpotifyTracks() {
      try {
        const response = await fetch(SPOTIFY_ENDPOINT, {
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) return;

        const payload = await response.json();
        const tracks = Array.isArray(payload.tracks) ? payload.tracks : [];

        if (tracks.length > 0) {
          setTracks(tracks);
        }
      } catch {
        // Keep the server-provided fallback rows visible.
      }
    }

    refreshSpotifyTracks();
  }, []);

  return (
    <section className="home-supporting-content" aria-label="Home supporting content">
      <section className="home-card tech-stack" aria-label="Tech Stack">
        <AnimatedGroup
          as="ul"
          itemAs="li"
          className="tech-stack__list"
          aria-label="Core technologies"
          preset="scale"
          variants={techStackVariants}
          trigger={shouldAnimate}
          onAnimationComplete={shouldAnimate ? markIntroComplete : undefined}
        >
          {techStack.map((tech) => (
            <span key={tech.name} className="tech-stack__chip" tabIndex="0" aria-label={tech.name} title={tech.name}>
              <span className="tech-stack__icon" aria-hidden="true">
                <TechIcon tech={tech} />
              </span>
              <span className="tech-stack__name">{tech.name}</span>
            </span>
          ))}
        </AnimatedGroup>
      </section>

      <section className="home-card spotify-card" aria-labelledby="spotify-title">
        <motion.div
          className="home-card__header"
          initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="spotify-card__icon" aria-hidden="true">
            <SpotifyIcon />
          </span>
          <h2 id="spotify-title">On rotation</h2>
        </motion.div>
        <AnimatedGroup
          as="ol"
          itemAs="li"
          className="spotify-card__list"
          variants={spotifyVariants}
          trigger={shouldAnimate}
        >
          {tracks.map((track) => (
            <div key={`${track.title}-${track.artists}`} className="spotify-card__row">
              <span className="spotify-card__art" aria-hidden="true">
                {track.albumImageUrl ? (
                  <img src={track.albumImageUrl} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span>♪</span>
                )}
              </span>
              <span className="spotify-card__details">
                {track.url ? (
                  <a className="spotify-card__track" href={track.url} target="_blank" rel="noreferrer">
                    {track.title}
                  </a>
                ) : (
                  <span className="spotify-card__track">{track.title}</span>
                )}
                <span className="spotify-card__artist">{track.artists}</span>
              </span>
            </div>
          ))}
        </AnimatedGroup>
      </section>
    </section>
  );
}
