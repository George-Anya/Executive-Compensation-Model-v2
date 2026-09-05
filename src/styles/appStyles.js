import { SERIF, SANS, COLOR } from "./tokens";

export const appStyles = {
  wrap: { fontFamily: SANS, background: COLOR.bg, color: COLOR.ink, padding: "28px 28px 40px", minHeight: "100%", boxSizing: "border-box" },
  header: { marginBottom: 22, maxWidth: 760 },
  headerTitle: { fontFamily: SERIF, fontSize: 26, fontWeight: 600, letterSpacing: "0.2px" },
  headerSub: { fontFamily: SANS, fontSize: 13, color: COLOR.inkSoft, marginTop: 6 },
  grid: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" },
  outputCol: { minWidth: 0 },
  tabRow: { display: "flex", gap: 2, paddingLeft: 4 },
  tab: { cursor: "pointer", border: "1px solid transparent", background: "transparent", fontFamily: "inherit", fontSize: 13, padding: "8px 16px", borderRadius: "3px 3px 0 0", color: COLOR.inkSoft },
  tabActive: { color: COLOR.ink, fontWeight: 600, borderColor: COLOR.panelEdge, borderBottomColor: COLOR.panel, background: COLOR.panel },
  panel: { background: COLOR.panel, border: `1px solid ${COLOR.panelEdge}`, borderRadius: 4, padding: "18px 20px", marginBottom: 20 },
};
