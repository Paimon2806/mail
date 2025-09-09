# Mail Sorting Application

This is an automated email classification system that receives emails from SendGrid, uses a zero-shot AI model to classify them against user-managed categories, and organizes them.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [Real-World Integration and Usage](#real-world-integration-and-usage)

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js and npm**: Version 18 or later.
-   **Docker Desktop**: Required to run MySQL and Redis services.
-   **Hugging Face Account**: Create an account and generate an API token with "read" permissions.
-   **SendGrid Account**: Set up an inbound parse webhook and create a webhook verification key (secret).

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd mail_sorting
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the `backend/` directory with the following variables, replacing placeholders with your actual credentials:

    ```
    DATABASE_URL="mysql://user:password@localhost:3306/email_classifier"
    HUGGING_FACE_API_TOKEN="your_hugging_face_token"
    SENDGRID_WEBHOOK_SECRET="your_sendgrid_webhook_secret"
    ```
    *Note: The `DATABASE_URL` uses credentials from `docker-compose.yml`. Update both files if you change them.*

3.  **Start Docker Services**:
    Navigate to the root of the project and start the MySQL and Redis containers:
    ```bash
    docker-compose up -d
    ```

4.  **Install Backend Dependencies**:
    Navigate to the `backend/` directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```

5.  **Run Prisma Migrations**:
    From the `backend/` directory, apply the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

From the `backend/` directory:

-   **Development Mode (with hot-reloading)**:
    ```bash
    npm run dev
    ```
-   **Start Worker (Development Mode)**:
    ```bash
    npm run dev:worker
    ```
-   **Production Mode (build and start)**:
    ```bash
    npm run build
    npm start
    ```
-   **Start Worker (Production Mode)**:
    ```bash
    npm run start:worker
    ```

## Running Tests

From the `backend/` directory:

-   **Run all tests**:
    ```bash
    npm test
    ```

## API Endpoints

The backend API exposes the following endpoints:

-   **Categories**:
    -   `GET /categories`: Retrieve all categories.
    -   `POST /categories`: Create a new category.
    -   `PUT /categories/:id`: Update an existing category.
    -   `DELETE /categories/:id`: Delete a category.

-   **Emails**:
    -   `GET /emails`: Retrieve all classified emails.

-   **SendGrid Webhook**:
    -   `POST /webhooks/sendgrid`: Endpoint for SendGrid inbound parse webhooks.

## Real-World Integration and Usage

This project provides a robust backend for automated email classification. Here's how you can integrate and utilize it in a real-world scenario:

### 1. Deployment Considerations

For production environments, you'll need to deploy the backend API and worker services. Consider the following:

-   **Container Orchestration**: Utilize platforms like Kubernetes, Docker Swarm, or Amazon ECS/EKS to manage and scale your Docker containers.
-   **Cloud Platforms**: Deploy on cloud providers such as AWS (EC2, Lambda, Fargate), Google Cloud Platform (Compute Engine, Cloud Run), or Azure (App Service, Azure Container Instances).
-   **Environment Variables**: Ensure all sensitive information (API tokens, database credentials) are managed securely using environment variables or secret management services provided by your cloud provider.

### 2. SendGrid Production Setup

To receive emails in a production environment, you'll need to configure SendGrid's Inbound Parse Webhook to point to your deployed application's public URL (not `ngrok`).

-   **Publicly Accessible URL**: Your deployed application must have a stable, publicly accessible URL (e.g., `https://your-domain.com/webhooks/sendgrid`).
-   **Webhook Security**: Configure and use the SendGrid webhook verification key (secret) to ensure that incoming requests are genuinely from SendGrid. This is configured via the `SENDGRID_WEBHOOK_SECRET` environment variable.
-   **DNS Configuration**: Set up appropriate MX records and CNAME records in your domain's DNS settings to route incoming emails to SendGrid for parsing.

### 3. Utilizing Classified Emails

The classified email data stored in your database can be a powerful asset. Here are ways to leverage it:

-   **Frontend Application**: Develop a user-friendly web or desktop application that consumes the API endpoints to:
    -   Display classified emails in an organized manner (e.g., by category).
    -   Allow users to manage categories (create, update, delete).
    -   Provide search and filtering capabilities for emails.
    -   Offer a user interface for reviewing and reclassifying emails if needed.

-   **Integration with Other Systems**: Connect the classified data with your existing workflows:
    -   **CRM/Helpdesk**: Automatically create or update tickets/leads in your CRM based on email content and classification.
    -   **Task Management**: Generate tasks in project management tools (e.g., Jira, Trello) for specific email categories.
    -   **Notifications**: Send real-time notifications (e.g., Slack, email alerts) for high-priority or urgent email classifications.
    -   **Data Warehousing/Analytics**: Export classified email data to a data warehouse for business intelligence and trend analysis.

-   **Automation and Workflow Triggering**: Implement automated actions based on email classification:
    -   **Auto-reply**: Send automated responses for common inquiries.
    -   **Archiving**: Automatically move emails to specific archives or folders.
    -   **Prioritization**: Assign priority levels to emails based on their category.

### 4. Scalability and Reliability

-   **Scaling**: As your email volume grows, you can scale the API and worker services independently to handle increased load.
-   **Monitoring and Alerting**: Implement robust monitoring for your application, database, and queue to detect and respond to issues proactively.
-   **Database Management**: Regularly back up your database and consider replication for high availability.

By following these guidelines, you can effectively integrate and extend this mail sorting application to streamline your email management and automate various business processes.