# Implementation Plan: Attachment Analyser

**Branch**: `001-create-attactment-analyser` | **Date**: 2025-10-08 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `specs/001-create-attactment-analyser/spec.md`

## Summary

This document outlines the implementation plan for the Attachment Analyser, a new microservice responsible for converting various attachment types (PDF, DOCX, TXT, PNG, JPG) into plain text. The service will expose a single API endpoint to accept file uploads. It will use a suite of specialized Node.js libraries (`pdf-parse`, `mammoth`, `tesseract.js`) to handle the conversions. The extracted text will be truncated to a 500-character limit and returned in the API response, ready for consumption by the `email_classifier` service.

## Technical Context

**Language/Version**: Node.js (TypeScript)
**Primary Dependencies**:

- `pdf-parse` for PDF text extraction.
- `mammoth` for DOCX text extraction.
- `tesseract.js` for OCR (image to text).
- `express` for the API.
- `multer` for handling file uploads.
  **Storage**: N/A (Files are processed in-memory)
  **Testing**: Jest
  **Target Platform**: Linux server (Docker container)
  **Project Type**: Web application (backend microservice)
  **Performance Goals**: Process 100 concurrent requests with an average response time of under 5 seconds.
  **Constraints**: Character limit of 500 characters for the output text.
  **Scale/Scope**: The tool will be used internally by the `email_classifier` service.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Maintain Project Structure:** The plan adds a new service without altering the existing project structure, adhering to the principle.
- **II. Incremental and Careful Changes:** The feature is a self-contained microservice, allowing for isolated development and deployment.
- **III. Simplicity:** The solution uses well-defined, single-purpose libraries to create a simple and maintainable service.
- **IV. Version and Compatibility:** The service will be versioned and its dependencies managed via `package.json`.

## Project Structure

### Documentation (this feature)

```
specs/001-create-attactment-analyser/
├── plan.md              # This file
├── research.md          # Research on parsing libraries
├── data-model.md        # Data model for the service
├── quickstart.md        # Instructions to run the service
├── contracts/           # API contract
│   └── openapi.json
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

**Structure Decision**: This will be a new microservice within the existing backend. The new files will be located in `src/services/analyser`, `src/controllers/rest/analyser.controller.ts`, and `src/routes/analyser.routes.ts`.

```
src/
├── services/
│   └── analyser/
│       ├── index.ts
│       ├── analyser.service.ts
│       └── parsers/
│           ├── pdf.parser.ts
│           ├── docx.parser.ts
│           └── image.parser.ts
├── controllers/
│   └── rest/
│       └── analyser.controller.ts
└── routes/
    └── analyser.routes.ts

tests/
├── integration/
│   └── analyser.integration.test.ts
└── unit/
    └── analyser.service.test.ts
```

## Complexity Tracking

No constitutional violations detected.
