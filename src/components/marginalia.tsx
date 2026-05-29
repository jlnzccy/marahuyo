"use client";

import { useEffect } from "react";

/**
 * Reader-side decoration for the author's margin notes. The body HTML already
 * carries `<span class="marginalia" data-note="…">anchor</span>` (written in
 * Studio, preserved through sanitize). On mount this:
 *
 *  - numbers each anchor and inserts a superscript marker button after it;
 *  - builds the note element and reveals it on click / Enter / Space;
 *  - on wide screens (≥1280px) floats the open note into the right gutter,
 *    aligned to its anchor and stacked to avoid overlap; below that it reveals
 *    inline beneath the line.
 *
 * Pure DOM enhancement so it rides on the existing static prose — no rerender,
 * no server change. Idempotent via a `data-mn-ready` flag, and fully torn down
 * on unmount (so React StrictMode's double-invoke stays clean).
 */
const DESKTOP = "(min-width: 1280px)";

export function Marginalia() {
  useEffect(() => {
    const prose = document.querySelector<HTMLElement>(".reader-prose");
    if (!prose) return;

    const anchors = Array.from(
      prose.querySelectorAll<HTMLElement>("span.marginalia[data-note]")
    ).filter((el) => !el.dataset.mnReady);
    if (anchors.length === 0) return;

    type Item = { anchor: HTMLElement; note: HTMLElement; marker: HTMLButtonElement };
    const items: Item[] = [];

    anchors.forEach((anchor, i) => {
      const n = i + 1;
      const noteId = `mn-note-${n}`;
      anchor.dataset.mnReady = "1";
      anchor.dataset.mnIndex = String(n);

      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = "marginalia-marker";
      marker.textContent = String(n);
      marker.setAttribute("aria-label", `Margin note ${n}`);
      marker.setAttribute("aria-expanded", "false");
      marker.setAttribute("aria-controls", noteId);
      anchor.after(marker);

      /* A <span> (phrasing content) so it stays valid inside the host <p>;
         CSS gives it block display. */
      const note = document.createElement("span");
      note.className = "marginalia-note";
      note.id = noteId;
      note.dataset.mnIndex = String(n);
      note.hidden = true;
      note.setAttribute("role", "note");

      const num = document.createElement("span");
      num.className = "marginalia-note-num";
      num.textContent = String(n);
      const body = document.createElement("span");
      body.className = "marginalia-note-body";
      body.textContent = anchor.dataset.note ?? "";
      note.append(num, body);
      marker.after(note);

      items.push({ anchor, note, marker });
    });

    const mq = window.matchMedia(DESKTOP);

    const layout = () => {
      const desktop = mq.matches;
      prose.style.position = desktop ? "relative" : "";
      const proseTop = desktop ? prose.getBoundingClientRect().top : 0;
      let lastBottom = -Infinity;
      for (const { anchor, note } of items) {
        if (!desktop) {
          note.classList.remove("is-margin");
          note.style.top = "";
          continue;
        }
        note.classList.add("is-margin");
        if (note.hidden) continue;
        const aTop = anchor.getBoundingClientRect().top - proseTop;
        const top = Math.max(aTop, lastBottom + 12);
        note.style.top = `${top}px`;
        lastBottom = top + note.offsetHeight;
      }
    };

    const toggle = (item: Item) => {
      const open = item.note.hidden;
      item.note.hidden = !open;
      item.marker.setAttribute("aria-expanded", String(open));
      layout();
    };

    const cleanups = items.map((item) => {
      const onMarker = () => toggle(item);
      const onAnchor = () => toggle(item);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(item);
        }
      };
      item.marker.addEventListener("click", onMarker);
      item.marker.addEventListener("keydown", onKey);
      item.anchor.addEventListener("click", onAnchor);
      return () => {
        item.marker.removeEventListener("click", onMarker);
        item.marker.removeEventListener("keydown", onKey);
        item.anchor.removeEventListener("click", onAnchor);
      };
    });

    const onResize = () => layout();
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      let changed = false;
      for (const { note, marker } of items) {
        if (!note.hidden) {
          note.hidden = true;
          marker.setAttribute("aria-expanded", "false");
          changed = true;
        }
      }
      if (changed) layout();
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onEsc);
    mq.addEventListener("change", layout);
    layout();

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onEsc);
      mq.removeEventListener("change", layout);
      cleanups.forEach((fn) => fn());
      for (const { anchor, note, marker } of items) {
        marker.remove();
        note.remove();
        delete anchor.dataset.mnReady;
        delete anchor.dataset.mnIndex;
      }
      prose.style.position = "";
    };
  }, []);

  return null;
}
