"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * Drop-in for `next/image` that fades the bitmap in once decoded. The parent
 * container is expected to render a `bg-surface` (or similar) skeleton so
 * there's no white flash while the image is still streaming.
 *
 * Opacity is applied inline so it composes cleanly with whatever transform
 * transition the call-site stacks on top (e.g. hover scale).
 */
export function BlurImage({ style, alt, onLoad, ...rest }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...rest}
      alt={alt}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    />
  );
}
