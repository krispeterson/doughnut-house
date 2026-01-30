# Contributing to Doughnut House

Thank you for your interest in contributing!

This project prioritizes **correctness, transparency, and trust** over speed or cleverness.

Please read this document before submitting a PR.

---

## Development Setup

### Requirements
- Node.js ≥ 20
- npm

### Install
```bash
npm install
```

### Validate
```bash
npm run validate
```

Validation must pass before submitting a PR.

---

## Project Structure (Quick Orientation)

- `core/engine/` — deterministic logic
- `plugins/` — domain logic in JSON
- `schemas/` — JSON schemas
- `data/` — manifests and reference data
- `tools/` — validation and scaffolding

---

## Adding a New Plugin

Use the generator:

```bash
npm run new:category my_category
# or
npm run new:behavior my_behavior
```

This creates a schema-valid starting point.

### Plugin Rules
- Do not invent emissions factors
- Do not hardcode regional assumptions
- Add TODOs where data is missing
- Run `npm run validate` frequently

---

## Validation Expectations

Validation checks:
- Schema correctness
- Provider references
- Expression operators
- i18n key usage
- Structural integrity

If validation fails, **fix validation first**.

---

## i18n Guidelines

- All user-visible text must be referenced via `*_key`
- i18n files live under `i18n/<locale>.json`
- Missing keys are errors
- Unused keys produce warnings

---

## Scientific Integrity

Do not:
- Guess emissions values
- Copy numbers from unverified sources
- Encode policy preferences

Prefer:
- Cited sources (future work)
- Conservative assumptions
- Explicit uncertainty

---

## AI Assistance

AI tools are welcome.

However:
- All AI-generated output must pass validation
- AI must follow `AGENTS.md`
- Contributors are responsible for correctness

AI is a collaborator, not an authority.

---

## Code Style

- Prefer clarity over brevity
- Comment intent, not syntax
- Avoid clever abstractions
- Keep tooling boring

---

## Submitting a PR

Before submitting:
- Run `npm run validate`
- Ensure changes align with `ARCHITECTURE.md`
- Update `DECISIONS.md` if behavior changes

PRs that weaken validation or blur architecture boundaries will be rejected.

---

## Questions and Discussion

If unsure:
- Open an issue
- Ask for clarification
- Propose options instead of guessing

This project values thoughtful contributions.

Thank you for helping build something durable and trustworthy.
