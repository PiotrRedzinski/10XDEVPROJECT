# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Contains user credentials and profile information.
- **Flashcards**: Corresponds to the `flashcards` table. Stores flashcards created manually or generated via AI, with fields for front text (max 220 chars) and back text (max 500 chars), status, and source.
- **AI Generation Sessions**: Corresponds to the `ai_generation_sessions` table. Logs AI flashcard generation metadata (duration, count of generated flashcards, accepted and rejected counts).
- **Generation Error Logs**: Corresponds to the `generation_error_log` table. Logs errors related to AI flashcard generation. (This resource is mainly for internal debugging and analytics.)

## 2. Endpoints

### 2.1 Authentication

- **POST /api/auth/register**
  - **Description**: Registers a new user account.
  - **Request Body (JSON)**:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```
  - **Response (JSON)**: Newly created user object with id, username, and other profile details.
  - **Success Codes**: 201 Created
  - **Error Codes**: 400 (validation errors), 409 (username/email conflict)

- **POST /api/auth/login**
  - **Description**: Authenticates a user and returns a JWT token.
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
      "user": { "id": "uuid", "username": "string", "email": "string" }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 (invalid data), 401 (authentication failed)

### 2.2 Flashcards

- **GET /api/flashcards**
  - **Description**: Retrieves a paginated list of flashcards associated with the authenticated user. Supports filtering by status and sorting.
  - **Query Parameters** (optional):
    - `page` (number)
    - `limit` (number)
    - `status` (string; e.g., pending, accepted-original, accepted-edited, rejected)
    - `sortBy` (field name)
    - `order` (asc/desc)
  - **Response (JSON)**:
    ```json
    {
      "flashcards": [
        {
          "id": "uuid",
          "front": "string",
          "back": "string",
          "status": "string",
          "source": "string",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100
      }
    }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401 (unauthorized), 500 (server error)

- **GET /api/flashcards/:id**
  - **Description**: Retrieves the details of a single flashcard.
  - **Response (JSON)**: Flashcard object as shown above.
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 404 (not found)

- **POST /api/flashcards**
  - **Description**: Manually creates a new flashcard.
  - **Request Body (JSON)**:
    ```json
    {
      "front": "string (max 220 characters)",
      "back": "string (max 500 characters)"
    }
    ```
  - **Response (JSON)**: Created flashcard object.
  - **Success Codes**: 201 Created
  - **Error Codes**: 400 (validation error), 401

- **PUT /api/flashcards/:id**
  - **Description**: Updates an existing flashcard (manual edit). Only the `front` and `back` fields are allowed.
  - **Request Body (JSON)**:
    ```json
    {
      "front": "string (max 220 characters)",
      "back": "string (max 500 characters)"
    }
    ```
  - **Response (JSON)**: Updated flashcard object.
  - **Success Codes**: 200 OK
  - **Error Codes**: 400, 401, 404

- **DELETE /api/flashcards/:id**
  - **Description**: Deletes a flashcard.
  - **Response (JSON)**:
    ```json
    { "message": "Flashcard deleted successfully." }
    ```
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 404

- **PATCH /api/flashcards/:id/status**
  - **Description**: Updates the status of a flashcard for business actions such as accept or reject.
  - **Request Body (JSON)**:
    ```json
    {
      "action": "accept" | "reject"
    }
    ```
  - **Response (JSON)**: Updated flashcard object reflecting the new status (e.g., accepted-original / accepted-edited for accept, rejected for reject).
  - **Success Codes**: 200 OK
  - **Error Codes**: 400 (invalid action), 401, 404

### 2.3 AI Generation

- **POST /api/ai/generate**
  - **Description**: Generates flashcards using AI from the provided text input. The text must be between 1000 and 10000 characters and will be segmented into thematically consistent portions.
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
        { "front": "string", "back": "string", "status": "pending", ... }
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
  - **Description**: Retrieves a list of AI generation sessions for the authenticated user or for administrative purposes.
  - **Query Parameters**: Pagination options (page, limit).
  - **Response (JSON)**: A list of session objects with metrics and creation timestamps.
  - **Success Codes**: 200 OK
  - **Error Codes**: 401, 500

### 2.5 Generation Error Logs (Internal)

- (Optional) **GET /api/ai/errors**
  - **Description**: Retrieves error logs related to AI generation. Intended for internal or admin use only.
  - **Response (JSON)**: A list of error log entries.
  - **Access**: Restricted, not exposed publicly.

## 3. Authentication and Authorization

- **Mechanism**: JWT-based authentication.
- **Public Endpoints**: `/api/auth/register` and `/api/auth/login` do not require a token.
- **Protected Endpoints**: All other endpoints require a valid JWT token included in the header as follows:
  ```
  Authorization: Bearer <JWT token>
  ```
- **Database Security**: Row-level security (RLS) is enforced on all tables to ensure that users can only access and modify their own data.

## 4. Validation and Business Logic

### 4.1 Validation

- **Flashcards**:
  - `front` field: Maximum 220 characters.
  - `back` field: Maximum 500 characters.
  - If these limits are exceeded, the API returns a 400 error with a message specifying the allowed number of characters.

- **AI Generation Input**:
  - The provided text must be between 1000 and 10000 characters. Otherwise, a 400 error is returned.

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