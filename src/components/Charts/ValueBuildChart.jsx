import React from "react";
import PropTypes from "prop-types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { COLOR, SANS } from "../../styles/tokens";
import { fmtUSD } from "../../utils/format";

export default function ValueBuildChart({ data }) {
  return (
    <div>
      <div style={styles.chartLabel}>Package value build-up over the vesting period</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLOR.line} vertical={false} />
          <XAxis dataKey="year" tick={{ fontFamily: SANS, fontSize: 11, fill: COLOR.inkSoft }} axisLine={{ stroke: COLOR.line }} tickLine={false} />
          <YAxis tickFormatter={(v) => fmtUSD(v)} tick={{ fontFamily: SANS, fontSize: 11, fill: COLOR.inkSoft }} axisLine={false} tickLine={false} width={56} />
          <Tooltip formatter={(v) => fmtUSD(v, { compact: false })} contentStyle={{ fontFamily: SANS, fontSize: 12, borderColor: COLOR.panelEdge }} />
          <Area type="monotone" dataKey="Cash" stackId="1" stroke={COLOR.cash} fill={COLOR.cash} fillOpacity={0.85} />
          <Area type="monotone" dataKey="RSUs" stackId="1" stroke={COLOR.rsu} fill={COLOR.rsu} fillOpacity={0.85} />
          <Area type="monotone" dataKey="Options" stackId="1" stroke={COLOR.opt} fill={COLOR.opt} fillOpacity={0.85} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

ValueBuildChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.string,
      Cash: PropTypes.number,
      RSUs: PropTypes.number,
      Options: PropTypes.number,
    })
  ).isRequired,
};

const styles = {
  chartLabel: { fontSize: 12.5, color: COLOR.inkSoft, marginBottom: 4 },
};
