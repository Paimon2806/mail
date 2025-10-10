# Quickstart: Attachment Analyser

This document provides instructions on how to run the Attachment Analyser service and use its API.

## Prerequisites

- Node.js and npm installed
- The main application is running

## Running the Service

The Attachment Analyser service is integrated into the main application. To run it, simply start the main server:

```bash
npm install
npm start
```

The server will start, and the analyser endpoint will be available.

## Using the API

The service exposes a single endpoint for analysing files.

- **Endpoint**: `POST /rest/analyse`
- **Request Type**: `multipart/form-data`
- **Form Field**: `attachment` (this should contain the file)

### Example using cURL

Here is an example of how to call the API using `curl` from your terminal. Replace `path/to/your/file.pdf` with the actual path to the file you want to analyse.

```bash
curl -X POST -F "attachment=@/path/to/your/file.pdf" http://localhost:8080/rest/analyse
```

### Supported File Types

- `application/pdf` (PDF)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- `text/plain` (TXT)
- `image/png` (PNG)
- `image/jpeg` (JPG)

### Success Response

A successful request will return a `200 OK` status with a JSON object containing the extracted text:

```json
{
  "text": "This is the extracted text from the document, truncated to 500 characters..."
}
```

### Error Responses

- `400 Bad Request`: If no file is attached to the request.
- `500 Internal Server Error`: If the file is of an unsupported type, is corrupted, or is password-protected.
