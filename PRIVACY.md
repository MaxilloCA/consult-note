# Privacy boundary

This standalone manual builder keeps drafts in the active page rather than a clinical record store. Use the synthetic example for demonstrations, screenshots, and public review. For clinical work, use an appropriately managed workstation and follow your organization’s privacy requirements for browser content, clipboard handling, and transfer into the authorized patient record.

The app does not use localStorage, sessionStorage, cookies, IndexedDB, analytics, external services, AI, patient databases, or a history file. It performs one same-origin request for the static phrase catalog. The bundled server has no request body handling, database, or access logging and saves no notes.

Drafts and preview edits remain in the active browser tab's memory. Clear resets form and preview. Reloading discards the app state; a browser or operating system may still preserve content in session restore, memory, screenshots, clipboard history, extensions, or other software. This is not a secure-erasure guarantee. Copying intentionally moves text to the operating-system clipboard.

The synthetic example contains an explicit synthetic label and no name, date of birth, patient number, real encounter, or imported patient record. There is no patient import or export facility.
