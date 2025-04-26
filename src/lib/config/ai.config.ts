export const AI_CONFIG = {
  OPENAI: {
    API_URL: "https://api.openai.com/v1/chat/completions",
    MODEL: "gpt-3.5-turbo",
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
  },
  RATE_LIMIT: {
    MAX_REQUESTS_PER_HOUR: 10,
    WINDOW_MS: 60 * 60 * 1000, // 1 hour in milliseconds
  },
  GENERATION: {
    MAX_FLASHCARDS: 20,
    SYSTEM_PROMPT: `You are an AI tutor tasked with creating educational flashcards from provided text.
Generate concise, clear flashcards that test key concepts and knowledge.
Each flashcard should have:
- A clear, focused question or prompt on the front
- A concise but complete answer on the back
- No duplicate content across cards
Format as JSON array of objects with 'front' and 'back' properties.
Limit front to 220 chars and back to 500 chars.`,
  },
} as const;
