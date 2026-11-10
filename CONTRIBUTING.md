# Contributing

Keep changes focused on the consultation drafting workflow. Explain the problem and expected behavior, use synthetic examples, and run `npm test` before submitting a change. For UI changes, also run the optional browser smoke check described in [TESTING.md](TESTING.md), or describe the browser checks you performed.

Do not include identifiable patient information, private clinical records, credentials, environment files, or production screenshots in issues, commits, logs, or test fixtures. Bug reproductions must use invented information. Report suspected security or privacy issues privately to the owner as described in [SECURITY.md](SECURITY.md).

Clinical phrase changes should explain their intended context and require review by a qualified clinician. Do not add findings, consent, or treatment statements that appear in drafts without an explicit user selection or entry. Preserve manual draft edits or ask before replacing them.

The runtime is dependency-free. Discuss integrations, persistent storage, or new dependencies before introducing them, because they change the privacy and deployment boundaries. Include relevant test coverage for behavior changes and update documentation when the workflow changes.
