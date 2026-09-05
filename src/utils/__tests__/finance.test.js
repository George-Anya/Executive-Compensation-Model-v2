import { describe, it, expect } from "vitest";
import {
  vestedFraction,
  computeAtYear,
  totalAt,
  samplePowerLawMultiple,
  sampleTimeToExit,
  runMonteCarloSimulation,
} from "../finance";

describe("vestedFraction", () => {
  it("is 0 before the cliff", () => {
    expect(vestedFraction(0.5, 1, 4)).toBe(0);
  });
  it("is exactly the cliff year fraction once past the cliff", () => {
    expect(vestedFraction(1, 1, 4)).toBe(0.25);
  });
  it("is 1 once fully vested", () => {
    expect(vestedFraction(4, 1, 4)).toBe(1);
    expect(vestedFraction(10, 1, 4)).toBe(1);
  });
  it("treats a zero vest period as fully vested immediately (edge case)", () => {
    expect(vestedFraction(0, 0, 0)).toBe(1);
  });
});

describe("computeAtYear", () => {
  const baseInputs = {
    baseSalary: 100000,
    rsuGrantValue: 400000,
    numOptions: 10000,
    strikePrice: 5,
    currentFDV: 100000000,
    fdsAtGrant: 10000000, // $10/share at grant
    vestYears: 4,
    cliffYears: 1,
    dilutionRatePct: 0,
    timeToExit: 4,
  };

  it("returns only accrued cash before the cliff", () => {
    const r = computeAtYear(baseInputs, 200000000, 0.5);
    expect(r.rsuValue).toBe(0);
    expect(r.optionsValue).toBe(0);
    expect(r.cash).toBeCloseTo(50000, 5);
  });

  it("values RSUs and options correctly once fully vested at a flat exit valuation", () => {
    // No dilution, no valuation growth: exit at the same $100M valuation.
    const r = computeAtYear(baseInputs, 100000000, 4);
    // price/share stays $10 -> RSU shares = 400000/10 = 40000 shares * $10 = $400,000
    expect(r.rsuValue).toBeCloseTo(400000, 2);
    // options intrinsic = (10 - 5) * 10000 = 50000
    expect(r.optionsValue).toBeCloseTo(50000, 2);
    expect(r.cash).toBeCloseTo(400000, 5);
    expect(r.total).toBeCloseTo(850000, 2);
  });

  it("returns zero options value (not negative) when underwater", () => {
    // Exit valuation crashes far enough that price/share < strike price.
    const r = computeAtYear(baseInputs, 1000000, 4); // price/share -> $0.10
    expect(r.optionsValue).toBe(0);
  });

  it("guards against division by zero when fdsAtGrant is 0", () => {
    const badInputs = { ...baseInputs, fdsAtGrant: 0 };
    const r = computeAtYear(badInputs, 100000000, 2);
    expect(Number.isNaN(r.total)).toBe(false);
    expect(r.rsuValue).toBe(0);
    expect(r.optionsValue).toBe(0);
    expect(r.cash).toBeCloseTo(200000, 5); // cash still accrues normally
  });

  it("does not produce negative totals for sane inputs", () => {
    const r = computeAtYear(baseInputs, 50000000, 4);
    expect(r.total).toBeGreaterThanOrEqual(0);
  });
});

describe("totalAt", () => {
  it("matches computeAtYear's total field", () => {
    const inputs = {
      baseSalary: 50000, rsuGrantValue: 100000, numOptions: 1000, strikePrice: 2,
      currentFDV: 10000000, fdsAtGrant: 1000000, vestYears: 2, cliffYears: 0, dilutionRatePct: 0, timeToExit: 2,
    };
    expect(totalAt(inputs, 20000000, 2)).toBeCloseTo(computeAtYear(inputs, 20000000, 2).total, 6);
  });
});

describe("samplePowerLawMultiple", () => {
  it("never returns a value below 0", () => {
    for (let i = 0; i < 1000; i++) {
      expect(samplePowerLawMultiple()).toBeGreaterThanOrEqual(0);
    }
  });
  it("respects the configured maximum multiple cap", () => {
    for (let i = 0; i < 1000; i++) {
      expect(samplePowerLawMultiple(2.05, 0.35, 5)).toBeLessThanOrEqual(5);
    }
  });
  it("reproduces the empirically-cited ~65-68% below-1x fraction over a large sample", () => {
    const N = 50000;
    let below1 = 0;
    for (let i = 0; i < N; i++) {
      if (samplePowerLawMultiple() < 1) below1++;
    }
    const frac = below1 / N;
    // Wide tolerance band since this is a stochastic test, not a fixed-seed one.
    expect(frac).toBeGreaterThan(0.55);
    expect(frac).toBeLessThan(0.78);
  });
});

describe("sampleTimeToExit", () => {
  it("stays within the clamped 1-15 year range regardless of outcome size", () => {
    for (const val of [1, 50_000_000, 500_000_000, 5_000_000_000]) {
      const t = sampleTimeToExit(val);
      expect(t).toBeGreaterThanOrEqual(1);
      expect(t).toBeLessThanOrEqual(15);
    }
  });
});

describe("runMonteCarloSimulation", () => {
  const inputs = {
    baseSalary: 300000, rsuGrantValue: 1000000, numOptions: 20000, strikePrice: 10,
    currentFDV: 200000000, fdsAtGrant: 20000000, vestYears: 4, cliffYears: 1,
  };

  it("produces ordered percentiles (p10 <= p50 <= p90)", () => {
    const r = runMonteCarloSimulation(inputs, { simulations: 2000 });
    expect(r.p10).toBeLessThanOrEqual(r.p50);
    expect(r.p50).toBeLessThanOrEqual(r.p90);
  });

  it("never produces a negative total across the simulated distribution", () => {
    const r = runMonteCarloSimulation(inputs, { simulations: 2000 });
    expect(r.totals.every((t) => t >= 0)).toBe(true);
  });

  it("returns the requested number of trials", () => {
    const r = runMonteCarloSimulation(inputs, { simulations: 1234 });
    expect(r.totals.length).toBe(1234);
  });
});
