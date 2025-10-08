# Quickstart for Automated Email Classification API

This guide provides instructions to set up and run the project for local development.

## Prerequisites

- Node.js (v18 or later)
- npm (or yarn/pnpm)
- Docker and Docker Compose
- A Hugging Face account and an API token with read permissions.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Environment Variables**:
    Create a `.env` file in the root of the project and add the following variables:

    ```
    DATABASE_URL="mysql://user:password@localhost:3306/email_classifier"
    HUGGING_FACE_API_TOKEN="your_hugging_face_token"
    SENDGRID_WEBHOOK_SECRET="a_strong_secret_for_webhook_verification"
    ```

3.  **Start the Database**:
    A `docker-compose.yml` file is provided to easily run a MySQL database.

    ```bash
    docker-compose up -d
    ```

4.  **Run Database Migrations**:
    Prisma will set up the database schema based on `prisma/schema.prisma`.

    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Running Tests

```bash
npm test
```

This will run the Jest test suite, including contract tests, integration tests, and unit tests.
