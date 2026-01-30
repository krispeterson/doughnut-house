export function evalExpr(node:any, env:any):any {
  if (typeof node === "number") return node;
  if (typeof node === "string" && node.startsWith("var.")) {
    const k = node.slice(4);
    if (!(k in env.vars)) throw new Error("Unknown var");
    return env.vars[k];
  }
  if (node?.context) return env.ctx.answers[node.context];
  if (node?.factor) return env.factors[node.factor];
  if (node?.add) return node.add.map((x:any)=>evalExpr(x,env)).reduce((a:number,b:number)=>a+b,0);
  if (node?.mul) return node.mul.map((x:any)=>evalExpr(x,env)).reduce((a:number,b:number)=>a*b,1);
  if (node?.switch) {
    const v = String(evalExpr(node.switch.on, env));
    return v in node.switch.cases
      ? evalExpr(node.switch.cases[v], env)
      : evalExpr(node.switch.default ?? 0, env);
  }
  if (node?.clamp) {
    const v = evalExpr(node.clamp.value, env);
    return Math.max(node.clamp.min, Math.min(node.clamp.max, v));
  }
  throw new Error("Unsupported expr");
}