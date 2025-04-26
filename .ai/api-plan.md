# REST API Plan

## 1. Resources

- **Users**: Represents user accounts using data from the `users` table.
- **Flashcards**: Represents both manually created and AI-generated flashcards, based on the `flashcards` table. Each flashcard record now includes a `generation_id` field that references the `id` of an AI Generation Session (if applicable).
- **AI Generation Sessions**: Represents sessions of AI flashcard generation including metrics (duration, count of flashcards generated, accepted, rejected) from the `ai_generation_sessions` table.
- **Generation Error Logs**: Represents logs of errors encountered during AI generation from the `generation_error_log` table.

## 2. Endpoints

### 2.1 Authentication

- **POST /api/auth/register**
  - **Description**: Register a new user.
  - **Request Body (JSON)**:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```
  - **Response (JSON)**: Returns the created user's details (e.g., id, username, email).
  - **Success Codes**: 201 Created
  - **Error Codes**: 400 (validation errors), 409 (duplicate username/email)

- **POST /api/auth/login**
  - **Description**: Authenticate a user and issue a JWT token.
  - **Request Body (JSON)**:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - **Response (JSON)**:
    ```json
    {
      "token": "JWT token string",
      "user": {
        "id": "uuid",
        "username": "string",
        "email": "string"
      }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 (invalid input), 401 (authentication failed)

### 2.2 Flashcards

- **GET /api/flashcards**
  - **Description**: Retrieve a paginated list of flashcards for the authenticated user. Supports filtering by status and sorting.
  - **Query Parameters** (optional):
    - `page`: number (default 1)
    - `limit`: number (default 10)
    - `status`: string (e.g., pending, accepted-original, accepted-edited, rejected)
    - `sortBy`: field name (e.g., created_at)
    - `order`: asc or desc
  - **Response (JSON)**:
    ```json
    {
      "flashcards": [
        {
          "id": "uuid",
          "generation_id": "uuid",  // References the associated AI generation session, if any
          "front": "string",
          "back": "string",
          "status": "string",
          "source": "string",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 100 }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401 (unauthorized), 500 (server error)

- **GET /api/flashcards/:id**
  - **Description**: Retrieve details of a single flashcard.
  - **Response (JSON)**: Returns the flashcard object including the `generation_id` field.
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 404 (not found)

- **POST /api/flashcards**
  - **Description**: Create a new flashcard manually.
  - **Request Body (JSON)**:
    ```json
    {
      "front": "string (max 220 characters)",
      "back": "string (max 500 characters)",
      "generation_id": "uuid or null"  // Optional: set if the flashcard is linked to an AI generation session; otherwise, null for manual creation.
    }
    ```
  - **Response (JSON)**: Returns the created flashcard object including its `generation_id`.
  - **Success Codes**: 201 Created
  - **Error Codes**: 400 (validation error), 401 (unauthorized)

- **PUT /api/flashcards/:id**
  - **Description**: Update an existing flashcard (manual edit). Only the `front` and `back` fields are allowed, while the `generation_id` remains unchanged.
  - **Request Body (JSON)**:
    ```json
    {
      "front": "string (max 220 characters)",
      "back": "string (max 500 characters)"
    }
    ```
  - **Response (JSON)**: Returns the updated flashcard object including the existing `generation_id`.
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 (validation error), 401, 404 (not found)

- **DELETE /api/flashcards/:id**
  - **Description**: Delete a flashcard.
  - **Response (JSON)**:
    ```json
    { "message": "Flashcard deleted successfully." }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 404

- **PATCH /api/flashcards/:id/status**
  - **Description**: Update the status of a flashcard (e.g., to accept or reject an AI-generated flashcard).
  - **Request Body (JSON)**:
    ```json
    {
      "action": "accept" | "reject"
    }
    ```
  - **Response (JSON)**: Returns the flashcard object with its updated status while preserving the `generation_id`.
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 (invalid action), 401, 404

### 2.3 AI Generation

- **POST /api/ai/generate**
  - **Description**: Generate flashcards using AI from submitted text. The input text must be between 1000 and 10000 characters and will be segmented into thematically consistent portions. All generated flashcards will include the `generation_id` linking them to the current AI generation session.
  - **Request Body (JSON)**:
    ```json
    {
      "text": "string (1000-10000 characters)"
    }
    ```
  - **Response (JSON)**:
    ```json
    {
      "flashcards": [
        {
          "id": "uuid",
          "generation_id": "uuid",  // References the AI generation session
          "front": "string",
          "back": "string",
          "status": "pending",
          "source": "ai",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "sessionMetrics": {
        "generation_duration": "integer",
        "generated": "integer",
        "accepted_original": "integer",
        "accepted_edited": "integer",
        "rejected": "integer"
      }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 (invalid input), 401, 500 (AI generation failure)

### 2.4 AI Generation Sessions (Optional / Admin)

- **GET /api/ai/sessions**
  - **Description**: Retrieve a paginated list of AI generation sessions for the authenticated user (or for administrative use).
  - **Query Parameters**:
    - `page`: number
    - `limit`: number
  - **Response (JSON)**:
    ```json
    {
      "sessions": [
        {
          "id": "uuid",
          "generation_duration": "integer",
          "generated": "integer",
          "accepted_original": "integer",
          "accepted_edited": "integer",
          "rejected": "integer",
          "created_at": "timestamp"
        }
      ],
      "pagination": { "page": 1, "limit": 10, "total": 50 }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 500

### 2.5 Generation Error Logs (Internal)

- (Optional) **GET /api/ai/errors**
  - **Description**: Retrieve AI generation error logs for internal or administrative purposes.
  - **Response (JSON)**: Returns a list of error log entries.
  - **Access**: Restricted
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 500

## 3. Authentication and Authorization

- **Mechanism**: JSON Web Token (JWT) based authentication.
- **Public Endpoints**: `/api/auth/register` and `/api/auth/login` do not require a token.
- **Protected Endpoints**: All other endpoints require a valid JWT provided in the request header:
  ```
  Authorization: Bearer <JWT token>
  ```
- **Database Security**: Row Level Security (RLS) is enforced at the database level, ensuring that users can access only their own records.

## 4. Validation and Business Logic

### 4.1 Validation

- **Flashcards**:
  - `front`: Maximum 220 characters.
  - `back`: Maximum 500 characters.
  - The `generation_id` field must either be a valid UUID referencing an existing AI generation session or null.
  - Exceeding the text limits results in a 400 error with a message indicating the allowed character count.

- **AI Generation Input**:
  - The input text must be between 1000 and 10000 characters; otherwise, a 400 error is returned.

### 4.2 Business Logic

1. **User Management**:
   - Enforces unique constraints for username and email during registration.
   - Provides authentication, leading to issuance of a JWT for subsequent requests.

2. **Flashcards Management**:
   - Manual creation and editing endpoints enforce validation on text lengths.
   - Dedicated endpoint (`PATCH /api/flashcards/:id/status`) handles accept and reject actions, updating the flashcard's status as follows:
     - **Accept**: May set status to either `accepted-original` or `accepted-edited` based on whether the flashcard is newly generated or edited.
     - **Reject**: Sets status to `rejected`.
   - List retrieval endpoints include pagination, filtering by status, and sorting to manage large datasets.

3. **AI Flashcard Generation**:
   - Processes large text input by segmenting it thematically (as required in PRD).
   - Generates flashcards that adhere to validation rules (front up to 220 chars, back up to 500 chars).
   - Logs generation metrics (duration, counts) in the `ai_generation_sessions` table.
   - In case of failure during AI generation, errors are logged into the `generation_error_log` table.

### 4.3 Performance and Security Considerations

- **Pagination, Filtering, and Sorting**: Implemented on list endpoints to manage performance with large data sets.
- **Rate Limiting**: Recommended especially for the AI generation endpoint to mitigate abuse and high computational load.
- **Secure Communication**: All endpoints must be served over HTTPS.
- **Error Handling**: Detailed error responses (with appropriate HTTP status codes such as 400, 401, 404, 500) are provided for client troubleshooting.
- **Data Integrity and Validation**: Both at the API level and the database level (through enforced constraints and RLS).

---

*Assumptions*: 
- The API design assumes use of modern web technologies (Astro, React, TypeScript, Tailwind, Shadcn/ui) and a Supabase/PostgreSQL backend.
- AI generation logic is encapsulated in a separate service which will be invoked by the `/api/ai/generate` endpoint.
- Endpoints related to admin functions (AI sessions and error logs) are restricted to authorized personnel. 