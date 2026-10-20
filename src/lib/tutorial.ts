export const TUTORIAL_VERSION = "0.7.0";
export const TUTORIAL_KEY = "chemica-tutorial";
export type TutorialStatus = "not_started" | "skipped" | "completed" | "dismissed";
export type TutorialState = { tutorialStatus: TutorialStatus; tutorialVersion: string };
export function parseTutorialState(raw: string | null): TutorialState {
  try {
    const value = JSON.parse(raw || "null");
    if (value && ["not_started", "skipped", "completed", "dismissed"].includes(value.tutorialStatus) && typeof value.tutorialVersion === "string") return { tutorialStatus: value.tutorialStatus, tutorialVersion: value.tutorialVersion };
  } catch {}
  return { tutorialStatus: "not_started", tutorialVersion: TUTORIAL_VERSION };
}
// Future major UI tours may opt into replaying completed guides. Dismissal always wins.
export function shouldAutoStart(state: TutorialState, replayCompleted = false) {
  return state.tutorialStatus === "not_started" || state.tutorialStatus === "skipped" || (replayCompleted && state.tutorialStatus === "completed" && state.tutorialVersion !== TUTORIAL_VERSION);
}
export type TourStep = { title: string; description: string; target?: string };
export const homeTour: TourStep[] = [
  { title: "Chemicaへようこそ", description: "高校化学を、単元・図解・公式・問題演習から学べます。まずは主な使い方をご紹介します。" },
  { title: "分野から学ぶ", description: "単元ごとに学びたいときは、化学基礎・理論・無機・有機の入口から分野を選べます。", target: ".home-field-shortcuts" },
  { title: "検索ですぐに探す", description: "知りたい物質・反応・単元が決まっているときは、検索からすぐに探せます。", target: ".home-dashboard-search" },
  { title: "図で理解する", description: "高分子・糖・系統分析・蒸気圧・滴定・エネルギー図など、反応の流れや構造を図で確認できます。", target: ".home-diagram-hub-card" },
  { title: "公式・例題で使い方を学ぶ", description: "理論化学では公式・計算・典型例題をまとめて確認できます。この入口から、公式の使い方まで学びましょう。", target: '.home-main-field-grid article:has(a[href="/units/theory-chemistry"])' },
  { title: "テスト・進捗を確認する", description: "問題演習の結果や学習状況は、記録ページから確認できます。復習する内容を選ぶときにも役立ちます。", target: '.main-nav a[href="/progress"], .mobile-bottom-nav a[href="/progress"]' },
  { title: "印刷・オフラインでも学ぶ", description: "問題や図解は印刷できます。PWAとして追加すれば、保存済みの対応教材はオフラインでも利用できます。", target: '.main-nav a[href="/tools/memory-quiz"], .mobile-bottom-nav a[href="/tools/memory-quiz"]' },
];
