export const METRIKA_COUNTER_ID = 112330836;

export const metrikaGoals = {
  formSubmitSuccess: "form_submit_success",
  magnetLead: "leadmagnet_otkaz",
  magnetPageOpen: "magnet_page_open",
  magnetPracticeStart: "magnet_practice_start",
  magnetPracticeComplete: "magnet_practice_complete",
  articleToPractice: "article_to_practice",
} as const;

export type MetrikaGoal = (typeof metrikaGoals)[keyof typeof metrikaGoals];

export function reachGoal(
  target: MetrikaGoal | string,
  params?: Record<string, string | number | boolean>,
) {
  if (params) {
    window.ym?.(METRIKA_COUNTER_ID, "reachGoal", target, params);
    return;
  }
  window.ym?.(METRIKA_COUNTER_ID, "reachGoal", target);
}

export function hit(url: string, options?: { title?: string; referer?: string }) {
  window.ym?.(METRIKA_COUNTER_ID, "hit", url, options);
}
