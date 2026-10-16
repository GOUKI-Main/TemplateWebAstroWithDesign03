import { gsap, EASE, motionEnabled } from "./motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function setupMenu(): void {
  const menu = document.querySelector<HTMLElement>("[data-menu]");
  const toggle = document.querySelector<HTMLElement>("[data-menu-toggle]");
  const close = document.querySelector<HTMLElement>("[data-menu-close]");
  if (!menu || !toggle) return;

  const overlay = menu.querySelector("[data-menu-overlay]");
  const categories = menu.querySelectorAll("[data-menu-category]");
  const lines = menu.querySelectorAll("[data-menu-line]");
  const links = menu.querySelectorAll("[data-menu-link]");
  // メニューを開いている間は背景を操作対象から外す
  const background = document.querySelectorAll<HTMLElement>(
    "[data-menu-background]",
  );

  let isOpen = false;
  let lastFocused: HTMLElement | null = null;

  // メニュー自体の可視化はタイムラインに含めない。
  // 開いた瞬間に同期でフォーカスを移す必要があり、
  // タイムラインの1フレーム目を待つと visibility: hidden のままで focus() が効かないため。
  const timeline = gsap
    .timeline({
      paused: true,
      defaults: { ease: EASE.out },
      onReverseComplete: () => gsap.set(menu, { autoAlpha: 0 }),
    })
    .fromTo(
      overlay,
      { opacity: 0, backdropFilter: "blur(0px)" },
      { opacity: 1, backdropFilter: "blur(20px)", duration: 0.5 },
      0,
    )
    .fromTo(
      categories,
      { yPercent: 60, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08 },
      0.12,
    )
    .fromTo(
      lines,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, stagger: 0.08 },
      0.28,
    )
    .fromTo(
      links,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 },
      0.3,
    );

  function setOpenState(open: boolean) {
    isOpen = open;
    menu!.setAttribute("aria-hidden", open ? "false" : "true");
    toggle!.setAttribute("aria-expanded", open ? "true" : "false");
    toggle!.setAttribute(
      "aria-label",
      open ? "メニューを閉じる" : "メニューを開く",
    );
    document.body.style.overflow = open ? "hidden" : "";
    document.body.dataset.menuOpen = open ? "true" : "false";
    background.forEach((el) => el.toggleAttribute("inert", open));
  }

  function openMenu() {
    if (isOpen) return;
    lastFocused = document.activeElement as HTMLElement | null;
    setOpenState(true);
    gsap.set(menu!, { autoAlpha: 1 });

    if (motionEnabled()) {
      timeline.timeScale(1).play();
    } else {
      timeline.progress(1).pause();
    }

    (close ?? (links[0] as HTMLElement | undefined))?.focus();
  }

  function closeMenu() {
    if (!isOpen) return;
    setOpenState(false);

    if (motionEnabled()) {
      // 閉じるときは同じタイムラインを速めに巻き戻す。
      // 巻き戻し完了時に onReverseComplete が visibility を落とす。
      timeline.timeScale(1.6).reverse();
    } else {
      timeline.progress(0).pause();
      gsap.set(menu!, { autoAlpha: 0 });
    }

    lastFocused?.focus();
    lastFocused = null;
  }

  toggle.addEventListener("click", openMenu);
  close?.addEventListener("click", closeMenu);
  links.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (!isOpen) return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    // フォーカスをメニュー内に閉じ込める
    const focusable = Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
