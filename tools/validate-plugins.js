#!/usr/bin/env node
/**
 * Plugin validation script
 *
 * IMPORTANT:
 * - Tooling intentionally avoids JSON import assertions.
 * - Uses fs + JSON.parse for maximum portability.
 * - Uses Ajv 2020 because schemas declare draft 2020-12.
 */

import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = process.cwd();
const PLUGINS_DIR = path.join(ROOT, "plugins");

/* -------------------- utilities -------------------- */

function die(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    die(`Failed to read JSON: ${p}`);
  }
}

function formatErrors(errors) {
  return errors.map(e => `${e.instancePath || "(root)"} ${e.message}`).join("; ");
}

/* -------------------- load manifests -------------------- */

const providersManifest = readJson(
  path.join(ROOT, "data/providers.manifest.json")
);

const opsManifest = readJson(
  path.join(ROOT, "core/engine/engine.ops.manifest.json")
);

const KNOWN_PROVIDER_REFS = new Set(providersManifest.refs ?? []);

const RULE_OPS = new Set(
  (opsManifest.rules_expr_ops ?? []).filter(o => o !== "var_string")
);
const CALC_OPS = new Set(
  (opsManifest.calculator_expr_ops ?? []).filter(o => o !== "var_string")
);

/* -------------------- load schemas -------------------- */

const schemaCat = readJson(path.join(ROOT, "schemas/plugin.category.schema.json"));
const schemaBeh = readJson(path.join(ROOT, "schemas/plugin.behavior.schema.json"));
const schemaRules = readJson(path.join(ROOT, "schemas/model.rules.schema.json"));
const schemaCalc = readJson(path.join(ROOT, "schemas/model.calc.schema.json"));
const schemaActions = readJson(path.join(ROOT, "schemas/actions.schema.json"));
const schemaVerification = readJson(path.join(ROOT, "schemas/verification.schema.json"));

/* -------------------- AJV setup -------------------- */

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateCat = ajv.compile(schemaCat);
const validateBeh = ajv.compile(schemaBeh);
const validateRules = ajv.compile(schemaRules);
const validateCalc = ajv.compile(schemaCalc);
const validateActions = ajv.compile(schemaActions);
const validateVerification = ajv.compile(schemaVerification);

/* -------------------- expression validation -------------------- */

function walkExpr(node, allowedOps, where) {
  if (typeof node === "number") return;

  if (typeof node === "string") {
    if (node.startsWith("var.")) return;
    die(`Invalid string expression at ${where}: ${node}`);
  }

  if (typeof node !== "object" || node === null) {
    die(`Invalid expression node at ${where}`);
  }

  const keys = Object.keys(node);
  if (keys.length !== 1) {
    die(`Expression must have exactly one operator at ${where}`);
  }

  const op = keys[0];
  if (!allowedOps.has(op)) {
    die(`Unsupported operator "${op}" at ${where}`);
  }

  const val = node[op];

  if (op === "ref") {
    if (!KNOWN_PROVIDER_REFS.has(val)) {
      die(`Unknown provider ref "${val}" at ${where}`);
    }
    return;
  }

  if (Array.isArray(val)) {
    val.forEach((v, i) => walkExpr(v, allowedOps, `${where}.${op}[${i}]`));
  } else if (typeof val === "object") {
    Object.entries(val).forEach(([k, v]) =>
      walkExpr(v, allowedOps, `${where}.${op}.${k}`)
    );
  }
}

/**
 * Collect i18n keys by convention:
 * Any property whose name ends with "_key" is treated as an i18n key reference.
 */
function collectI18nKeys(obj, out = new Set()) {
  if (Array.isArray(obj)) {
    obj.forEach(v => collectI18nKeys(v, out));
    return out;
  }

  if (typeof obj === "object" && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      if (k.endsWith("_key") && typeof v === "string") {
        out.add(v);
      } else {
        collectI18nKeys(v, out);
      }
    }
    return out;
  }

  return out;
}

function validateI18n(i18n, referencedKeys, where) {
  // Hard error: referenced but missing
  for (const k of referencedKeys) {
    if (!(k in i18n)) {
      die(`Missing i18n key "${k}" referenced in plugin (${where})`);
    }
  }

  // Soft warning: present but unused
  for (const k of Object.keys(i18n)) {
    if (!referencedKeys.has(k)) {
      console.warn(`⚠ Unused i18n key "${k}" in ${where}`);
    }
  }
}

/* -------------------- plugin validation -------------------- */

function validatePluginDir(dir, kind) {
  const pluginPath = path.join(dir, "plugin.json");
  const manifest = readJson(pluginPath);

  const ok =
    kind === "category"
      ? validateCat(manifest)
      : validateBeh(manifest);

  if (!ok) {
    die(
      `Schema error in ${pluginPath}: ${
        formatErrors(
          kind === "category"
            ? validateCat.errors
            : validateBeh.errors
        )
      }`
    );
  }

  const modelPath = path.join(dir, manifest.estimator.model_ref);
  const model = readJson(modelPath);

  if (kind === "category") {
    if (!validateRules(model)) {
      die(`Invalid rules model ${modelPath}: ${formatErrors(validateRules.errors)}`);
    }
    if (model.annual_co2e_kg) {
      walkExpr(model.annual_co2e_kg, RULE_OPS, modelPath);
    }
  } else {
    if (!validateCalc(model)) {
      die(`Invalid calc model ${modelPath}: ${formatErrors(validateCalc.errors)}`);
    }
  }

  const actions = readJson(path.join(dir, manifest.actions.ref));
  if (!validateActions(actions)) {
    die(`Invalid actions.json in ${dir}: ${formatErrors(validateActions.errors)}`);
  }

  const verification = readJson(path.join(dir, manifest.verification.ref));
  if (!validateVerification(verification)) {
    die(`Invalid verification.json in ${dir}: ${formatErrors(validateVerification.errors)}`);
  }

  // ---- i18n ----
  const referencedKeys = new Set();
  collectI18nKeys(manifest, referencedKeys);
  collectI18nKeys(model, referencedKeys);
  collectI18nKeys(actions, referencedKeys);
  collectI18nKeys(verification, referencedKeys);

  const i18nPath = path.join(dir, "i18n", "en-US.json");
  const i18n = readJson(i18nPath);
  validateI18n(i18n, referencedKeys, i18nPath);
}

function walkPlugins(folder) {
  const base = path.join(PLUGINS_DIR, folder);
  if (!fs.existsSync(base)) return;

  for (const d of fs.readdirSync(base)) {
    validatePluginDir(
      path.join(base, d),
      folder === "categories" ? "category" : "behavior"
    );
  }
}

/* -------------------- run -------------------- */

walkPlugins("categories");
walkPlugins("behaviors");

console.log("✔ Plugin validation passed");
