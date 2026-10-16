import {
  gsap,
  ScrollTrigger,
  EASE,
  motionEnabled,
  headerOffset,
} from "./motion";

/** ヘッダーのすりガラス状態と、下端のスクロール進捗バー */
function setupHeaderState() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;

  ScrollTrigger.create({
    start: "top -80",
    end: 99999,
    toggleClass: { className: "is-scrolled", targets: header },
  });

  const progress = header.querySelector("[data-scroll-progress]");
  if (!progress || !motionEnabled()) return;

  gsap.to(progress, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
    },
  });
}

/**
 * ページ内アンカーを固定ヘッダーぶんずらして着地させる。
 * ナビのリンクは /404 からも辿れるよう "/#section" の形で書いてあるので、
 * 「いま居るページの中の #id」を指すリンクだけを拾う（"#id" の形も含む）。
 * CSS の scroll-behavior: smooth は ScrollTrigger と競合するため使わず、
 * 滑らかさはここで担保する（reduced-motion のときは即座に移動）。
 */
function setupAnchorScroll() {
  document.addEventListener("click", (event) => {
    const link = (
      event.target as HTMLElement | null
    )?.closest?.<HTMLAnchorElement>("a[href*='#']");
    if (!link || link.target) return;
    if (link.origin !== location.origin || link.pathname !== location.pathname)
      return;

    const hash = link.hash;
    if (!hash || hash === "#") return;

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    history.pushState(null, "", hash);

    // メニューから飛んだ場合は、閉じるアニメーションと重ならないよう少し待つ
    const menuWasOpen = document.body.dataset.menuOpen === "true";
    const delay = menuWasOpen ? 0.35 : 0;

    if (!motionEnabled()) {
      window.setTimeout(
        () =>
          window.scrollTo({
            top:
              target.getBoundingClientRect().top +
              window.scrollY -
              headerOffset(),
          }),
        delay * 1000,
      );
      return;
    }

    gsap.to(window, {
      duration: 1,
      delay,
      ease: EASE.inOut,
      scrollTo: { y: target, offsetY: headerOffset() },
    });
  });
}

export function setupHeader(): void {
  setupHeaderState();
  setupAnchorScroll();
}
