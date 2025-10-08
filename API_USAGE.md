# Backend API Usage Guide

This guide provides step-by-step instructions on how to interact with the Mail Sorting Application's backend API.

## Base URL

The API is served by the backend application, which typically runs on `http://localhost:3000` in development mode.

## Authentication

Currently, there is no authentication implemented for these API endpoints. All endpoints are publicly accessible.

## Categories API

The Categories API allows you to manage the hierarchical categories used for email classification.

### 1. Create a New Category (POST /categories)

To create a new category, send a `POST` request to `/categories` with a JSON body containing the `name` of the category and an optional `parentId` if it's a subcategory.

**Request:**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Work"}' http://localhost:3000/categories
```

**Expected Response (201 Created):**

```json
{
  "id": 1,
  "name": "Work",
  "parentId": null
}
```

**Create a subcategory:**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "Projects", "parentId": 1}' http://localhost:3000/categories
```

### 2. Get All Categories (GET /categories)

To retrieve all existing categories, send a `GET` request to `/categories`.

**Request:**

```bash
curl http://localhost:3000/categories
```

**Expected Response (200 OK):**

```json
[
  {
    "id": 1,
    "name": "Work",
    "parentId": null
  },
  {
    "id": 2,
    "name": "Projects",
    "parentId": 1
  }
]
```

### 3. Update a Category (PUT /categories/:id)

To update an existing category, send a `PUT` request to `/categories/:id` with a JSON body containing the fields to update (`name` and/or `parentId`).

**Request:**

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Work-Related"}' http://localhost:3000/categories/1
```

**Expected Response (200 OK):**

```json
{
  "id": 1,
  "name": "Work-Related",
  "parentId": null
}
```

### 4. Delete a Category (DELETE /categories/:id)

To delete a category, send a `DELETE` request to `/categories/:id`.

**Request:**

```bash
curl -X DELETE http://localhost:3000/categories/2
```

**Expected Response (204 No Content):**

(No content in the response body)

## Emails API

The Emails API allows you to retrieve classified emails.

### 1. Get All Emails (GET /emails)

To retrieve all classified emails, send a `GET` request to `/emails`.

**Request:**

```bash
curl http://localhost:3000/emails
```

**Expected Response (200 OK):**

```json
[
  {
    "id": 1,
    "sendgridMessageId": "some-message-id",
    "subject": "Your Classified Email",
    "from": "sender@example.com",
    "body": "This is the content of the email.",
    "receivedAt": "2025-09-09T10:00:00.000Z",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Work",
      "parentId": null
    }
  }
]
```
*(Note: The actual content will depend on emails processed by the SendGrid webhook.)*

## SendGrid Webhook

This endpoint is designed to receive inbound parse webhooks from SendGrid. You typically configure SendGrid to send email data to this URL.

### 1. Receive Inbound Email (POST /webhooks/sendgrid)

To simulate an inbound email from SendGrid, send a `POST` request to `/webhooks/sendgrid` with the email data.

**Request:**

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "messageId": "unique-email-id-123",
  "subject": "Important Project Update",
  "from": "project-manager@example.com",
  "text": "Hi team, the project deadline has been extended to next Friday. Please adjust your schedules accordingly."
}' http://localhost:3000/webhooks/sendgrid
```

**Expected Response (200 OK):**

```json
{
  "message": "Email received and queued for processing."
}
```
*(Note: The email will be processed asynchronously by the worker, classified, and then saved to the database.)*
