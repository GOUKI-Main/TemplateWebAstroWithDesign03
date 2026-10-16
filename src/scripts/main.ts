import { motionEnabled } from "./motion";
import { setupHeader } from "./header";
import { setupMenu } from "./menu";
import { playLoader } from "./loader";
import { playHeroIntro } from "./hero";
import { setupReveals } from "./reveals";

// ヘッダーの状態・アンカー移動・メニュー開閉は「機能」なので、
// reduced-motion でも JS が動く限り常に有効にする。
setupHeader();
setupMenu();

// 以下は純粋な装飾。has-motion（＝reduced-motion でない）のときだけ再生する。
if (motionEnabled()) {
  void (async () => {
    // ローダーが document.fonts.ready を待つので、
    // SplitText を使う演出はローダー完了後に組み立てる。
    await playLoader();
    playHeroIntro();
    setupReveals();
  })();
}
