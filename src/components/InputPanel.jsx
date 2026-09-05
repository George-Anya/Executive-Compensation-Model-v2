import React from "react";
import PropTypes from "prop-types";
import { COLOR, SERIF } from "../styles/tokens";

// Fields that must never go negative (or zero, for divisors).
const NON_NEGATIVE_FIELDS = new Set([
  "baseSalary", "rsuGrantValue", "numOptions", "strikePrice",
  "currentFDV", "fdsAtGrant", "dilutionRatePct", "vestYears",
  "cliffYears", "timeToExit",
]);
const POSITIVE_ONLY_FIELDS = new Set(["fdsAtGrant"]); // must be > 0, not just >= 0

export default function InputPanel({ inputs, onChange, scenarios, onScenarioChange }) {
  const set = (k) => (e) => {
    let v = parseFloat(e.target.value);
    if (Number.isNaN(v)) v = 0;
    if (NON_NEGATIVE_FIELDS.has(k) && v < 0) v = 0;
    if (POSITIVE_ONLY_FIELDS.has(k) && v <= 0) v = 1;
    onChange({ ...inputs, [k]: v });
  };
  const setScenario = (k) => (e) => {
    let v = parseFloat(e.target.value);
    if (Number.isNaN(v)) v = 0;
    if (v < 0) v = 0;
    onScenarioChange({ ...scenarios, [k]: v });
  };

  return (
    <div style={styles.panel}>
      <style>{`
        .ecm-input { width: 100%; box-sizing: border-box; padding: 7px 9px; border: 1px solid ${COLOR.panelEdge};
          border-radius: 3px; background: #fff; font-family: inherit; font-size: 13px; color: ${COLOR.ink};
          font-variant-numeric: tabular-nums; }
        .ecm-input:focus { outline: none; border-color: ${COLOR.brass}; }
        .ecm-field label { display:block; font-family: inherit; font-size: 11px; color: ${COLOR.inkSoft};
          margin-bottom: 4px; }
        .ecm-field { margin-bottom: 12px; }
      `}</style>

      <div style={styles.panelTitle}>Package assumptions</div>

      <Field label="Base salary ($/yr)" value={inputs.baseSalary} step="1000" onChange={set("baseSalary")} min={0} />
      <Field label="RSU grant value at issuance ($)" value={inputs.rsuGrantValue} step="10000" onChange={set("rsuGrantValue")} min={0} />
      <Field label="Stock options granted (#)" value={inputs.numOptions} step="1000" onChange={set("numOptions")} min={0} />
      <Field label="Option strike price ($/share)" value={inputs.strikePrice} step="0.5" onChange={set("strikePrice")} min={0} />

      <div style={styles.divider} />
      <Field label="Current company valuation ($)" value={inputs.currentFDV} step="1000000" onChange={set("currentFDV")} min={0} />
      <Field label="Fully diluted shares at grant (#)" value={inputs.fdsAtGrant} step="100000" onChange={set("fdsAtGrant")} min={1} />
      <Field label="Est. annual dilution (%)" value={inputs.dilutionRatePct} step="0.5" onChange={set("dilutionRatePct")} min={0} />

      <div style={styles.divider} />
      <Field label="Vesting period (years)" value={inputs.vestYears} step="0.5" onChange={set("vestYears")} min={0} />
      <Field label="Cliff (years)" value={inputs.cliffYears} step="0.5" onChange={set("cliffYears")} min={0} />
      <Field label="Time to exit event (years)" value={inputs.timeToExit} step="0.5" onChange={set("timeToExit")} min={0} />

      <div style={styles.divider} />
      <div style={styles.panelTitle}>Exit scenarios ($ valuation)</div>
      <Field label="Downside" value={scenarios.downside} step="1000000" onChange={setScenario("downside")} min={0} />
      <Field label="Base case" value={scenarios.base} step="1000000" onChange={setScenario("base")} min={0} />
      <Field label="Upside" value={scenarios.upside} step="1000000" onChange={setScenario("upside")} min={0} />
    </div>
  );
}

function Field({ label, value, step, onChange, min }) {
  return (
    <div className="ecm-field">
      <label>{label}</label>
      <input className="ecm-input" type="number" step={step} min={min} value={value} onChange={onChange} />
    </div>
  );
}

InputPanel.propTypes = {
  inputs: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  scenarios: PropTypes.shape({
    downside: PropTypes.number,
    base: PropTypes.number,
    upside: PropTypes.number,
  }).isRequired,
  onScenarioChange: PropTypes.func.isRequired,
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  step: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
};

const styles = {
  panel: {
    background: COLOR.panel,
    border: `1px solid ${COLOR.panelEdge}`,
    borderRadius: 4,
    padding: "18px 20px",
    marginBottom: 20,
  },
  panelTitle: { fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: COLOR.ink, marginBottom: 14 },
  divider: { height: 1, background: COLOR.line, margin: "16px 0" },
};
