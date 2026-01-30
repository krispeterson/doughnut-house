# Architectural Decisions

This document records **explicit decisions** made during the design of Doughnut House.

Its purpose is to:
- Prevent repeated debates
- Preserve reasoning across time
- Guide AI agents and contributors

If a decision changes, update this file.

---

## JSON as the Domain Format

**Decision:**  
All executable domain logic is defined in JSON.

**Rationale:**
- Deterministic parsing
- Strong schema validation
- No ambiguous typing
- Excellent tooling support
- Machine-first, human-inspectable

**Rejected Alternatives:**
- YAML (ambiguous, indentation-sensitive)
- JavaScript configs (too powerful, unsafe)
- Custom DSL (too much maintenance)

---

## No JSON Import Assertions in Tooling

**Decision:**  
Tooling scripts must load JSON via `fs.readFileSync + JSON.parse`.

**Rationale:**
- JSON import assertions are fragile across environments
- npm, CI, and shells invoke Node differently
- Tooling should require zero flags or loader configuration

**Consequence:**
- Slightly more verbose code
- Much higher portability

---

## JSON Schema Draft 2020-12

**Decision:**  
All schemas use JSON Schema draft 2020-12.

**Rationale:**
- Modern standard
- Future-proof
- Supported by Ajv2020
- Better expressiveness

**Constraint:**
- Tooling must use `ajv/dist/2020.js`

---

## Validation Is Strict by Default

**Decision:**  
Validation failures are treated as hard errors.

**Rationale:**
- Prevent silent drift
- Catch mistakes early
- Protect downstream consumers

Warnings are allowed only where explicitly documented.

---

## i18n Key Detection by Convention

**Decision:**  
Only values of properties ending in `_key` are treated as i18n references.

**Rationale:**
- Explicit
- Avoids false positives
- Scales cleanly
- Matches industry practice

**Examples:**
- `name_key` → validated
- `plugin.id` → not validated
- `providers.emissions.electricity` → not validated

---

## Deterministic Core Engine

**Decision:**  
The core engine must be deterministic and side-effect free.

**Rationale:**
- Testability
- Trust
- Reproducibility
- Ease of reasoning

**Explicitly Forbidden:**
- Network calls
- Randomness
- Time-based logic
- Global mutable state

---

## Plugins over Code Changes

**Decision:**  
New domain logic should be added via plugins, not core code.

**Rationale:**
- Reduces merge conflicts
- Encourages contribution
- Keeps engine stable

Core code should change rarely.

---

## AI as Assistant, Not Authority

**Decision:**  
AI tools assist engineering but do not define truth.

**Rationale:**
- Scientific integrity
- Auditability
- Long-term maintainability

AI outputs must always be inspectable and validated.
