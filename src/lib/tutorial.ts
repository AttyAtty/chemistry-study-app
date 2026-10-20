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
  { title: "Chemicaへようこそ", description: "単元、図解、公式、問題演習など、目的に合わせて高校化学を学べます。" },
  { title: "今日の学習を始める", description: "最初に何をするか決めたいときは、全体検索・化学基礎・演習・分野選びの入口を使えます。学習の続き・復習や、ログイン・データ保存もここから選べます。", target: '[data-tutorial="quick-start"]' },
  { title: "今日の3問で復習する", description: "毎日少しだけ復習したいときは、今日の3問から始められます。イオン・反応式・沈殿を短時間で確認できます。", target: '[data-tutorial="daily-questions"]' },
  { title: "4分野から体系的に学ぶ", description: "体系的に学びたいときは、化学基礎・理論・有機・無機から分野を選べます。各分野のカードから、単元の学習や短い演習へ進めます。", target: '[data-tutorial="main-fields"]' },
  { title: "目的に合う教材を探す", description: "テーマ別に確認したいときは、電池・色・工業的製法・錯イオン・気体などをここから探せます。「図で理解する」では、反応の流れ・構造・グラフを確認できます。", target: '[data-tutorial="focused-tools"]' },
  { title: "ナビから学習先へ移動する", description: "学習先を切り替えたいときは、単元・問題演習・印刷小テスト・記録・その他へ移動できます。「その他」からは、使い方ガイドの再表示やデータ保存なども選べます。", target: '[data-tutorial="bottom-navigation"]' },
];
