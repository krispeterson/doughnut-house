import { evalExpr } from "./expr.js";

export function evaluateRulesPlusFactors(model:any, ctx:any, obs:any, providers:any) {
  const factors:any = {};
  for (const [k,v] of Object.entries(model.factors ?? {})) {
    factors[k] = typeof v === "object" && v.ref ? providers.getNumber(v.ref, ctx) : v;
  }

  const vars:any = {};
  for (const [k,v] of Object.entries(model.vars ?? {})) {
    vars[k] = evalExpr(v, { ctx, obs, vars, factors, providers });
  }

  let annual:any;
  try {
    annual = model.annual_co2e_kg
      ? evalExpr(model.annual_co2e_kg, { ctx, obs, vars, factors, providers })
      : null;
  } catch {
    return { impact_band: model.defaults?.impact_band ?? "unknown", assumptions: ["Estimate not computed"] };
  }

  const range = annual != null ? [annual * 0.8, annual * 1.2] : undefined;

  let band = model.defaults?.impact_band ?? "medium";
  for (const r of model.bands ?? []) {
    if (r.lte_kg != null && annual <= r.lte_kg) band = r.band;
    if (r.gt_kg != null && annual > r.gt_kg) band = r.band;
  }

  return {
    impact_band: band,
    annual_co2e_kg_range: range,
    assumptions: model.defaults?.assumptions ?? []
  };
}