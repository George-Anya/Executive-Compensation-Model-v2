import React from "react";
import PropTypes from "prop-types";
import { SCENARIO_LABEL } from "../hooks/useCompModel";
import { appStyles as styles } from "../styles/appStyles";

export default function ScenarioTabs({ active, onSelect }) {
  return (
    <div style={styles.tabRow}>
      {["downside", "base", "upside"].map((k) => (
        <button key={k} onClick={() => onSelect(k)} style={{ ...styles.tab, ...(active === k ? styles.tabActive : {}) }}>
          {SCENARIO_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

ScenarioTabs.propTypes = {
  active: PropTypes.oneOf(["downside", "base", "upside"]).isRequired,
  onSelect: PropTypes.func.isRequired,
};
