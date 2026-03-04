---
name: Error Tracking Management
description: Guidelines on how to record and maintain the error validation log used during the La-Minks build.
---

# Error Tracking Management

When encountering bugs, environment issues, or difficult logic flaws, developers must document the occurrence in `docs/errorLog.md` for historical tracking.

## Purpose
Tracking and managing resolutions allows for comprehensive knowledge transfer if issues resurface later in the development cycle or post-launch.

## Format rules for docs/errorLog.md
When an error occurs and is resolved, insert a row into the markdown table using the following columns:

- **Date**: YYYY-MM-DD
- **Environment**: Backend / Frontend / General Setup
- **Component/Route**: `File path` or `API Route`
- **Error Description**: Concise explanation of the problem or error trace.
- **Solution/Resolution**: The action taken to successfully resolve the issue.

Example process: "Found standardizing bug in Paystack integration -> Write to `docs/errorLog.md` -> Commit fix."
