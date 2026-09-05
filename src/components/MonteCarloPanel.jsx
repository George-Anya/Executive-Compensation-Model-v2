import React, { useState } from "react";
import PropTypes from "prop-types";
import { COLOR, SERIF } from "../styles/tokens";
import { fmtUSD } from "../utils/format";
import { runMonteCarloSimulation, MC_DEFAULTS } from "../utils/finance";
import MonteCarloChart from "./Charts/MonteCarloChart";

export default function MonteCarloPanel({ inputs }) {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    // Defer to next tick so the "running" state actually paints before
    // the (synchronous, CPU-bound) simulation blocks the main thread.
    setTimeout(() => {
      const r = runMonteCarloSimulation(inputs, { simulations: MC_DEFAULTS.simulations });
      setResult(r);
      setRunning(false);
    }, 30);
  };

  return (
    <div style={styles.panel}>
      <div style={styles.headerRow}>
        <div style={styles.panelTitle}>Monte Carlo — probability-weighted outcomes</div>
        <button style={styles.button} onClick={run} disabled={running}>
          {running ? "Running…" : result ? "Re-run (10,000 trials)" : "Run simulation (10,000 trials)"}
        </button>
      </div>

      {!result && !running && (
        <div style={styles.placeholder}>
          Draws exit valuation from a real venture-return distribution instead of the three manual scenarios.
          Run it to see the full probability-weighted range for this package.
        </div>
      )}

      {result && (
        <>
          <div style={styles.percentileRow}>
            <Percentile label="P10 (downside)" value={result.p10} color={COLOR.down} />
            <Percentile label="P50 (median)" value={result.p50} color={COLOR.ink} emphasize />
            <Percentile label="P90 (upside)" value={result.p90} color={COLOR.up} />
          </div>
          <MonteCarloChart result={result} />
        </>
      )}

      <div style={styles.methodology}>
        <div style={styles.methodologyTitle}>Simulation methodology</div>
        <ul style={styles.methodologyList}>
          <li>
            Exit-valuation multiple is drawn from a power-law distribution (α=2.05, x_min=0.35) fit by Moonfire
            Ventures to Correlation Ventures' dataset of 21,000+ venture financings — reused here as a proxy for
            company valuation growth from grant date to exit.
          </li>
          <li>
            Time-to-exit is drawn per outcome size, based on Y Combinator's 2025 exit-cohort data (sub-$100M
            exits ~3yr median, $100M–$999M ~6yr, $1B+ ~10yr), with random jitter around each median.
          </li>
          <li>
            Dilution is modeled as discrete funding rounds roughly every 2.25 years, each diluting existing
            holders ~13%, based on Carta's Q3 2025 report on inter-round timing and dilution.
          </li>
          <li>
            This repurposes VC financing-return data as a stand-in for single-company valuation growth — a
            disclosed simplification, not a perfect match to any one company's actual trajectory.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Percentile({ label, value, color, emphasize }) {
  return (
    <div style={styles.percentileCell}>
      <div style={styles.percentileLabel}>{label}</div>
      <div style={{ ...styles.percentileValue, color, fontSize: emphasize ? 26 : 20 }}>
        {fmtUSD(value, { compact: false })}
      </div>
    </div>
  );
}

MonteCarloPanel.propTypes = {
  inputs: PropTypes.object.isRequired,
};

Percentile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  emphasize: PropTypes.bool,
};

const styles = {
  panel: {
    background: COLOR.panel,
    border: `1px solid ${COLOR.panelEdge}`,
    borderRadius: 4,
    padding: "18px 20px",
    marginBottom: 20,
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  panelTitle: { fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: COLOR.ink },
  button: {
    background: COLOR.ink, color: "#fff", border: "none", borderRadius: 3,
    padding: "8px 14px", fontSize: 12.5, cursor: "pointer",
  },
  placeholder: { fontSize: 12.5, color: COLOR.inkSoft, lineHeight: 1.6, padding: "8px 0" },
  percentileRow: { display: "flex", gap: 24, marginBottom: 14, flexWrap: "wrap" },
  percentileCell: { minWidth: 140 },
  percentileLabel: { fontSize: 11.5, color: COLOR.inkSoft, marginBottom: 2 },
  percentileValue: { fontFamily: SERIF, fontWeight: 600 },
  methodology: { borderTop: `1px solid ${COLOR.line}`, paddingTop: 14, marginTop: 16 },
  methodologyTitle: { fontFamily: SERIF, fontSize: 13, fontWeight: 600, marginBottom: 8 },
  methodologyList: { margin: 0, paddingLeft: 18, color: COLOR.inkSoft, fontSize: 11.5, lineHeight: 1.6 },
};
