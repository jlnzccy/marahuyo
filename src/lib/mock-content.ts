import type { AnyWork, Chapter, Series, StandaloneWork } from "@/types/content";

// =============================================================================
// Gradient cover helper
// =============================================================================
//
// Picsum placeholders replaced with self-contained SVG data URIs so the local
// fallback (when DB is empty) shows tone-appropriate gradients instead of random
// stock photos. Real covers are uploaded via /studio/works/[id] → CoverUploader.

function gradientCover(from: string, to: string, deg = 135): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><linearGradient id='g' gradientTransform='rotate(${deg} 0.5 0.5)'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>` +
    `</linearGradient></defs><rect width='1000' height='1000' fill='url(%23g)'/></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
}

// =============================================================================
// Author voice
// =============================================================================

export const AUTHOR = {
  name: "Jae Cua",
  handle: "marahuyo",
  tagline: "to be enchanted.",
  shortBio:
    "Filipino writer. Notes from a quiet kid who keeps forgetting his own ideas.",
  bio:
    "I read, write, and come up with some nonsense things — especially when I'm hungry at night. I'm hoping the archive will save some of my thoughts before I forget them like I never had them. Mostly small dispatches. Occasionally amazing ideas that would have otherwise gone to waste.",
  /** Long-form Tagalog self-portrait shown on About page. */
  bioLong: `<p class="drop-cap">Isang hamak na bata na parating lutang ang isip. Parating may mental block. Naniniwala siyang minsan ay may nakatabi siyang isang alien. Naniniwala rin siyang noong past life niya ay isa siyang cactus na nasa paso.</p>
<p>Isa sa mga hobbies niya ay ang magbura ng mga text messages sa kanyang bukbuking cellphone. Paborito niyang kumain ng tukneneng at kwek-kwek. Marunong siyang magbasa ng sanskrit kapag tulog. Mahilig din siyang magluto ng walang lasa.</p>
<p>Isang katangian niya ay ang pagiging tahimik na kapag nag-uumpukan kayo ay hindi mo mapapansin na naroon siya, dahil paborito niyang superhero si Invisible Man. Kapag wala siyang kasama sa mga lakad niya, asahan mo nang mawawala siya.</p>
<p>Sumali siya minsan sa isang ballet dance workshop pero napatalsik din nang mapilay niya ang isang ballerina dahil nasipa siya nito. Napurnada tuloy ang pangarap niyang maging isang swan. Ngayon ay isa na siyang flamingo.</p>
<p class="font-italic italic">Paboritong anak ni St. Ignatius.</p>`,
  subtitle: "Dating cactus sa paso.",
  location: "Quezon City, Philippines",
  /** Replace with a real portrait when you have one. */
  portraitUrl: gradientCover("#fde68a", "#a16207", 165),
  /** Used as Instagram/social profile imagery in cards. */
  avatarUrl: gradientCover("#fde68a", "#a16207", 165)
};

// =============================================================================
// Standalone works — essays, oneshots, poems
// =============================================================================

