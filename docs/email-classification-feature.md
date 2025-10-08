# Email Classification Feature Documentation

This document provides a comprehensive overview of the Zero-Shot Email Classification feature, how it works, the changes made to the project, and how to use it.

## 1. Feature Overview

The Email Classification feature provides a REST API endpoint to classify the content of an email into one of several candidate categories. It uses the `facebook/bart-large-mnli` zero-shot classification model hosted on the Hugging Face Inference API.

The primary function is to analyze a piece of text (the email body) and determine which user-provided label (e.g., "Invoice", "Spam", "Shipping Update") is the most relevant. The API returns only the single label with the highest probability score.

## 2. API Endpoint

- **Method:** `POST`
- **Path:** `/rest/email-classification`
- **Authentication:** Firebase Bearer Token required.

### Request Body

The endpoint expects a JSON body with the following structure:

```json
{
  "emailContent": "string",
  "candidateLabels": ["string", "string", ...]
}
```

- `emailContent` (string, required, min 10 chars): The body of the email you want to classify.
- `candidateLabels` (string[], required, min 1 item): An array of potential categories for the email.

**Example Request:**
```json
{
  "emailContent": "Dear Customer, your invoice for order #A-54321 is now available. The total amount due is $59.99. Thank you for your business.",
  "candidateLabels": ["Spam", "Marketing", "Invoice", "Shipping Update"]
}
```

### Response Body

The API returns the single most likely label and its probability score.

**Example Response:**
```json
{
    "data": [
        {
            "label": "Invoice",
            "score": 0.9095694422721863
        }
    ],
    "message": "Email classified successfully"
}
```

## 3. How to Use (cURL Example)

To use the endpoint, you need a valid Firebase authentication token.

```bash
curl -X POST http://localhost:8083/rest/email-classification \ 
-H "Content-Type: application/json" \ 
-H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \ 
-d '{
  "emailContent": "Your package will be delivered tomorrow.",
  "candidateLabels": ["Invoice", "Spam", "Shipping Update"]
}'
```

## 4. Project Changes

Here is a summary of all the files that were created or modified to implement this feature:

- **`docs/email-classification-feature.md`**: This documentation file.
- **`src/controllers/rest/email-classification.controller.ts`**: A new controller to handle incoming API requests for the feature.
- **`src/services/email-classification.service.ts`**: A new service that contains the core logic, including the call to the Hugging Face API and the logic to determine the highest-scoring label.
- **`src/schemas/EmailClassificationDto.ts`**: A new schema file defining the Data Transfer Objects (DTOs) for the request and response, including input validation rules.
- **`src/controllers/rest/index.ts`**: Updated to register the new `EmailClassificationController`.
- **`env.example`**: Updated to include the necessary environment variables for the Hugging Face API.
- **`plan.md` & `tasks.md`**: Project planning and task-tracking documents were updated to reflect the new feature and its implementation details.
- **`jest.config.js`**: A new configuration file for the Jest testing framework.
- **`package.json` & `package-lock.json`**: Updated with new testing dependencies (`jest`, `@types/jest`, `ts-jest`).
- **`src/services/email-classification.service.spec.ts`**: A new unit test file for the classification service.

## 5. Setup and Configuration

To enable this feature, you must configure the following environment variables in your `.env.local` file:

- **`HUGGING_FACE_API_URL`**: The URL for the inference API.
  - *Default*: `https://api-inference.huggingface.co/models/facebook/bart-large-mnli`
- **`HUGGING_FACE_API_KEY`**: Your secret API token from your Hugging Face account.

```env
HUGGING_FACE_API_URL=https://api-inference.huggingface.co/models/facebook/bart-large-mnli
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
```

## 6. Testing

A unit test has been created for the `EmailClassificationService` to ensure its logic is correct.

To run the test, use the following command:

```bash
npm test src/services/email-classification.service.spec.ts
```
