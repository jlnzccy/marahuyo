import { Libre_Baskerville, Instrument_Serif, Figtree } from "next/font/google";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

// Highcrest — personal-use display face used for the wordmark / logo only.
export const highcrest = localFont({
  src: "../assets/fonts/Highcrest.ttf",
  display: "swap",
  weight: "400",
  variable: "--font-highcrest"
});

export const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-libre-baskerville"
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
  variable: "--font-instrument-serif"
});

export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-figtree"
});

export const geistMono = GeistMono;

export const fontVariables = [
  libreBaskerville.variable,
  instrumentSerif.variable,
  figtree.variable,
  geistMono.variable,
  highcrest.variable
].join(" ");
