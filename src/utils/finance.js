/**
 * Pure financial logic for the executive compensation structuring model.
 * No React, no rendering — safe to unit test in isolation.
 */

/* ---------------------------------------------------------------------
 * Vesting
 * ------------------------------------------------------------------- */
export function vestedFraction(years, cliff, vestPeriod) {
  const safeCliff = Math.max(0, cliff || 0);
  const safeVest = Math.max(0, vestPeriod || 0);
  if (safeVest <= 0) return 1;
  if (years < safeCliff) return 0;
  if (years >= safeVest) return 1;
  return years / safeVest;
}

/* ---------------------------------------------------------------------
 * Core package valuation at a single point in time, for a single
 * (manually chosen) exit valuation. This is the deterministic engine
 * behind the scenario tabs and the tornado sensitivity analysis.
 * ------------------------------------------------------------------- */
export function computeAtYear(inputs, exitValuation, year) {
  const {
    baseSalary = 0,
    rsuGrantValue = 0,
    numOptions = 0,
    strikePrice = 0,
    currentFDV = 0,
    fdsAtGrant = 0,
    vestYears = 0,
    cliffYears = 0,
    dilutionRatePct = 0,
    timeToExit = 0,
  } = inputs;

  // Guards: a zero or negative share count / valuation makes per-share
  // price undefined. Treat as zero rather than throwing or returning NaN,
  // so the UI degrades gracefully instead of crashing on an in-progress edit.
  const safeFdsAtGrant = fdsAtGrant > 0 ? fdsAtGrant : 0;
  const safeCurrentFDV = currentFDV >= 0 ? currentFDV : 0;
  const safeYear = Math.max(0, year || 0);
  const safeTimeToExit = Math.max(0, timeToExit || 0);

  if (safeFdsAtGrant === 0) {
    return { cash: baseSalary * safeYear, rsuValue: 0, optionsValue: 0, total: baseSalary * safeYear, priceAtYear: 0 };
  }

  const priceAtGrant = safeCurrentFDV / safeFdsAtGrant;
  const rsuShares = priceAtGrant > 0 ? rsuGrantValue / priceAtGrant : 0;

  const valuationAtYear =
    safeCurrentFDV + (exitValuation - safeCurrentFDV) * (safeTimeToExit > 0 ? safeYear / safeTimeToExit : 1);
  const fdsAtYear = safeFdsAtGrant * Math.pow(1 + (dilutionRatePct || 0) / 100, safeYear);
  const priceAtYear = fdsAtYear > 0 ? valuationAtYear / fdsAtYear : 0;

  const vf = vestedFraction(safeYear, cliffYears, vestYears);
  const rsuValue = rsuShares * vf * priceAtYear;
  const optIntrinsic = Math.max(priceAtYear - (strikePrice || 0), 0);
  const optionsValue = (numOptions || 0) * vf * optIntrinsic;
  const cash = (baseSalary || 0) * safeYear;

  return { cash, rsuValue, optionsValue, total: cash + rsuValue + optionsValue, priceAtYear };
}

export function totalAt(inputs, exitValuation, year) {
  return computeAtYear(inputs, exitValuation, year).total;
}

/* ---------------------------------------------------------------------
 * Monte Carlo engine
 *
 * Calibrated against published empirical data rather than invented
 * numbers:
 *
 * - Return-multiple distribution: a squashed power law with alpha=2.05,
 *   xmin=0.35, fit by Moonfire Ventures (arXiv:2303.11013) to Correlation
 *   Ventures' dataset of 21,000+ venture financings (2004-2013) plus
 *   corroborating AngelList and Horsley Bridge data. We repurpose "return
 *   multiple on invested capital" as a proxy for "company valuation
 *   multiple from grant date to exit" — a modeling choice, not a perfect
 *   match, and disclosed as such in the UI.
 * - Time-to-exit: bucketed on Y Combinator's 2025 exit-cohort analysis
 *   (sub-$100M exits ~3yr median, $100M-$999M ~6yr, $1B+ ~10yr), with
 *   log-normal jitter around each bucket's median.
 * - Dilution: modeled as discrete funding rounds roughly every 2.25
 *   years (average of Carta's Q3 2025 reported Seed->A and A->B
 *   gaps), each diluting existing holders ~13% (Carta's reported
 *   Series C/D dilution rate).
 * ------------------------------------------------------------------- */

