import React from "react";
import PropTypes from "prop-types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { COLOR, SANS } from "../../styles/tokens";
import { fmtUSD } from "../../utils/format";

export default function ScenarioComparison({ data, timeToExit }) {
  return (
    <div>
      <div style={styles.chartLabel}>Package value across exit scenarios (at year {timeToExit})</div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLOR.line} vertical={false} />
          <XAxis dataKey="name" tick={{ fontFamily: SANS, fontSize: 12, fill: COLOR.inkSoft }} axisLine={{ stroke: COLOR.line }} tickLine={false} />
          <YAxis tickFormatter={(v) => fmtUSD(v)} tick={{ fontFamily: SANS, fontSize: 11, fill: COLOR.inkSoft }} axisLine={false} tickLine={false} width={56} />
          <Tooltip formatter={(v) => fmtUSD(v, { compact: false })} contentStyle={{ fontFamily: SANS, fontSize: 12, borderColor: COLOR.panelEdge }} />
          <Bar dataKey="Cash" stackId="a" fill={COLOR.cash} />
          <Bar dataKey="RSUs" stackId="a" fill={COLOR.rsu} />
          <Bar dataKey="Options" stackId="a" fill={COLOR.opt} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

ScenarioComparison.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      Cash: PropTypes.number,
      RSUs: PropTypes.number,
      Options: PropTypes.number,
      total: PropTypes.number,
    })
  ).isRequired,
  timeToExit: PropTypes.number.isRequired,
};

const styles = {
  chartLabel: { fontSize: 12.5, color: COLOR.inkSoft, marginBottom: 4 },
};
