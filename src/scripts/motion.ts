import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText };

/**
 * GSAP の ease と global.css の --ease-* は同じカーブを指す。
 * 片方だけ変えると CSS ホバーと GSAP の動きの質感がずれるので、必ず両方直すこと。
 */
export const EASE = {
  /** ≒ cubic-bezier(0.215, 0.61, 0.355, 1) — global.css の --ease-out */
  out: "power3.out",
  /** ≒ cubic-bezier(0.645, 0.045, 0.355, 1) — global.css の --ease-in-out */
  inOut: "power3.inOut",
} as const;

export const DUR = {
  fast: 0.5,
  base: 0.9,
  slow: 1.2,
} as const;

/**
 * モーションを再生してよいか。
 * <head> のインラインスクリプトが reduced-motion でないときだけ has-motion を付ける。
 * JS が落ちた場合もこのクラスが付かないため、コンテンツは初期状態で全て見える。
 */
export const motionEnabled = () =>
  document.documentElement.classList.contains("has-motion");

/** 固定ヘッダーに見出しが隠れないよう、アンカーの着地位置をずらす量 */
export const headerOffset = () => (window.innerWidth <= 768 ? 60 : 76);
