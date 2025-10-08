# Research for Automated Email Classification

## Testing Framework for Node.js/TypeScript

*   **Decision**: Use Jest.
*   **Rationale**: Jest is a popular, well-documented, and feature-rich testing framework for TypeScript projects. It includes a test runner, assertion library, and mocking capabilities out of the box.
*   **Alternatives considered**: Mocha with Chai, Vitest.

## Performance, Constraints, and Scale

*   **Decision**: Start with baseline goals and refine as needed.
    *   **Performance Goals**: Handle at least 10 requests per second.
    *   **Constraints**: p99 latency under 500ms.
    *   **Scale/Scope**: Designed for a single user/team to manage their email workflow.
*   **Rationale**: The initial requirements do not specify high-performance needs. These are reasonable starting points for a typical web service.
*   **Alternatives considered**: Defining more stringent goals would require more specific non-functional requirements.

## Unclassified Email Handling

*   **Decision**: As per user, fallback to an 'unclassified' category.
*   **Rationale**: This provides a clear and simple way to handle emails that don't match any defined category.

## High Volume Email Handling

*   **Decision**: Implement a request queue.
*   **Rationale**: A queue (e.g., using BullMQ with Redis) will allow the system to process incoming webhooks at a controlled pace, preventing overload of the AI model and database.
*   **Alternatives considered**: Rate limiting at the API gateway, which is also a good practice but doesn't handle bursts as gracefully.

## SendGrid Integration Failure

*   **Decision**: Implement a retry mechanism with exponential backoff for webhook processing. Log failures for manual inspection.
*   **Rationale**: This makes the system more resilient to transient network issues.
*   **Alternatives considered**: Immediately failing and notifying, which could lead to data loss if the issue is temporary.

## Email Organization Method

*   **Decision**: Add a `categoryId` to the `Email` model.
*   **Rationale**: This is the most straightforward way to associate an email with a category. The user can then filter or group emails by this ID.
*   **Alternatives considered**: Moving emails to different folders (more complex, depends on the email storage system which is not fully defined).
