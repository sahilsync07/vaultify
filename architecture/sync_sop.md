# SOP: Automated Document Synchronization

## Context
We need to keep `public/documents.json` in sync with the Google Drive folder without manually editing JSON.

## Process
1. **Tool:** `tools/fetch_gdrive.py`
2. **Inputs:** 
   - `GDRIVE_API_KEY` (or Service Account)
   - `FOLDER_ID` (`1mFQNTvAbdfCRGBuFHu7XLrSvdlYSFqz-`)
3. **Logic:**
   - Query GDrive API for all files in `FOLDER_ID`.
   - Map fields to the `DocumentManifest` schema defined in `gemini.md`.
   - Write output to `public/documents.json`.

## Automation (Trigger)
- We will add this script execution to the GitHub Action workflow.
- **Flow:** Actions starts -> Runs Python Sync -> Commits JSON changes (optional) -> Builds Vite -> Deploys.
