/** Nanoville's original pixel art, assigned by stable persona ID and role.
 * The original set has fifteen designs; related roles intentionally share art.
 * Chorus-web continues to use the backend's independent portrait/sprite set.
 */
export const pixelArtwork: Record<string, string> = {
  alex: "engineer", avery: "product-manager", jordan: "data-scientist",
  riley: "security-analyst", morgan: "devops-engineer", casey: "engineer",
  quinn: "data-scientist", taylor: "business-analyst", cameron: "engineer",
  rowan: "engineer", parker: "designer", sage: "engineer",
  river: "devops-engineer", skyler: "devops-engineer", reese: "data-scientist",
  finley: "security-analyst", hayden: "engineer", emerson: "designer",
  ellis: "security-analyst", arden: "engineer", remy: "data-scientist",
  blake: "data-scientist", drew: "operations-manager", robin: "data-scientist",
  jamie: "data-scientist", sam: "engineer", charlie: "engineer",
  devon: "business-analyst", lee: "data-scientist", frankie: "data-scientist",
  sidney: "people-leader", sasha: "engineer", ash: "engineer",
  jules: "data-scientist", ren: "operations-manager", kit: "finance-controller",
  mika: "operations-manager", ari: "business-analyst", shiloh: "investor",
  marlowe: "product-manager", lane: "marketer", blair: "finance-controller",
  dallas: "operations-manager", peyton: "finance-controller", scout: "customer-success",
  winter: "sales-executive", phoenix: "founder", justice: "business-analyst",
  indigo: "business-analyst", oakley: "people-leader",
};
export function pixelSprite(id: string): string {
  return `/agents/${pixelArtwork[id] ?? "engineer"}.webp`;
}
