# External Tasks for Project Setup

This file lists the tasks that need to be completed manually outside of the codebase to ensure the project runs correctly.

## 1. Install Required Software

- **Node.js and npm**: Ensure you have Node.js (v18 or later) and npm installed. You can download them from [https://nodejs.org/](https://nodejs.org/).
- **Docker**: Install Docker Desktop to run the MySQL and Redis services. You can download it from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

## 2. Set Up External Services

- **Hugging Face Account**:
  - Create an account at [https://huggingface.co/](https://huggingface.co/).
  - Go to your settings and create a new API token with "read" permissions.

- **SendGrid Account**:
  - Create an account at [https://sendgrid.com/](https://sendgrid.com/).
  - Set up an inbound parse webhook. You can find instructions in the SendGrid documentation.
  - When you create the webhook, SendGrid will provide you with a webhook URL. You will need to point this to your application's public URL. For local development, you can use a tool like `ngrok` to expose your local server to the internet.
  - Create a webhook verification key (secret).

## 3. Configure Environment Variables

- Create a file named `.env` in the `backend/` directory.
- Add the following variables to the `.env` file, replacing the placeholder values with your actual credentials:

  ```
  DATABASE_URL="mysql://user:password@localhost:3306/email_classifier"
  HUGGING_FACE_API_TOKEN="your_hugging_face_token"
  SENDGRID_WEBHOOK_SECRET="your_sendgrid_webhook_secret"
  ```

  *Note: The `DATABASE_URL` uses the credentials from the `docker-compose.yml` file. You can change them if you wish, but make sure to update both files.*

## 4. Install Project Dependencies

- Open a terminal in the `backend/` directory and run the following command to install all the dependencies listed in `package.json`:

  ```bash
  npm install
  ```

## 5. Start the Database and Run Migrations

- Open a terminal in the root of the project and run the following command to start the MySQL and Redis containers:

  ```bash
  docker-compose up -d
  ```

- Once the containers are running, run the following command in the `backend/` directory to create the database schema:

  ```bash
  npx prisma migrate dev --name init
  ```

After completing these steps, the project will be ready for you to start the application and run the tests.
