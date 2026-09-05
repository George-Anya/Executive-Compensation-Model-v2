import React from "react";
import PropTypes from "prop-types";
import { COLOR, SERIF } from "../styles/tokens";
import { fmtUSD } from "../utils/format";

export default function OverviewCard({ active, scenarioLabel, scenarioColor, breakdown }) {
  return (
    <div style={styles.row}>
      <div>
        <div style={styles.label}>
          Total package value at exit — {scenarioLabel[active].toLowerCase()}
        </div>
        <div style={{ ...styles.bigNumber, color: scenarioColor[active] }}>
          {fmtUSD(breakdown.total, { compact: false })}
        </div>
      </div>
      <div style={styles.breakdown}>
        <BreakRow color={COLOR.cash} label="Cash accrued" value={breakdown.Cash} />
        <BreakRow color={COLOR.rsu} label="RSUs (vested)" value={breakdown.RSUs} />
        <BreakRow color={COLOR.opt} label="Options (vested)" value={breakdown.Options} />
      </div>
    </div>
  );
}

function BreakRow({ color, label, value }) {
  return (
    <div style={styles.breakRow}>
      <span style={{ ...styles.swatch, background: color }} />
      <span style={styles.breakLabel}>{label}</span>
      <span style={styles.breakValue}>{fmtUSD(value)}</span>
    </div>
  );
}

OverviewCard.propTypes = {
  active: PropTypes.oneOf(["downside", "base", "upside"]).isRequired,
  scenarioLabel: PropTypes.objectOf(PropTypes.string).isRequired,
  scenarioColor: PropTypes.objectOf(PropTypes.string).isRequired,
  breakdown: PropTypes.shape({
    total: PropTypes.number,
    Cash: PropTypes.number,
    RSUs: PropTypes.number,
    Options: PropTypes.number,
  }).isRequired,
};

BreakRow.propTypes = {
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
};

const styles = {
  row: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    flexWrap: "wrap", gap: 20, marginBottom: 18,
  },
  label: { fontSize: 12, color: COLOR.inkSoft, marginBottom: 4 },
  bigNumber: { fontFamily: SERIF, fontSize: 40, fontWeight: 600, lineHeight: 1 },
  breakdown: { minWidth: 210 },
  breakRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 4 },
  swatch: { width: 9, height: 9, borderRadius: 2, display: "inline-block", flexShrink: 0 },
  breakLabel: { color: COLOR.inkSoft, flex: 1 },
  breakValue: { fontVariantNumeric: "tabular-nums", fontWeight: 600 },
};
