# SOP: Vaultify Security & Authentication

## Context
Vaultify is a static site hosted on GitHub Pages. To ensure only specified family members can access the documents, we will implement a two-tier security model.

## Security Tier 1: Access Control
Since GitHub Pages is public, we will use **Google OAuth 2.0 (GSI - Google Services Identity)** to restrict rendering.
- **Authorized Emails:**
  - patrosln07@gmail.com
  - chitishreedevi1977@gmail.com
  - sahilsync07@gmail.com
  - suryainsingham2@gmail.com

## Security Tier 2: File Privacy
- The Google Drive folder is currently shared as "Anyone with link".
- **Action:** Set the folder to "Restricted" and share it explicitly with the 4 Gmail addresses above.
- The web app will use the `webViewLink` to open files in GDrive's native UI, inheriting GDrive's robust permission system.

## Implementation Steps
1. **Google Cloud Console:** Create a Project and OAuth 2.0 Client ID for a "Web Application".
2. **Authorized JavaScript Origins:** Add `http://localhost:5173` and `https://<your-username>.github.io`.
3. **Frontend Guard:** Wrap the dashboard in a React context that checks the user's email against the whitelist.
