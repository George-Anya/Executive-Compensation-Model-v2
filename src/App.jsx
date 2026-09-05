import React from "react";
import { useCompModel, SCENARIO_COLOR, SCENARIO_LABEL } from "./hooks/useCompModel";
import { appStyles as styles } from "./styles/appStyles";

import InputPanel from "./components/InputPanel";
import ScenarioTabs from "./components/ScenarioTabs";
import OverviewCard from "./components/OverviewCard";
import ValueBuildChart from "./components/Charts/ValueBuildChart";
import ScenarioComparison from "./components/Charts/ScenarioComparison";
import TornadoChart from "./components/Charts/TornadoChart";
import MonteCarloPanel from "./components/MonteCarloPanel";
import Methodology from "./components/Methodology";

export default function App() {
  const m = useCompModel();

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>Founder &amp; Executive Compensation Structuring Model</div>
        <div style={styles.headerSub}>Illustrative scenario model — value of an equity-and-cash package across exit outcomes</div>
      </div>

      <div style={styles.grid}>
        <InputPanel inputs={m.inputs} onChange={m.setInputs} scenarios={m.scenarios} onScenarioChange={m.setScenarios} />

        <div style={styles.outputCol}>
          <ScenarioTabs active={m.active} onSelect={m.setActive} />

          <div style={{ ...styles.panel, borderTopLeftRadius: 0 }}>
            <OverviewCard active={m.active} scenarioLabel={SCENARIO_LABEL} scenarioColor={SCENARIO_COLOR} breakdown={m.activeBreakdown} />
            <ValueBuildChart data={m.timeline} />
          </div>

          <div style={styles.panel}>
            <ScenarioComparison data={m.comparison} timeToExit={m.inputs.timeToExit} />
          </div>

          <div style={styles.panel}>
            <TornadoChart rows={m.tornado.rows} baseTotal={m.tornado.baseTotal} maxAbs={m.tornado.maxAbs} />
          </div>

          <MonteCarloPanel inputs={m.inputs} />
          <Methodology />
        </div>
      </div>
    </div>
  );
}
