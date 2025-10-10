# Tasks: Attachment Analyser

**Input**: Design documents from `specs/001-create-attactment-analyser/`

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 [P] Install required npm packages: `pdf-parse`, `mammoth`, `tesseract.js`, `express`, `multer`, and their corresponding `@types` packages.

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T002 Create the basic directory structure for the new service in `src/services/analyser` and `src/controllers/rest`.
- [x] T003 Create the initial `analyser.routes.ts` file in `src/routes/` to define the `/api/v1/analyse` endpoint.
- [x] T004 Create the initial `analyser.controller.ts` file in `src/controllers/rest/` with a placeholder for the analysis logic.
- [x] T005 Create the initial `analyser.service.ts` file in `src/services/analyser/` with a primary `analyse` method.
- [x] T006 Configure the Express app to use the new analyser routes and `multer` for file uploads.

## Phase 3: User Story 1 - Convert common file types (Priority: P1) 🎯 MVP

**Goal**: Implement text extraction for PDF, DOCX, and TXT files.
**Independent Test**: Upload a file of each type and verify the returned text is correct.

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement the PDF parser in `src/services/analyser/parsers/pdf.parser.ts` using `pdf-parse`.
- [x] T008 [P] [US1] Implement the DOCX parser in `src/services/analyser/parsers/docx.parser.ts` using `mammoth`.
- [x] T009 [US1] Implement a simple parser for TXT files (reading the file content directly).
- [x] T010 [US1] Update `analyser.service.ts` to detect the file type and delegate to the appropriate parser (PDF, DOCX, TXT).
- [x] T011 [US1] Implement the 500-character truncation logic in `analyser.service.ts`.

### Tests for User Story 1

- [x] T012 [P] [US1] Write unit tests for the PDF parser in `tests/unit/analyser.service.test.ts`.
- [x] T013 [P] [US1] Write unit tests for the DOCX parser in `tests/unit/analyser.service.test.ts`.

## Phase 4: User Story 2 - Convert images to plain text (Priority: P2)

**Goal**: Implement text extraction from images (PNG, JPG) using OCR.
**Independent Test**: Upload an image containing text and verify the returned text is correct.

### Implementation for User Story 2

- [x] T014 [P] [US2] Implement the image parser in `src/services/analyser/parsers/image.parser.ts` using `tesseract.js`.
- [x] T015 [US2] Update `analyser.service.ts` to delegate to the image parser for PNG and JPG files.

### Tests for User Story 2

- [x] T016 [P] [US2] Write unit tests for the image parser in `tests/unit/analyser.service.test.ts`.

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T017 Implement robust error handling in `analyser.service.ts` for unsupported file types, password-protected files, and corrupted files.
- [x] T018 Write integration tests in `tests/integration/analyser.integration.test.ts` that upload each supported file type to the `/api/v1/analyse` endpoint and verify the response.
- [x] T019 Create `quickstart.md` with instructions on how to build and run the service, and how to use the API.
- [x] T020 Code cleanup and refactoring.

## Dependencies & Execution Order

- **Phase 1 & 2** must be completed before starting any user story.
- **Phase 3 (User Story 1)** can be completed and delivered as the MVP.
- **Phase 4 (User Story 2)** can begin after Phase 2 is complete. It can run in parallel with Phase 3 if desired.
- **Phase 5** should be completed after all user stories are implemented.
