import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { COLOR, SANS } from "../../styles/tokens";
import { fmtUSD } from "../../utils/format";

const BIN_COUNT = 40;

export default function MonteCarloChart({ result }) {
  const { histogram, capHit } = useMemo(() => buildHistogram(result.totals, BIN_COUNT), [result.totals]);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={histogram} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLOR.line} vertical={false} />
          <XAxis
            dataKey="mid"
            tickFormatter={(v) => fmtUSD(v)}
            tick={{ fontFamily: SANS, fontSize: 10, fill: COLOR.inkSoft }}
            axisLine={{ stroke: COLOR.line }}
            tickLine={false}
            interval={Math.floor(BIN_COUNT / 6)}
          />
          <YAxis tick={{ fontFamily: SANS, fontSize: 11, fill: COLOR.inkSoft }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={(v) => [`${v} simulations`, "count"]}
            labelFormatter={(v) => `~${fmtUSD(v)}`}
            contentStyle={{ fontFamily: SANS, fontSize: 12, borderColor: COLOR.panelEdge }}
          />
          <Bar dataKey="count" fill={COLOR.mcSoft} stroke={COLOR.mc} strokeWidth={0.5} />
          <ReferenceLine x={findNearestBinMid(histogram, result.p50)} stroke={COLOR.mc} strokeWidth={1.5} label={{ value: "P50", position: "top", fontSize: 10, fill: COLOR.mc }} />
        </BarChart>
      </ResponsiveContainer>
      {capHit > 0 && (
        <div style={styles.capNote}>
          {capHit} of {result.totals.length} simulated outcomes hit the modeled multiple ceiling and were capped —
          the true right tail is even longer than shown.
        </div>
      )}
    </div>
  );
}

function buildHistogram(totals, binCount) {
  if (!totals.length) return { histogram: [], capHit: 0 };
  // Use the 1st-99th percentile range for binning so a handful of extreme
  // outliers don't compress the whole chart into one visible bar.
  const sorted = totals;
  const lo = sorted[Math.floor(sorted.length * 0.01)];
  const hi = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))];
  const span = Math.max(hi - lo, 1);
  const binWidth = span / binCount;
  const bins = new Array(binCount).fill(0);
  let capHit = 0;
  for (const t of sorted) {
    if (t > hi) { capHit++; continue; }
    const idx = Math.min(binCount - 1, Math.max(0, Math.floor((t - lo) / binWidth)));
    bins[idx]++;
  }
  const histogram = bins.map((count, i) => ({
    mid: lo + binWidth * (i + 0.5),
    count,
  }));
  return { histogram, capHit };
}

function findNearestBinMid(histogram, target) {
  if (!histogram.length) return target;
  let best = histogram[0].mid;
  let bestDiff = Infinity;
  for (const h of histogram) {
    const diff = Math.abs(h.mid - target);
    if (diff < bestDiff) { bestDiff = diff; best = h.mid; }
  }
  return best;
}

MonteCarloChart.propTypes = {
  result: PropTypes.shape({
    totals: PropTypes.arrayOf(PropTypes.number).isRequired,
    p10: PropTypes.number,
    p50: PropTypes.number,
    p90: PropTypes.number,
  }).isRequired,
};

const styles = {
  capNote: { fontSize: 11, color: COLOR.inkSoft, marginTop: 8, lineHeight: 1.5 },
};
