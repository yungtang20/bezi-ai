# Contributing to Bezi

## Development setup

Use Node.js 22 or newer and install the committed dependency graph exactly:

```bash
npm ci
```

Create a focused branch and keep pull requests small enough to review. Do not
commit `.env` files, API keys, personal birth data, generated browser reports,
or the external lecture originals.

## Required checks

Run the checks relevant to the change before requesting review:

```bash
npm run lint
npm test
npm run test:api
npm run test:e2e
npm run build
```

Label unavailable checks as **unverified** rather than failed. A failed status
is reserved for a check that was actually executed and returned a mismatch.

## Domain-rule changes

Changes to chart calculation, hidden stems, harmony, pattern scoring,
`LLM_WIKI.md`, or `src/data/` require owner-approved source evidence. Record the
source filename, SHA-256, verification status, decision, and unresolved
ambiguity in `docs/domain-sources.md`. Do not invent numeric weights when a
lecture provides only qualitative direction.

## Pull requests

- Explain the outcome and root cause.
- Include exact validation commands and results.
- Add regression coverage at the module interface where possible.
- Call out dependency, deletion, credential, AI model, schema, and deployment
  changes explicitly.
- Keep unverified assumptions separate from confirmed facts.
