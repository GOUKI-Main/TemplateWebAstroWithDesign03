import { gsap, ScrollTrigger, SplitText, EASE, DUR } from "./motion";

/**
 * スクロールリビールの語彙。マークアップ側は data 属性でこれらを指定する。
 *
 *   data-reveal="" | "left" | "right" | "scale"  … フェード＋移動（既定の演出）
 *   data-reveal-mask                  … clip-path のマスク開き
 *   data-reveal-scale                 … ↑ の内側で拡大させるラッパー（任意）
 *   data-reveal-group                 … 子の [data-reveal-item] を順に出す器
 *   data-reveal-from="left"|"right"   … group 内アイテムの出現方向
 *   data-reveal-item                  … group の中で順に出る要素
 *   data-reveal-line / ="y"           … 罫線を scaleX（"y" なら scaleY）0 → 1 で引く
 *   data-reveal-lines                 … 見出しを行単位のマスクリビール
 *   data-parallax="<移動量 %>"         … スクロール連動の縦パララックス
 *
 * 初期状態（opacity: 0 など）は global.css 側に .has-motion 付きで書いてある。
 * JS が動かなければ初期状態が適用されず、コンテンツはそのまま見える。
 */

const START = "top 85%";

/** 画面内に同時に入った要素はまとめて波のようにずらして出す */
function setupCommonReveals() {
  ScrollTrigger.batch("[data-reveal]", {
    start: START,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: DUR.base,
        ease: EASE.out,
        stagger: 0.09,
        overwrite: "auto",
      }),
  });
}

/** 画像のマスク開き。内側の img はわずかに引きで入る */
function setupMaskReveals() {
  ScrollTrigger.batch("[data-reveal-mask]", {
    start: START,
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        clipPath: "inset(0% 0 0 0)",
        duration: DUR.slow,
        ease: EASE.inOut,
        stagger: 0.12,
      });
      batch.forEach((el, index) => {
        // 拡大は img ではなく専用のラッパーに掛ける。
        // img 側には .img-hover-zoom の CSS transition が乗っており、
        // 直接触ると GSAP の毎フレーム更新と競合して動きが濁るため。
        const inner = el.querySelector("[data-reveal-scale]");
        if (!inner) return;
        gsap.from(inner, {
          scale: 1.06,
          duration: 1.4,
          ease: EASE.out,
          delay: index * 0.12,
        });
      });
    },
  });
}

/** 器の中のアイテムを順に出す。罫線は少し遅らせて引く */
function setupGroupReveals() {
  const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");

  groups.forEach((group) => {
    const items = group.querySelectorAll("[data-reveal-item]");
    const lines = group.querySelectorAll("[data-reveal-line]");
    if (!items.length && !lines.length) return;

    const from = group.dataset.revealFrom;
    const offset = from === "left" ? -24 : from === "right" ? 24 : 0;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: group, start: START, once: true },
      defaults: { ease: EASE.out },
    });

    if (items.length) {
      tl.fromTo(
        items,
        { opacity: 0, x: offset, y: offset ? 0 : 20 },
        { opacity: 1, x: 0, y: 0, duration: 0.8, stagger: 0.06 },
        0,
      );
    }

    if (lines.length) {
      tl.to(lines, { scaleX: 1, duration: 0.7, stagger: 0.06 }, 0.1);
    }
  });
}

/** group に属さない単独の罫線（セクション見出し下のディバイダーなど） */
function setupStandaloneLines() {
  const lines = gsap.utils.toArray<HTMLElement>(
    "[data-reveal-line]:not([data-reveal-group] [data-reveal-line])",
  );

  lines.forEach((line) => {
    // data-reveal-line="y" は縦に伸びる罫線（.divider）
    const axis = line.dataset.revealLine === "y" ? "scaleY" : "scaleX";
    gsap.to(line, {
      [axis]: 1,
      duration: 0.8,
      ease: EASE.out,
      scrollTrigger: { trigger: line, start: "top 92%", once: true },
    });
  });
}

/** 見出しを行単位で下から立ち上げる。フォント切り替えやリサイズには autoSplit が追従する */
function setupLineReveals() {
  const headings = gsap.utils.toArray<HTMLElement>("[data-reveal-lines]");

  headings.forEach((heading) => {
    SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit(self) {
        gsap.set(heading, { opacity: 1 });
        return gsap.from(self.lines, {
          yPercent: 110,
          opacity: 0,
          duration: DUR.slow,
          ease: EASE.out,
          stagger: 0.12,
          scrollTrigger: { trigger: heading, start: START, once: true },
        });
      },
    });
  });
}

/** 背景画像などの縦パララックス */
function setupParallax() {
  const targets = gsap.utils.toArray<HTMLElement>("[data-parallax]");

  targets.forEach((target) => {
    const amount = Number(target.dataset.parallax) || 6;
    gsap.fromTo(
      target,
      { yPercent: amount },
      {
        yPercent: -amount,
        ease: "none",
        scrollTrigger: {
          trigger: target.parentElement ?? target,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

export function setupReveals(): void {
  setupCommonReveals();
  setupMaskReveals();
  setupGroupReveals();
  setupStandaloneLines();
  setupLineReveals();
  setupParallax();

  // ローダーぶんレイアウトが確定するのを待ってから位置を測り直す
  ScrollTrigger.refresh();
}