export const ESSAYS: StandaloneWork[] = [
  {
    id: "essay-wrapped",
    slug: "wrapped",
    title: "Wrapped",
    subtitle:
      "the algorithm doesn't know who you listened with. this is its mercy. this is also the other thing.",
    kind: "essay",
    status: "published",
    publishedAt: "2026-05-17",
    tags: ["essay", "memory", "music"],
    excerpt:
      "the algorithm doesn't know who you listened with. this is its mercy. this is also the other thing.",
    wordCount: 1240,
    readingMinutes: 2,
    coverImage: gradientCover("#1a2540", "#c9a96a", 150),
    body: `<p class="drop-cap">The bus was the 11 PM Victory Liner to Baguio, ₱550, the kind where the AC drips on whoever has the window seat and they pretend not to notice for the first hour and then give up and shift their bag onto their lap so it doesn't get wet.</p>
<p>He had the window. The other one had the aisle.</p>
<p>Two hours. Somewhere past Bulacan the other one pulled out one earbud and held it out without looking, the way you offer somebody a piece of food you're not sure they'll want, and he took it because what else do you do with an earbud somebody is holding out to you at 1 AM on a bus.</p>
<p>The artist was somebody he'd never heard of. <em>Toneejay</em>. Filipino indie, the kind he'd always thought was for people who took themselves too seriously, until it wasn't, until <em>Bawat Piyesa</em> was playing and the bus was going through the part of the road where there are no lights for a long time and the other one had his eyes closed and his head was leaning against the seatback at an angle that meant he wasn't asleep, just listening, and the earbud in his ear was warm because it had been in the other one's ear for the last hour and a half.</p>
<p>He didn't say anything. The other one didn't say anything. The song ended and the next one started and they kept the earbud where it was.</p>
<hr/>
<p>The Spotify Wrapped came out months later. The other one had stopped texting back by then. <em>Bawat Piyesa</em> was his top song of the year, the algorithm said. He stared at the slide for a long time, the way you stare at a photograph of a stranger and try to figure out where you have seen them before, and then you realize you have not.</p>
<p>The thing about Wrapped is that it does not know about the earbud. It does not know whose ear the song was warm from. It just counts plays. To Spotify, a song is a song. To Spotify, he listened to <em>Bawat Piyesa</em> one hundred and forty-seven times last year. To Spotify, this is just a number.</p>
<blockquote>The algorithm doesn&rsquo;t know who you listened with. This is its mercy. This is also the other thing.</blockquote>
<p>He plays it again now sometimes. Not often. The dark stretch past Bulacan does not come back when he plays it. The warmth of the earbud does not come back. What comes back is the bus, the way the AC dripped, the smell of the seat cover, and a slow, careful refusal to look to his left.</p>
<p class="font-italic italic">There is a kind of grief that does not know it is grief. It thinks it is just a song you like.</p>`
  },
  {
    id: "essay-the-filipina-bebot",
    slug: "the-filipina-bebot",
    title: "The Filipina Bebot",
    subtitle: "Apologising to the Girls We Called Cheap.",
    kind: "essay",
    status: "published",
    publishedAt: "2026-02-07",
    tags: ["essay", "culture", "Filipino"],
    excerpt:
      "What the Black Eyed Peas video taught us about who got to be sexy, and who got to be a joke. A long apology, twenty years late.",
    wordCount: 1640,
    readingMinutes: 8,
    coverImage: gradientCover("#9b3a4a", "#e0a87a", 140),
    body: `<p class="drop-cap">My older cousins played the <em>Bebot</em> music video on loop in 2006 and we, the small ones in the back of the living room, learned the choreography from the seats of plastic monoblocs. We did not yet have the language for what we were watching. We had the choreography. That was almost the same thing.</p>
<p>What I remember now is not the song. The song is fine. What I remember is the way the camera moved when the girls came on. The way the boys in the video looked at them. The way our titos in the back laughed in a particular register I would not understand for another ten years.</p>
<p>The girls in the <em>Bebot</em> video were Filipinas. They were also, the video made very clear, a punchline. A spectacle. A delivery system for a chorus that was, on its surface, a love song, and underneath, a very specific kind of joke about who Filipina girls were allowed to be on a global stage.</p>
<h3>What the chorus actually said</h3>
<p>I will not transcribe the lyrics here. You can look them up. What I want to talk about is the gap — the gap between what we, as children, learned to chant in the back of someone's car in Manila traffic, and what the lyrics were actually doing to the girls they were ostensibly about.</p>
<p>We learned, very young, that there were two kinds of Filipina girls in the public imagination: the one you wrote a love song <em>to</em>, and the one you wrote a love song <em>at</em>. The <em>Bebot</em> video did not invent this distinction. It only made it incredibly easy to dance to.</p>
<blockquote>I am sorry to every girl I called cheap because I had been taught that the word was funny.</blockquote>
<h3>An apology, twenty years late</h3>
<p>I am writing this because my cousin's daughter, who is twelve, asked me last week what <em>bebot</em> means, and I realised I had been carrying the answer around for two decades without ever saying it out loud.</p>
<p>I am sorry to every girl I called <em>cheap</em> because I had been taught that the word was funny. I am sorry for the laughter in the back of the living room. I am sorry for thinking it was a joke instead of a script.</p>
<p>The girls in the video were doing their job. They were dancing well. They were beautiful. The joke was never theirs. The joke was the camera's, and the camera belonged to us.</p>
<p class="font-italic italic">Photo: screenshot from YouTube / Black Eyed Peas, <em>Bebot</em> (2006).</p>`
  }
];

