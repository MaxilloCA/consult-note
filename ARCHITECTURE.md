# Architecture

The browser fetches one static JSON phrase catalog from the same local origin. It builds labeled fieldsets and text areas with DOM APIs. User-entered strings are assigned through `textContent` and `value`, never interpreted as HTML. All draft state stays in a JavaScript object in the current tab.

`SECTIONS` defines the consultation structure. `emptyState`, `toggleChoice`, `demoState`, and `buildNote` are pure functions shared with the Node tests. Rendering rebuilds the controls after a choice and restores focus to the selected button. Text entry updates the preview without rebuilding the input. The note generator emits only nonempty sections and never adds findings or consent boilerplate automatically.

The preview is an editable textarea. Copy reads that textarea, including final edits. Changes to structured input ask for confirmation before regenerating a manually edited preview. Clear and example replacement also ask before discarding a nonempty draft. There is no synchronization between tabs and no persistence across reloads.

The dependency-free HTTP server binds to `127.0.0.1:4173`. Exact URL allowlisting prevents serving repository documentation, hidden files, or arbitrary filesystem paths. Responses include a same-origin content security policy and no-store cache directive. No backend clinical logic or outbound integration exists.

## Extraction boundary

The static `OPTIONS` catalog and history detail phrases come from `cnote.htm`. The standalone UI also supports the source workflow's optional details for each selected treatment phrase. Details live in the current tab and enter the note only while the associated phrase is selected. Short treatment labels display the original full phrase in the draft.

The standalone version excludes unused general anesthesia location and preoperative fields, appointment-first patient lookup, AI enhancement, chart posting, and saved shortcut history. The UI and runtime were written separately and use the exported phrase data.

Future integrations would require separate design and review for authentication, authorization, transport, PHI handling, failure modes, auditability, and clinical approval. This snapshot does not provide those controls.
