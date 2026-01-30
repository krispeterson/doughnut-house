# AGENTS.md — Guidance for AI Agents and Automation

This repository is **AI-assisted but engineer-led**.

AI agents (LLMs, Copilot, Cursor, ChatGPT, etc.) must follow the rules below when generating, modifying, or reviewing code and data in this project.

This file is authoritative.

---

## Core Engineering Principles

**Correctness > Determinism > Clarity > Convenience**

- Prefer explicit code over clever abstractions
- Prefer boring solutions that work everywhere
- Never trade correctness for syntactic elegance

---

## Architectural Boundaries (DO NOT VIOLATE)

The system is intentionally layered:

1. **Core engine**  
   - Deterministic
   - Side-effect free
   - Pure logic only

2. **Providers**  
   - External data sources (emissions factors, region-specific values)
   - No UI or persistence logic

3. **Plugins (JSON)**  
   - Data-driven domain logic
   - Categories and behaviors
   - No executable JavaScript

4. **Tooling (`tools/`)**  
   - Validation
   - Scaffolding
   - Developer experience
   - Must be maximally portable

5. **UI layers (RN / AR)**  
   - Consumers of the core
   - Must not define domain rules

AI agents must **not collapse or blur these layers**.

---

## JSON Policy

JSON is the canonical format for:
- Plugins
- Models
- Schemas
- Manifests

### Tooling Rule (Non-Negotiable)

**Do NOT use JSON import assertions in tooling scripts.**

Specifically:
- ❌ `import data from "./file.json" assert { type: "json" }`
- ✅ `fs.readFileSync + JSON.parse`

Rationale:
- Loader-based JSON imports are fragile across environments
- Tooling must work without Node flags or special loaders
- Contributors should not debug Node loader semantics

---

## Validation Rules

### Schemas
- JSON Schemas use **draft 2020-12**
- Tooling must use **Ajv2020**
- Do not downgrade schema drafts

### i18n Validation (Important)

Rules:
- **Missing referenced keys → error**
- **Unused keys → warning only**
- i18n keys may be referenced from:
  - `plugin.json`
  - models
  - `actions.json`
  - `verification.json`
  - future UI-facing data
- i18n keys are detected by convention:
  - Only values of properties ending in "_key" are treated as i18n references
  - IDs, refs, and observation types are NOT i18n keys


Do not enforce “plugin.json-only” i18n usage.

---

## Determinism Requirements

The core engine must remain:
- Deterministic for identical inputs
- Serializable (JSON-safe)
- Free of hidden state

AI agents must not introduce:
- Time-based logic inside the engine
- Network calls inside estimators
- Randomness
- Global mutable state

---

## Scientific and Domain Integrity

AI agents must:
- Never invent emissions factors or scientific constants
- Never hardcode regional assumptions without explicit scoping
- Prefer TODOs over speculative values

If a value is unknown:
- Leave it undefined
- Add a TODO explaining what is needed

---

## Style Expectations

- Favor clarity over brevity
- Use comments to explain **intent**, not syntax
- Fail fast and loudly in tooling
- Fail gracefully at runtime

---

## When Uncertain

AI agents should:
1. Stop
2. State the uncertainty explicitly
3. Offer 2–3 concrete options
4. Let a human choose

This project values **trustworthiness, inspectability, and correctness** over speed.
