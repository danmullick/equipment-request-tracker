---
name: requirements-reviewer
description: Compare a repository feature specification with its implementation and tests. Use when asked to review acceptance criteria, implementation gaps, unsupported behavior, data or security concerns, and missing tests with specification and code evidence.
---

# Requirements Reviewer

Review the requested feature against its specification. Report findings in the conversation. Do not change files unless the user explicitly asks for changes; invoking this skill alone does not authorize fixes, new tests, or a saved report. Preserve existing local storage and user data during verification.

## Review process

- Read the repository's applicable AGENTS.md and the relevant feature specification in docs/. Use the user's chosen specification; if the intended feature cannot be identified, ask which specification to review before drawing conclusions.
- Read the specification's acceptance criteria, functional rules, constraints, and out-of-scope items. Keep stated requirements separate from optional suggestions. Identify ambiguous or conflicting requirements rather than inventing expected behavior.
- Trace each acceptance criterion through the implementation and existing tests. In this repository, inspect business and storage behavior in src/request-store.js, browser rendering and interaction in src/app.js, and relevant HTML, CSS, and tests.
- Check data compatibility and preservation, including older stored requests, default values, filtering or other display-only operations, and storage writes. Check whether user-provided content reaches unsafe HTML APIs. Review visible labels, keyboard operation, and focus indicators where required by the specification.
- Run npm test when available. Verify browser-dependent criteria when browser access is available, using isolated test data without changing existing stored requests. Do not claim a runtime or browser check passed based only on reading code or earlier verification notes. If a check requires unauthorized file or data changes, report it as unverified and describe the needed check.

## Report

Include all five sections below, even when a section has no findings:

1. **Satisfied acceptance criteria:** Map every acceptance criterion to satisfied, partially satisfied, unmet, or unverified. Cite its specification location and the implementation and test evidence supporting its status. Distinguish code inspection, automated results, and browser observations.
2. **Gaps:** Explain missing or incorrect required behavior, its user impact, and the relevant criterion. Include unresolved specification ambiguities and verification limits without presenting them as confirmed implementation defects.
3. **Unsupported behavior:** Identify implemented behavior outside or contrary to the specification. Cite both the code and the relevant scope or constraint. Where the specification is silent, label the behavior as unspecified rather than assuming it is prohibited.
4. **Data or security concerns:** Report concrete risks to existing requests, storage compatibility, or safe rendering, with the affected path and triggering conditions. State when none were found in the reviewed scope.
5. **Tests still needed:** Describe missing automated or browser scenarios, the criterion each checks, and the expected observable result. Separate tests that are absent from existing tests that could not be run.

Use clickable file references with accurate line numbers for specification, implementation, and test evidence. For a missing behavior, cite the requirement and the relevant implementation location inspected; do not invent a code location for nonexistent code. Support each finding with evidence, explain the practical consequence, and prioritize concrete defects over suggestions. Record commands run, their outcomes, browser checks performed, and any remaining limitations. State which files changed, normally none for a review.
