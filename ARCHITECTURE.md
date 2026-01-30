# Architecture Overview

## Purpose

Doughnut House is a **data-driven environmental impact exploration platform**.

Its core goal is to:
- Make environmental impact visible and understandable
- Allow exploration of tradeoffs without scolding or moralizing
- Enable extensibility through open, inspectable data models

The system is intentionally designed so that **domain logic lives in data**, not in application code.

---

## Core Principles

1. **Determinism**
   - Given the same inputs, the system must produce the same outputs.
   - No randomness, network calls, or hidden state in the engine.

2. **Separation of Concerns**
   - Logic, data, tooling, and UI are cleanly separated.
   - UI layers consume results; they do not define rules.

3. **Transparency**
   - Estimates must be explainable.
   - Assumptions are surfaced explicitly.
   - No “black box” calculations.

4. **Extensibility**
   - New categories, behaviors, and regions are added via data (plugins).
   - Core code should change rarely.

5. **Portability**
   - Tooling must run without special Node flags or loaders.
   - Contributors should not debug environment-specific issues.

---

## High-Level Architecture

```
┌───────────────────────────┐
│        UI Layers          │
│  (RN / AR / Web / CLI)    │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│        Core Engine        │
│  - Expression evaluator   │
│  - Estimators             │
│  - Impact classification │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│          Plugins          │
│  (JSON domain logic)      │
│  - Categories             │
│  - Behaviors              │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│         Providers         │
│  (external factors)       │
│  - Emissions factors      │
│  - Regional values        │
└───────────────────────────┘
```

---

## Core Components

### `core/engine/`
The **pure logic layer**.

Responsibilities:
- Evaluate expressions
- Resolve variables and factors
- Compute impact estimates
- Assign impact bands

Constraints:
- No I/O
- No persistence
- No UI logic
- No domain assumptions baked into code

---

### `plugins/`
The **domain layer**, defined entirely in JSON.

Two plugin types:
- **Categories** (physical things like appliances, homes, vehicles)
- **Behaviors** (activities like travel, usage patterns)

Plugins define:
- What data is needed
- How impact is estimated
- What actions are suggested
- What assumptions apply

Plugins do *not* execute code.

---

### `data/`
Canonical reference data and manifests.

Examples:
- Provider reference manifests
- Operator manifests
- (Future) regional mappings

These files define the **allowed universe** of references.

---

### `tools/`
Developer tooling.

Responsibilities:
- Validate plugins and schemas
- Scaffold new plugins
- Enforce architectural invariants

Tooling must be:
- Boring
- Portable
- Strict

---

### UI Layers (RN / AR / Web)

Responsibilities:
- Collect inputs
- Display results
- Guide exploration

UI layers must **never**:
- Encode domain rules
- Perform calculations
- Invent assumptions

---

## Non-Goals

The following are intentionally out of scope:

- AI-generated estimates inside the engine
- Fully precise accounting
- Policy enforcement or nudging
- Judgmental UX
- Hard-coded regional assumptions

---

## Design Consequences

Because of these choices:
- Validation is strict
- JSON schemas are central
- Tooling may reject “almost correct” plugins
- Contributors are guided, not trusted blindly

This is intentional.
