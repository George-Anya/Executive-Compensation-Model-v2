import { useMemo, useState } from "react";
import { COLOR } from "../styles/tokens";
import { computeAtYear, totalAt } from "../utils/finance";
import { buildTornadoRows } from "../components/Charts/TornadoChart";

const DEFAULT_INPUTS = {
  baseSalary: 320000,
  rsuGrantValue: 1500000,
  numOptions: 40000,
  strikePrice: 12,
  currentFDV: 480000000,
  fdsAtGrant: 40000000,
  vestYears: 4,
  cliffYears: 1,
  dilutionRatePct: 6,
  timeToExit: 4,
};

const DEFAULT_SCENARIOS = {
  downside: 300000000,
  base: 900000000,
  upside: 2000000000,
};

export const SCENARIO_COLOR = { downside: COLOR.down, base: COLOR.base, upside: COLOR.up };
export const SCENARIO_LABEL = { downside: "Downside", base: "Base case", upside: "Upside" };

/**
 * All state and derived (memoized) calculations for the compensation
 * model, kept out of App.jsx so the component tree stays presentational.
 */
export function useCompModel() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [active, setActive] = useState("base");

  const timeline = useMemo(() => {
    const years = [];
    const n = Math.max(1, Math.round(inputs.timeToExit));
    for (let y = 0; y <= n; y++) {
      const r = computeAtYear(inputs, scenarios[active], y);
      years.push({
        year: `Yr ${y}`,
        Cash: Math.round(r.cash),
        RSUs: Math.round(r.rsuValue),
        Options: Math.round(r.optionsValue),
      });
    }
    return years;
  }, [inputs, scenarios, active]);

  const comparison = useMemo(() => {
    return ["downside", "base", "upside"].map((key) => {
      const r = computeAtYear(inputs, scenarios[key], inputs.timeToExit);
      return {
        key,
        name: SCENARIO_LABEL[key],
        Cash: Math.round(r.cash),
        RSUs: Math.round(r.rsuValue),
        Options: Math.round(r.optionsValue),
        total: Math.round(r.total),
      };
    });
  }, [inputs, scenarios]);

  const tornado = useMemo(() => buildTornadoRows(inputs, scenarios, totalAt), [inputs, scenarios]);

  const activeBreakdown = comparison.find((c) => c.key === active);

  return {
    inputs, setInputs,
    scenarios, setScenarios,
    active, setActive,
    timeline, comparison, tornado, activeBreakdown,
  };
}
