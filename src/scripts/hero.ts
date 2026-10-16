import { gsap, ScrollTrigger, SplitText, EASE, DUR } from "./motion";

/**
 * ヒーロー画像の待機スケール。
 * 見本の画像が 640px 四方しかないため拡大は最小限に留め、
 * この余白ぶんだけをパララックスの移動量に使う。
 */
const IMAGE_REST_SCALE = 1.08;

export function playHeroIntro(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;

  const tagline = hero.querySelector("[data-hero-tagline]");
  const title = hero.querySelector<HTMLElement>("[data-hero-title]");
  const subtitle = hero.querySelector("[data-hero-subtitle]");
  const visual = hero.querySelector("[data-hero-visual]");
  const image = hero.querySelector("[data-hero-image]");
  const actions = hero.querySelectorAll("[data-hero-action]");
  const scrollHint = hero.querySelector("[data-hero-scroll]");

  // 文字分割はフォント確定後（ローダーが document.fonts.ready を待っている）に行う。
  // マスクは使わない —— È のアクセントや広い字間が切れるリスクを避けるため。
  const split = title ? SplitText.create(title, { type: "chars" }) : null;
  if (title) gsap.set(title, { opacity: 1 });

  // 待機スケールを先に確定させておく。以降の from / パララックスはここを基準にする。
  gsap.set(image, { scale: IMAGE_REST_SCALE });

  const tl = gsap.timeline({ defaults: { ease: EASE.out } });

  tl.to(tagline, { opacity: 1, y: 0, duration: 0.7 }, 0);

  if (split) {
    tl.from(
      split.chars,
      { yPercent: 45, opacity: 0, duration: DUR.base, stagger: 0.05 },
      0.1,
    );
  }

  // 字間の着地点は Hero.astro の --subtitle-tracking（画面幅で変わる）に従う
  const tracking =
    (subtitle &&
      getComputedStyle(subtitle)
        .getPropertyValue("--subtitle-tracking")
        .trim()) ||
    "0.5em";

  tl.to(
    subtitle,
    { opacity: 1, letterSpacing: tracking, duration: DUR.slow },
    0.5,
  )
    .to(
      visual,
      { clipPath: "inset(0% 0 0 0)", duration: DUR.slow, ease: EASE.inOut },
      0.35,
    )
    .from(image, { scale: IMAGE_REST_SCALE + 0.12, duration: 1.6 }, 0.35)
    .to(actions, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.95)
    .to(scrollHint, { opacity: 1, duration: 0.6 }, 1.25);

  // スクロールに合わせた控えめなパララックス。
  // scale ぶんの余白（±4%）に収めているので、下端に隙間が出ることはない。
  gsap.fromTo(
    image,
    { yPercent: 4 },
    {
      yPercent: -4,
      ease: "none",
      scrollTrigger: {
        trigger: visual,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );

  ScrollTrigger.refresh();
}

export { IMAGE_REST_SCALE };
