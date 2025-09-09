# Tasks: Automated Email Classification

**Input**: Design documents from `/specs/001-an-automated-system/`

## Phase 3.1: Setup
- [x] T001 [P] Create the directory structure for the backend service at `backend/` including `src/` and `tests/`.
- [x] T002 Initialize a Node.js project in `backend/` with `npm init -y` and create a `tsconfig.json` file.
- [x] T003 [P] Install required dependencies: `express`, `prisma`, `@prisma/client`, `mysql2`, `@huggingface/inference`, `bullmq`.
- [x] T004 [P] Install development dependencies: `typescript`, `@types/node`, `@types/express`, `jest`, `ts-jest`, `supertest`, `eslint`, `prettier`.
- [x] T005 [P] Configure ESLint and Prettier in `backend/`.
- [x] T006 [P] Create a `docker-compose.yml` file for MySQL, Redis, and backend services.
- [x] T007 Create the Prisma schema at `backend/prisma/schema.prisma` based on `data-model.md`.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
- [x] T008 [P] Write a contract test for `POST /webhooks/sendgrid` in `backend/tests/contract/sendgrid.test.ts`.
- [x] T009 [P] Write contract tests for `GET` and `POST /categories` in `backend/tests/contract/categories.test.ts`.
- [ ] T010 [P] Write contract tests for `PUT` and `DELETE /categories/{id}` in `backend/tests/contract/categories.test.ts`.
- [ ] T011 [P] Write a contract test for `GET /emails` in `backend/tests/contract/emails.test.ts`.
- [ ] T012 [P] Write an integration test in `backend/tests/integration/email-processing.test.ts` to verify that an email received from the SendGrid webhook is processed and saved to the database.
- [ ] T013 [P] Write an integration test in `backend/tests/integration/category-management.test.ts` to verify CRUD operations for categories.

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T014 Run `npx prisma migrate dev --name init` to create the initial database schema.
- [ ] T015 [P] Implement the Category service (`backend/src/services/categoryService.ts`) with methods for CRUD operations.
- [ ] T016 [P] Implement the Email service (`backend/src/services/emailService.ts`) with methods for creating and retrieving emails.
- [x] T017 Implement the API endpoints for category management in `backend/src/api/categoryRoutes.ts`.
- [ ] T018 Implement the API endpoint for listing emails in `backend/src/api/emailRoutes.ts`.
- [x] T019 Implement the SendGrid webhook endpoint in `backend/src/api/sendgridRoutes.ts`.

## Phase 3.4: Integration
- [ ] T020 Integrate Prisma Client in the Category and Email services.
- [x] T021 Implement the queue producer in the SendGrid webhook endpoint to add incoming emails to a BullMQ queue.
- [x] T022 Implement a queue worker (`backend/src/workers/emailProcessor.ts`) that processes emails from the queue, calls the Hugging Face API for classification, and saves the result.
- [ ] T023 Implement error handling and logging middleware in the Express application.

## Phase 3.5: Polish
- [ ] T024 [P] Add unit tests for the Category and Email services.
- [ ] T025 [P] Add validation to the API endpoints.
- [ ] T026 [P] Update the `README.md` with instructions on how to run the application and tests.

## Dependencies
- Setup tasks (T001-T007) must be completed first.
- Test tasks (T008-T013) must be completed before implementation tasks (T014-T019).
- T014 (migration) must be completed before T015 and T016.
- T015 and T016 must be completed before T017, T018, T019.

## Parallel Example
```
# Launch T008-T013 together:
Task: "Write a contract test for POST /webhooks/sendgrid in backend/tests/contract/sendgrid.test.ts"
Task: "Write contract tests for GET and POST /categories in backend/tests/contract/categories.test.ts"
Task: "Write contract tests for PUT and DELETE /categories/{id} in backend/tests/contract/categories.test.ts"
Task: "Write a contract test for GET /emails in backend/tests/contract/emails.test.ts"
Task: "Write an integration test in backend/tests/integration/email-processing.test.ts to verify that an email received from the SendGrid webhook is processed and saved to the database."
Task: "Write an integration test in backend/tests/integration/category-management.test.ts to verify CRUD operations for categories."
```