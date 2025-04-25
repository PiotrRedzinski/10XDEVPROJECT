/*
Database Schema Plan
====================

1. Tables
--------

### users
- id: UUID PRIMARY KEY (auto-generated, e.g., using uuid_generate_v4())
- username: VARCHAR NOT NULL UNIQUE
- email: VARCHAR NOT NULL UNIQUE
- hashed_password: VARCHAR NOT NULL UNIQUE
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()

### flashcards
- id: UUID PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- front: VARCHAR(220) NOT NULL
- back: VARCHAR(500) NOT NULL
- status: ENUM('pending', 'accepted-original', 'accepted-edited', 'rejected') NOT NULL
- source: ENUM('self', 'ai') NOT NULL
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now() -- Automatically updated via trigger

### ai_generation_sessions
- id: UUID PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- generation_duration: INTEGER NOT NULL -- Represents generation time
- generated: INTEGER NOT NULL
- accepted_original: INTEGER NOT NULL
- accepted_edited: INTEGER NOT NULL
- rejected: INTEGER NOT NULL
- created_at: timestamptz DEFAULT now()

### generation_error_log
- id: UUID PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- front: TEXT
- back: TEXT
- error_reason: VARCHAR(255) NOT NULL
- created_at: timestamptz DEFAULT now()

2. Relationships
----------------
- One-to-Many: A user can have many flashcards (flashcards.user_id -> users.id).
- One-to-Many: A user can have many AI generation sessions (ai_generation_sessions.user_id -> users.id).
- One-to-Many: A user can have many generation error logs (generation_error_log.user_id -> users.id).

3. Indexes
----------
- Primary key indexes on the id columns of all tables.
- No additional indexes on user_id, status, or created_at as per requirements.

4. PostgreSQL Row Level Security (RLS)
--------------------------------------
- RLS policies will be enabled on all tables (users, flashcards, ai_generation_sessions, generation_error_log) to enforce restrictions on SELECT, INSERT, UPDATE, and DELETE operations, ensuring that users can only access rows associated with their account.

5. Additional Considerations
----------------------------
- Automatic update of flashcards.updated_at will be implemented using a trigger.
- ENUM types for flashcards.status and flashcards.source should be defined in the database prior to table creation.
- Ensure the UUID generation extension (e.g., uuid-ossp) is enabled if using functions like uuid_generate_v4().
*/ 