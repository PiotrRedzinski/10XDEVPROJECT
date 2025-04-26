-- Add input_text_length column to ai_generation_sessions table
ALTER TABLE public.ai_generation_sessions
ADD COLUMN input_text_length integer NOT NULL DEFAULT 0;

-- Add comment to the column
COMMENT ON COLUMN public.ai_generation_sessions.input_text_length IS 'Length of the input text used for generation'; 