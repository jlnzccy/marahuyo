"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10%" } as const;

type MotionWrapperProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
};

export function FadeUp({
  delay = 0,
  duration = 0.7,
  className,
  children,
  ...rest
}: MotionWrapperProps & { delay?: number; duration?: number }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={cn(className)}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  delay = 0,
  duration = 0.6,
  className,
  children,
  ...rest
}: MotionWrapperProps & { delay?: number; duration?: number }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={cn(className)}>{children}</div>;
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  staggerChildren = 0.08,
  className,
  ...rest
}: MotionWrapperProps & { staggerChildren?: number }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={cn(className)}>{children}</div>;
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren } }
      }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export const staggerChild = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }
};

export { EASE };
