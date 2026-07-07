"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";

const defaultStaggerTimes = {
  char: 0.03,
  word: 0.05,
  line: 0.1
};

const defaultContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  },
  exit: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const presetVariants = {
  fade: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    }
  },
  slide: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    }
  },
  scale: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0 }
    }
  },
  blur: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(12px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(12px)" }
    }
  },
  "fade-in-blur": {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: { opacity: 0, y: 20, filter: "blur(12px)" }
    }
  }
};

const splitText = (text, per) => {
  if (per === "line") return text.split("\n");
  return text.split(/(\s+)/);
};

const hasTransition = (variant) => (
  variant && typeof variant === "object" && "transition" in variant
);

const createVariantsWithTransition = (baseVariants, transition) => {
  if (!transition) return baseVariants;

  const { exit: _exit, ...mainTransition } = transition;

  return {
    ...baseVariants,
    visible: {
      ...baseVariants.visible,
      transition: {
        ...(hasTransition(baseVariants.visible) ? baseVariants.visible.transition : {}),
        ...mainTransition
      }
    },
    exit: {
      ...baseVariants.exit,
      transition: {
        ...(hasTransition(baseVariants.exit) ? baseVariants.exit.transition : {}),
        ...mainTransition,
        staggerDirection: -1
      }
    }
  };
};

const segmentStyle = {
  display: "inline-block",
  whiteSpace: "pre"
};

const lineStyle = {
  display: "block"
};

const AnimationComponent = React.memo(function AnimationComponent({
  segment,
  variants,
  per,
  segmentWrapperClassName
}) {
  const content = per === "line" ? (
    <motion.span variants={variants} style={lineStyle}>
      {segment}
    </motion.span>
  ) : per === "word" ? (
    <motion.span aria-hidden="true" variants={variants} style={segmentStyle}>
      {segment}
    </motion.span>
  ) : (
    <motion.span style={segmentStyle}>
      {segment.split("").map((char, charIndex) => (
        <motion.span
          key={`char-${charIndex}`}
          aria-hidden="true"
          variants={variants}
          style={segmentStyle}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );

  if (!segmentWrapperClassName) return content;

  return (
    <span className={segmentWrapperClassName} style={per === "line" ? lineStyle : segmentStyle}>
      {content}
    </span>
  );
});

export function TextEffect({
  children,
  per = "word",
  as = "p",
  variants,
  className,
  preset = "fade",
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  onAnimationComplete,
  onAnimationStart,
  segmentWrapperClassName,
  containerTransition,
  segmentTransition,
  style,
  ...props
}) {
  const segments = splitText(children, per);
  const MotionTag = motion[as] || motion.p;
  const baseVariants = presetVariants[preset] || presetVariants.fade;
  const stagger = defaultStaggerTimes[per] / speedReveal;
  const baseDuration = 0.3 / speedSegment;
  const customStagger = hasTransition(variants?.container?.visible)
    ? variants.container.visible.transition?.staggerChildren
    : undefined;
  const customDelay = hasTransition(variants?.container?.visible)
    ? variants.container.visible.transition?.delayChildren
    : undefined;
  const computedVariants = {
    container: createVariantsWithTransition(
      variants?.container || baseVariants.container,
      {
        staggerChildren: customStagger ?? stagger,
        delayChildren: customDelay ?? delay,
        ...containerTransition,
        exit: {
          staggerChildren: customStagger ?? stagger,
          staggerDirection: -1
        }
      }
    ),
    item: createVariantsWithTransition(variants?.item || baseVariants.item, {
      duration: baseDuration,
      ...segmentTransition
    })
  };

  return (
    <AnimatePresence mode="popLayout">
      <MotionTag
        initial={trigger ? "hidden" : false}
        animate="visible"
        exit="exit"
        variants={computedVariants.container}
        className={className}
        onAnimationComplete={onAnimationComplete}
        onAnimationStart={onAnimationStart}
        style={style}
        {...props}
      >
        {per !== "line" ? <span className="sr-only">{children}</span> : null}
        {segments.map((segment, index) => (
          <AnimationComponent
            key={`${per}-${index}-${segment}`}
            segment={segment}
            variants={computedVariants.item}
            per={per}
            segmentWrapperClassName={segmentWrapperClassName}
          />
        ))}
      </MotionTag>
    </AnimatePresence>
  );
}
