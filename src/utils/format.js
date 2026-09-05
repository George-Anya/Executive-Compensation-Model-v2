export function fmtUSD(n, opts = {}) {
  const { compact = true } = opts;
  if (n == null || Number.isNaN(n)) return "$0";
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (compact) {
    if (v >= 1_000_000) return `${sign}$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 1 : 2)}M`;
    if (v >= 1_000) return `${sign}$${(v / 1_000).toFixed(0)}k`;
  }
  return `${sign}$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
