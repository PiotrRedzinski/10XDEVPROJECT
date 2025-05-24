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
    // Load system prompt lazily to reduce initial bundle size
    get SYSTEM_PROMPT() {
      return `You are a helpful AI assistant that generates flashcards from provided text.
Your task is to create concise and effective flashcards that help users learn the material.

Rules for generating flashcards:
1. Create clear, focused questions for the front
2. Provide concise, accurate answers for the back
3. Break complex topics into smaller, manageable cards
4. Use simple, direct language
5. Avoid overly long or complex cards
6. Focus on key concepts and important details
7. Generate between 5-20 cards depending on content length

Format your response as a JSON array of objects with 'front' and 'back' properties.
Example:
[
  {
    "front": "What is photosynthesis?",
    "back": "The process by which plants convert light energy into chemical energy to produce glucose from CO2 and water"
  }
]`;
    },
  },
} as const;
