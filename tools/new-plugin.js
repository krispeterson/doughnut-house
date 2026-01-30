#!/usr/bin/env node
/**
 * Plugin scaffolding generator
 *
 * NOTE:
 * This script intentionally avoids JSON import assertions.
 * Tooling must be portable and require no Node loader flags.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

/* ---- Args ---- */

const [, , kind, rawId] = process.argv;

if (!kind || !rawId) {
  die("Usage: npm run new:category <id> OR npm run new:behavior <id>");
}

if (!["category", "behavior"].includes(kind)) {
  die(`Unknown plugin kind "${kind}"`);
}

const id = rawId.toLowerCase().replace(/[^a-z0-9_]/g, "_");

const baseDir =
  kind === "category"
    ? path.join(ROOT, "plugins", "categories", id)
    : path.join(ROOT, "plugins", "behaviors", id);

if (fs.existsSync(baseDir)) {
  die(`Plugin already exists: ${baseDir}`);
}

ensureDir(baseDir);
ensureDir(path.join(baseDir, "i18n"));

/* ---- Category ---- */

if (kind === "category") {
  writeJson(path.join(baseDir, "plugin.json"), {
    plugin: {
      id: `category.${id}`,
      version: "0.1.0",
      name_key: `category.${id}.name`,
      description_key: `category.${id}.desc`
    },
    category: {
      id,
      icon: "placeholder",
      tags: []
    },
    triggers: {
      any_of_observation_types: [`home.${id}`]
    },
    estimator: {
      kind: "rules_plus_factors_v1",
      model_ref: "model.rules.json"
    },
    actions: { ref: "actions.json" },
    verification: { ref: "verification.json" },
    i18n: { locales: ["en-US"] },
    questions: []
  });

  writeJson(path.join(baseDir, "model.rules.json"), {
    estimator: "rules_plus_factors_v1",
    defaults: {
      impact_band: "medium",
      assumptions: [
        "TODO: Replace placeholder assumptions with real domain logic"
      ]
    },
    factors: {},
    vars: {},
    annual_co2e_kg: 0,
    bands: [{ band: "medium" }]
  });

  writeJson(path.join(baseDir, "actions.json"), { actions: [] });
  writeJson(path.join(baseDir, "verification.json"), { steps: [] });
}

/* ---- Behavior ---- */

if (kind === "behavior") {
  writeJson(path.join(baseDir, "plugin.json"), {
    plugin: {
      id: `behavior.${id}`,
      version: "0.1.0",
      name_key: `behavior.${id}.name`,
      description_key: `behavior.${id}.desc`
    },
    behavior: {
      id,
      icon: "placeholder",
      tags: []
    },
    estimator: {
      kind: "calculator_v1",
      model_ref: "model.calc.json"
    },
    actions: { ref: "actions.json" },
    verification: { ref: "verification.json" },
    i18n: { locales: ["en-US"] },
    inputs: []
  });

  writeJson(path.join(baseDir, "model.calc.json"), {
    estimator: "calculator_v1",
    defaults: {
      impact_band: "low",
      assumptions: [
        "TODO: Replace placeholder assumptions with real domain logic"
      ]
    },
    calculator: {
      steps: []
    }
  });

  writeJson(path.join(baseDir, "actions.json"), { actions: [] });
  writeJson(path.join(baseDir, "verification.json"), { steps: [] });
}

/* ---- i18n ---- */

writeJson(path.join(baseDir, "i18n", "en-US.json"), {
  [`${kind}.${id}.name`]: id,
  [`${kind}.${id}.desc`]: "TODO: Replace description"
});

console.log(`✔ Created ${kind} plugin at ${baseDir}`);
console.log("Next steps:");
console.log("  1) Edit plugin files");
console.log("  2) Run npm run validate");
