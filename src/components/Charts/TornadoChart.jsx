import React from "react";
import PropTypes from "prop-types";
import { COLOR } from "../../styles/tokens";
import { fmtUSD } from "../../utils/format";

export default function TornadoChart({ rows, baseTotal, maxAbs }) {
  return (
    <div>
      <div style={styles.chartLabel}>
        Sensitivity — impact on base-case value from a ±20% move in each assumption
      </div>
      <div style={{ marginTop: 10 }}>
        {rows.map((r) => (
          <TornadoRow key={r.label} row={r} maxAbs={maxAbs} />
        ))}
      </div>
      <div style={styles.note}>
        Centered on base-case total of {fmtUSD(baseTotal)}. Bars show the range of outcomes when that one assumption
        moves ±20%, all else held constant.
      </div>
    </div>
  );
}

function TornadoRow({ row, maxAbs }) {
  const { label, lo, hi, baseTotal } = row;
  const scale = 100 / maxAbs / 2;
  const leftPct = Math.max(0, (baseTotal - lo) * scale);
  const rightPct = Math.max(0, (hi - baseTotal) * scale);
  return (
    <div style={styles.row}>
      <div style={styles.rowLabel}>{label}</div>
      <div style={styles.track}>
        <div style={styles.center} />
        <div style={{ ...styles.barLeft, width: `${leftPct}%` }} />
        <div style={{ ...styles.barRight, width: `${rightPct}%` }} />
      </div>
      <div style={styles.values}>
        {fmtUSD(lo)} – {fmtUSD(hi)}
      </div>
    </div>
  );
}

TornadoChart.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      lo: PropTypes.number,
      hi: PropTypes.number,
      baseTotal: PropTypes.number,
      swing: PropTypes.number,
    })
  ).isRequired,
  baseTotal: PropTypes.number.isRequired,
  maxAbs: PropTypes.number.isRequired,
};

TornadoRow.propTypes = {
  row: PropTypes.shape({
    label: PropTypes.string,
    lo: PropTypes.number,
    hi: PropTypes.number,
    baseTotal: PropTypes.number,
  }).isRequired,
  maxAbs: PropTypes.number.isRequired,
};

const styles = {
  chartLabel: { fontSize: 12.5, color: COLOR.inkSoft, marginBottom: 4 },
  row: { display: "grid", gridTemplateColumns: "130px 1fr 150px", alignItems: "center", gap: 12, marginBottom: 10 },
  rowLabel: { fontSize: 12.5, color: COLOR.ink },
  track: { position: "relative", height: 14 },
  center: { position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: COLOR.panelEdge },
  barLeft: { position: "absolute", right: "50%", top: 1, bottom: 1, background: COLOR.downSoft, borderRadius: "2px 0 0 2px" },
  barRight: { position: "absolute", left: "50%", top: 1, bottom: 1, background: COLOR.upSoft, borderRadius: "0 2px 2px 0" },
  values: { fontSize: 11.5, color: COLOR.inkSoft, fontVariantNumeric: "tabular-nums", textAlign: "right" },
  note: { fontSize: 11, color: COLOR.inkSoft, marginTop: 10, lineHeight: 1.5 },
};

/* Pure helper, exported for use by the parent (kept alongside the chart
 * since it exists purely to feed this visualization). */
export function buildTornadoRows(inputs, scenarios, totalAtFn) {
  const baseTotal = totalAtFn(inputs, scenarios.base, inputs.timeToExit);
  const factors = [
    { key: "Exit valuation", field: "scenario:base" },
    { key: "Dilution rate", field: "dilutionRatePct" },
    { key: "Time to exit", field: "timeToExit" },
    { key: "Strike price", field: "strikePrice" },
    { key: "RSU grant value", field: "rsuGrantValue" },
    { key: "Base salary", field: "baseSalary" },
  ];
  const rows = factors.map((f) => {
    let low, high;
    if (f.field === "scenario:base") {
      low = totalAtFn(inputs, scenarios.base * 0.8, inputs.timeToExit);
      high = totalAtFn(inputs, scenarios.base * 1.2, inputs.timeToExit);
    } else {
      const lowInputs = { ...inputs, [f.field]: inputs[f.field] * 0.8 };
      const highInputs = { ...inputs, [f.field]: inputs[f.field] * 1.2 };
      low = totalAtFn(lowInputs, scenarios.base, lowInputs.timeToExit);
      high = totalAtFn(highInputs, scenarios.base, highInputs.timeToExit);
    }
    const lo = Math.min(low, high);
    const hi = Math.max(low, high);
    return { label: f.key, lo, hi, swing: hi - lo, baseTotal };
  });
  rows.sort((a, b) => b.swing - a.swing);
  const maxAbs = Math.max(...rows.map((r) => Math.max(Math.abs(r.hi - baseTotal), Math.abs(r.lo - baseTotal))), 1);
  return { rows, baseTotal, maxAbs };
}
