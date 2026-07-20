// Shared Framer Motion variants. Snappy (150–250ms), consistent easing.
export const EASE = [0.22, 1, 0.36, 1] // easeOutExpo-ish, feels premium

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: EASE } },
}

// Stagger children for list reveals
export const listContainer = {
  enter: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
}

export const listItem = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  // Slide out to the right when a bill is removed (paid/deleted)
  exit: {
    opacity: 0,
    x: 60,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.2, ease: EASE },
  },
}

export const sheetBackdrop = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const sheetPanel = {
  initial: { y: '100%' },
  enter: { y: 0, transition: { duration: 0.28, ease: EASE } },
  exit: { y: '100%', transition: { duration: 0.2, ease: EASE } },
}

// Reusable tap feedback for buttons / interactive cards
export const tap = { scale: 0.97 }
