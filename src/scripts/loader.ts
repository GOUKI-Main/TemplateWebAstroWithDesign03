import { gsap, EASE, DUR } from "./motion";

const SEEN_KEY = "site:loader-seen";

/** 読み込みが速すぎてもロゴが一瞬で消えないよう、最低限これだけは見せる */
const MIN_VISIBLE_MS = 900;
/** 回線が遅くても必ず先へ進むための上限 */
const MAX_WAIT_MS = 2500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** フォントとヒーロー画像の準備完了。ただし MAX_WAIT_MS で必ず打ち切る。 */
function assetsReady(): Promise<unknown> {
  const heroImage =
    document.querySelector<HTMLImageElement>("[data-hero-image]");
  const decoded =
    heroImage && !heroImage.complete
      ? heroImage.decode().catch(() => undefined)
      : Promise.resolve();

  return Promise.race([
    Promise.all([document.fonts.ready, decoded]),
    wait(MAX_WAIT_MS),
  ]);
}

/**
 * ローディング演出を再生し、ヒーローが見えるようになった時点で解決する。
 * 同一セッションの2回目以降はスキップして即座に解決する。
 */
export async function playLoader(): Promise<void> {
  const loader = document.querySelector<HTMLElement>("[data-loader]");
  if (!loader) return;

  // sessionStorage はプライベートモード等で例外を投げうるので握りつぶす
  let seen = false;
  try {
    seen = sessionStorage.getItem(SEEN_KEY) === "1";
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* 使えなければ毎回ローダーを再生する */
  }

  if (seen) {
    loader.remove();
    await document.fonts.ready.catch(() => undefined);
    return;
  }

  const mark = loader.querySelector("[data-loader-mark]");
  const wordmark = loader.querySelector("[data-loader-wordmark]");
  const barFill = loader.querySelector("[data-loader-bar-fill]");

  document.body.style.overflow = "hidden";

  const intro = gsap.timeline();
  intro
    .to(mark, { opacity: 1, scale: 1, duration: DUR.base, ease: EASE.out }, 0)
    .to(
      wordmark,
      { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out },
      0.25,
    );

  // 進捗バーはまず 75% までゆっくり進み、実際に準備が整った時点で一気に埋める。
  gsap.to(barFill, { scaleX: 0.75, duration: 1.4, ease: "power1.out" });

  await Promise.all([assetsReady(), wait(MIN_VISIBLE_MS)]);

  await gsap
    .timeline()
    .to(barFill, { scaleX: 1, duration: 0.35, ease: EASE.inOut })
    .to(
      [mark, wordmark, barFill?.parentElement ?? null].filter(Boolean),
      { opacity: 0, y: -12, duration: 0.45, ease: EASE.out, stagger: 0.04 },
      "+=0.1",
    )
    .to(
      loader,
      { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: EASE.inOut },
      "-=0.2",
    )
    .then();

  loader.remove();
  document.body.style.overflow = "";
}
