"use client";

import React from "react";
import { motion } from "motion/react";

const presetVariants = {
  fade: {
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08
        }
      }
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  },
  slide: {
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 18 },
      visible: { opacity: 1, y: 0 }
    }
  },
  scale: {
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08
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
          duration: 0.7
        }
      }
    }
  },
  "blur-slide": {
    container: {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08
        }
      }
    },
    item: {
      hidden: { opacity: 0, filter: "blur(10px)", y: 18 },
      visible: { opacity: 1, filter: "blur(0px)", y: 0 }
    }
  }
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  as = "div",
  itemAs = "div",
  trigger = true,
  onAnimationComplete,
  style,
  ...props
}) {
  const MotionTag = motion[as] || motion.div;
  const MotionItem = motion[itemAs] || motion.div;
  const activeVariants = variants || presetVariants[preset] || presetVariants.fade;

  return (
    <MotionTag
      className={className}
      initial={trigger ? "hidden" : false}
      animate="visible"
      variants={activeVariants.container}
      onAnimationComplete={onAnimationComplete}
      style={style}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <MotionItem variants={activeVariants.item} custom={index}>
          {child}
        </MotionItem>
      ))}
    </MotionTag>
  );
}
