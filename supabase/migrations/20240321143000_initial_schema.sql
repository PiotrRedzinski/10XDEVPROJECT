-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for the flashcard application
-- Tables: flashcards, ai_generation_sessions, generation_error_log
-- Author: System
-- Date: 2024-03-21

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create custom types for status and source enums
create type flashcard_status as enum ('pending', 'accepted-original', 'accepted-edited', 'rejected');
create type flashcard_source as enum ('self', 'ai');

-- Create flashcards table
create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id uuid,
    front varchar(220) not null,
    back varchar(500) not null,
    status flashcard_status not null,
    source flashcard_source not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create ai_generation_sessions table
create table ai_generation_sessions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_duration integer not null,
    generated integer not null,
    accepted_original integer not null,
    accepted_edited integer not null,
    rejected integer not null,
    created_at timestamptz default now()
);

-- Create generation_error_log table
create table generation_error_log (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front text,
    back text,
    error_reason varchar(255) not null,
    created_at timestamptz default now()
);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards updated_at
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
alter table flashcards enable row level security;
alter table ai_generation_sessions enable row level security;
alter table generation_error_log enable row level security;

-- Flashcards RLS Policies
-- Authenticated users can only see their own flashcards
create policy "Users can view their own flashcards"
    on flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own flashcards"
    on flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- AI Generation Sessions RLS Policies
create policy "Users can view their own generation sessions"
    on ai_generation_sessions for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own generation sessions"
    on ai_generation_sessions for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own generation sessions"
    on ai_generation_sessions for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own generation sessions"
    on ai_generation_sessions for delete
    to authenticated
    using (auth.uid() = user_id);

-- Generation Error Log RLS Policies
create policy "Users can view their own error logs"
    on generation_error_log for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own error logs"
    on generation_error_log for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Error logs are immutable, so no update policy needed
create policy "Users can delete their own error logs"
    on generation_error_log for delete
    to authenticated
    using (auth.uid() = user_id);

-- Add foreign key constraint for generation_id after tables are created
alter table flashcards
    add constraint flashcards_generation_id_fkey
    foreign key (generation_id)
    references ai_generation_sessions(id)
    on delete set null;

-- Create indexes for foreign keys
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index ai_generation_sessions_user_id_idx on ai_generation_sessions(user_id);
create index generation_error_log_user_id_idx on generation_error_log(user_id); 