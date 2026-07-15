import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import "./Dock.css";

const iconPaths = {
  home: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h5v-6h4v6h5V9.5"],
  briefcase: ["M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", "M4 7h16v13H4z", "M4 12h16"],
  folder: ["M3 6h7l2 2h9v13H3z", "M3 10h18"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 21a7.5 7.5 0 0 1 15 0"],
  mail: ["M4 6h16v14H4z", "m4 7 8 7 8-7"]
};

const pathIsCurrent = (currentPath, href) => {
  if (href === "/") return currentPath === "/";
  return currentPath.startsWith(href);
};

function DockItem({ item, currentPath, mouseY, spring, distance, magnification, baseItemSize }) {
  const ref = useRef(null);
  const mouseDistance = useTransform(mouseY, (value) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      y: 0,
      height: baseItemSize
    };

    return value - rect.y - rect.height / 2;
  });
  const targetScale = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, magnification / baseItemSize, 1]
  );
  const scale = useSpring(targetScale, spring);
  const isCurrent = pathIsCurrent(currentPath, item.href);

  const focusItem = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) mouseY.set(rect.y + rect.height / 2);
  };

  return (
    <li
      ref={ref}
      className="dock-item"
      style={{ height: baseItemSize }}
    >
      <a
        className={`dock-item__link${isCurrent ? " dock-item__link--active" : ""}`}
        href={item.href}
        aria-label={item.label}
        aria-current={isCurrent ? "page" : undefined}
        onFocus={focusItem}
        onBlur={() => mouseY.set(Infinity)}
      >
        <motion.span className="dock-icon" style={{ scale }} aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            {iconPaths[item.icon].map((path) => <path d={path} key={path} />)}
          </svg>
        </motion.span>
        <span className="dock-label">{item.label}</span>
      </a>
    </li>
  );
}

export default function Dock({
  items = [],
  currentPath = "/",
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 68,
  distance = 110,
  baseItemSize = 52
}) {
  const mouseY = useMotionValue(Infinity);

  return (
    <div className="dock-outer">
      <ul
        className={`dock-panel ${className}`}
        onMouseMove={({ clientY }) => mouseY.set(clientY)}
        onMouseLeave={() => mouseY.set(Infinity)}
      >
        {items.map((item) => (
          <DockItem
            key={item.href}
            item={item}
            currentPath={currentPath}
            mouseY={mouseY}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
          />
        ))}
      </ul>
    </div>
  );
}
