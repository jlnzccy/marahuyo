"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FadeUp({
  delay = 0,
  duration = 0.7,
  className,
  children,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number; duration?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
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
}: HTMLMotionProps<"div"> & { delay?: number; duration?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
}: HTMLMotionProps<"div"> & { staggerChildren?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
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