export const ONESHOTS: StandaloneWork[] = [
  {
    id: "oneshot-random-bs",
    slug: "random-bs-i-come-up-with-at-3am",
    title: "Random BS I come up with at 3 a.m.",
    subtitle: "a small archive against forgetting",
    kind: "oneshot",
    status: "published",
    publishedAt: "2026-05-25",
    tags: ["notes", "personal"],
    excerpt:
      "I read, write, and come up with some nonsense things — especially when I'm hungry at night.",
    wordCount: 380,
    readingMinutes: 2,
    coverImage: gradientCover("#2d3a36", "#d6ccb0", 155),
    body: `<p class="drop-cap">I read, write, and come up with some nonsense things especially when I'm hungry at night.</p>
<p>I think by doing this kind of thing it will save some of my thoughts — or else I'll forget them like I had never thought of them. It's not all about bullshit or nonsense. In fact, I sometimes come up with amazing ideas that go to waste because I either forget them or can't remember them later.</p>
<p>Constantly making your brain rack just to remember what it is again — how funny, how ridiculous it can be — but having a bad short-term memory <em>sucks</em>.</p>
<hr/>
<p>So this is the deal. The archive runs on 3 a.m. logic. You will find:</p>
<ul>
  <li>half-thoughts I want to keep,</li>
  <li>quiet jokes I made up while waiting for the kettle,</li>
  <li>and the occasional sentence I will be too embarrassed to publish at noon.</li>
</ul>
<p class="font-italic italic">Tomorrow-me will hate it. Tonight-me does not care.</p>`
  }
];

export const POEMS: StandaloneWork[] = [
  {
    id: "poem-cactus-sa-paso",
    slug: "cactus-sa-paso",
    title: "Cactus sa paso",
    subtitle: "a small note from a past life",
    kind: "poem",
    status: "published",
    publishedAt: "2026-01-14",
    tags: ["poem", "Filipino", "memory"],
    excerpt:
      "Naniniwala rin siyang noong past life niya ay isa siyang cactus na nasa paso. Tonight he remembers why.",
    wordCount: 96,
    readingMinutes: 1,
    poetryMode: true,
    coverImage: gradientCover("#7a4a30", "#d4a574", 135),
    body: `<div class="poetry">noong past life ko raw
ay isa akong cactus
na nasa paso.

   maliit.
   matinik.
   tahimik.

di ako umiinom ng tubig
ng mga ilang araw,
at di rin naman ako namamatay.

ngayon
ay tao na ako —
pero sa loob,

   maliit pa rin.
   matinik pa rin.
   tahimik pa rin.

at minsan,
kapag tinatanong ako
kung kumusta,

sinasagot ko nang,
&ldquo;okay lang naman&rdquo;,

kasi ganoon talaga
kapag cactus ka
sa paso.</div>`
  }
];

// =============================================================================
// Series — kept as a draft container for future episodic work
// =============================================================================

const SLEEPLESS_CHAPTERS: Chapter[] = [
  {
    id: "ch-1",
    seriesId: "series-sleepless",
    slug: "the-first-night",
    number: 1,
    title: "The First Night",
    subtitle: "in which the lights stay on",
    status: "draft",
    wordCount: 0,
    readingMinutes: 0,
    body: "",
    poetryMode: false
  }
];

export const SERIES: Series[] = [
  {
    id: "series-sleepless",
    slug: "mga-gabing-hindi-natutulog",
    title: "Mga Gabing Hindi Natutulog",
    subtitle: "an upcoming serial — first chapter soon",
    kind: "series",
    status: "draft",
    publishedAt: undefined,
    tags: ["series", "upcoming"],
    excerpt:
      "A slow serial about the nights you do not sleep through. Still in the notebook stage.",
    wordCount: 0,
    readingMinutes: 0,
    coverImage: gradientCover("#1f2630", "#5a6478", 175),
    coverColor: "rgb(82 82 88 / 0.18)",
    chapters: SLEEPLESS_CHAPTERS
  }
];

// =============================================================================
// Aggregates + lookups
// =============================================================================

export const ALL_WORKS: AnyWork[] = [...POEMS, ...ESSAYS, ...ONESHOTS, ...SERIES];

export function findStandaloneBySlug(slug: string): StandaloneWork | undefined {
  return [...POEMS, ...ESSAYS, ...ONESHOTS].find((w) => w.slug === slug);
}

export function findSeriesBySlug(slug: string): Series | undefined {
  return SERIES.find((s) => s.slug === slug);
}

export function findChapter(seriesSlug: string, chapterSlug: string) {
  const series = findSeriesBySlug(seriesSlug);
  if (!series) return undefined;
  const chapter = series.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) return undefined;
  return { series, chapter };
}

/** Featured work surfaced on the homepage hero. */
export const FEATURED_WORK: AnyWork = ESSAYS[0]; // "Wrapped"
