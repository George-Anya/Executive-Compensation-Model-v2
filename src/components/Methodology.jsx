import React from "react";
import { COLOR, SERIF } from "../styles/tokens";

export default function Methodology() {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>Methodology &amp; assumptions (manual scenarios)</div>
      <ul style={styles.list}>
        <li>Equity value at exit is computed from the exit company valuation divided by fully diluted shares outstanding at exit, with dilution compounded annually from the grant date.</li>
        <li>Vesting is modeled linearly after the cliff; performance-based acceleration is not modeled here.</li>
        <li>Between grant and exit, company valuation is assumed to move linearly toward the modeled exit value — a simplifying assumption for illustration, not a valuation forecast.</li>
        <li>Cash compensation is shown as nominal accrued salary (undiscounted); no tax treatment is modeled — this is a pre-tax, illustrative structuring view only.</li>
        <li>This model is for illustrative and discussion purposes; it is not tax, legal, or investment advice.</li>
      </ul>
    </div>
  );
}

const styles = {
  wrap: { borderTop: `1px solid ${COLOR.line}`, paddingTop: 16, marginTop: 4 },
  title: { fontFamily: SERIF, fontSize: 13.5, fontWeight: 600, marginBottom: 8 },
  list: { margin: 0, paddingLeft: 18, color: COLOR.inkSoft, fontSize: 12, lineHeight: 1.6 },
};
