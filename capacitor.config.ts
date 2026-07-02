import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor runs in REMOTE-URL mode: the APK is a thin native shell whose
 * WebView loads a hosted Next.js site (not bundled web assets), so site/content
 * updates ship via the normal Vercel deploy — the APK only changes when native
 * plugins change.
 *
 * Targets:
 *   - Production (default): https://marahuyo.art
 *   - Dev on a physical device: set CAP_SERVER_URL to your PC's LAN address,
 *     e.g.  CAP_SERVER_URL=http://192.168.1.50:3000  (run `next dev -H 0.0.0.0`
 *     so the dev server is reachable from the phone on the same Wi-Fi).
 *
 * `webDir` points at `public/` only to satisfy the CLI; in remote mode the
 * bundled assets aren't served — `server.url` wins.
 */

const devUrl = process.env.CAP_SERVER_URL;

let devHost: string | null = null;
if (devUrl) {
  try {
    devHost = new URL(devUrl).hostname;
  } catch (e) {
    devHost = devUrl.replace(/^https?:\/\//, "").split(":")[0];
  }
}

const config: CapacitorConfig = {
  appId: "com.marahuyo.art",
  appName: "Marahuyo",
  webDir: "public",
  server: devUrl
    ? {
        url: devUrl,
        cleartext: true,
        allowNavigation: devHost ? [devHost, "marahuyo.art", "*.marahuyo.art"] : ["marahuyo.art", "*.marahuyo.art"],
      }
    : {
        url: "https://www.marahuyo.art",
        androidScheme: "https",
        allowNavigation: ["marahuyo.art", "*.marahuyo.art"],
      },
  backgroundColor: "#FDFBF7",
  plugins: {
    SplashScreen: {
      // The web app hides the splash itself on first paint (see splash plugin
      // call in the shell bridge), so don't auto-hide on a timer.
      launchAutoHide: false,
      backgroundColor: "#FDFBF7",
      androidSpinnerStyle: "small",
      showSpinner: false,
    },
    StatusBar: {
      // The app drives status-bar color per reading theme at runtime; this is
      // only the pre-hydration default (Cream canvas).
      overlaysWebView: false,
      style: "LIGHT", // dark icons on light bg (Android: LIGHT = dark content)
      backgroundColor: "#FDFBF7",
    },
  },
};

export default config;
