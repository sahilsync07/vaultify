# Project Constitution: Vaultify

## Data Schemas

### DocumentManifest (`documents.json`)
```json
{
  "lastUpdated": "ISO-8601 Timestamp",
  "version": "string",
  "categories": ["string"],
  "items": [
    {
      "id": "string (GDrive File ID)",
      "name": "string (Filename)",
      "extension": "string (pdf, jpg, etc)",
      "category": "string",
      "tags": ["string"],
      "webViewLink": "string (Link to view in GDrive)",
      "thumbnailLink": "string (Icon/Thumbnail)",
      "uploadedBy": "string (Family Member Name)",
      "size": "number (bytes)"
    }
  ]
}
```

## Behavioral Rules
1. **B.L.A.S.T. Protocol Compliance**: Always follow Blueprint, Link, Architect, Stylize, Trigger phases.
2. **A.N.T. Architecture**: Separate Logic into SOPs (`architecture/`), Decision Making, and Tools (`tools/`).
3. **Data-First**: Define schemas before coding tools.

## Architectural Invariants
- Frontend: Vite + TS + Tailwind.
- Tools: Python scripts in `tools/`.
- Intermediates: Stored in `.tmp/`.

## Maintenance Log
- **2026-02-07**: System Pilot initialized.