export const MC_DEFAULTS = {
  alpha: 2.05,
  xmin: 0.35,
  maxMultiple: 500,
  roundSpacingYears: 2.25,
  dilutionPerRound: 0.13,
  simulations: 10000,
};

// Box-Muller transform for a standard normal sample.
function sampleStandardNormal() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Sample a return/valuation multiple from the squashed power law.
export function samplePowerLawMultiple(alpha = MC_DEFAULTS.alpha, xmin = MC_DEFAULTS.xmin, maxMultiple = MC_DEFAULTS.maxMultiple) {
  const u = Math.random();
  // Inverse CDF of a standard Pareto(xmin, alpha).
  const x = xmin * Math.pow(1 - u, -1 / (alpha - 1));
  // Squash the [xmin, 1) segment down to [0, 1) so the minimum return is 0,
  // per Moonfire Ventures' transform (section 2.2 of arXiv:2303.11013).
  const squashed = x < 1 ? (x - xmin) / (1 - xmin) : x;
  return Math.min(Math.max(squashed, 0), maxMultiple);
}

// Sample a time-to-exit (years), correlated with outcome size per YC data.
export function sampleTimeToExit(exitValuation) {
  let meanYears;
  if (exitValuation < 100_000_000) meanYears = 3;
  else if (exitValuation < 1_000_000_000) meanYears = 6;
  else meanYears = 10;
  const jitter = Math.exp(sampleStandardNormal() * 0.3);
  return Math.min(Math.max(meanYears * jitter, 1), 15);
}

// Run the full Monte Carlo simulation and return summary statistics
// plus the raw totals array (for histogram rendering).
export function runMonteCarloSimulation(inputs, mcParams = {}) {
  const params = { ...MC_DEFAULTS, ...mcParams };
  const {
    baseSalary = 0, rsuGrantValue = 0, numOptions = 0, strikePrice = 0,
    currentFDV = 0, fdsAtGrant = 0, vestYears = 0, cliffYears = 0,
  } = inputs;

  const safeFdsAtGrant = fdsAtGrant > 0 ? fdsAtGrant : 1; // guard: avoid div-by-zero
  const priceAtGrant = safeFdsAtGrant > 0 ? currentFDV / safeFdsAtGrant : 0;
  const rsuShares = priceAtGrant > 0 ? rsuGrantValue / priceAtGrant : 0;

  const totals = new Array(params.simulations);

  for (let i = 0; i < params.simulations; i++) {
    const multiple = samplePowerLawMultiple(params.alpha, params.xmin, params.maxMultiple);
    const exitValuation = currentFDV * multiple;
    const T = sampleTimeToExit(exitValuation);

    const numRounds = Math.max(0, Math.floor(T / params.roundSpacingYears));
    const fdsAtExit = safeFdsAtGrant / Math.pow(1 - params.dilutionPerRound, numRounds);
    const priceAtExit = fdsAtExit > 0 ? exitValuation / fdsAtExit : 0;

    const vf = vestedFraction(T, cliffYears, vestYears);
    const rsuValue = rsuShares * vf * priceAtExit;
    const optionsValue = numOptions * vf * Math.max(priceAtExit - strikePrice, 0);
    const cash = baseSalary * T;

    totals[i] = cash + rsuValue + optionsValue;
  }

  totals.sort((a, b) => a - b);
  const pct = (p) => totals[Math.min(totals.length - 1, Math.floor((p / 100) * totals.length))];

  return {
    totals,
    p10: pct(10),
    p25: pct(25),
    p50: pct(50),
    p75: pct(75),
    p90: pct(90),
    mean: totals.reduce((a, b) => a + b, 0) / totals.length,
  };
}
