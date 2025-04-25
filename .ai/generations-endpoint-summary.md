# Endpoint generowania fiszek AI

## URL
- Frontend: `/flashcards/generate`
- API Endpoint: `POST /api/ai/generate`

## Endpoint API

### POST /api/ai/generate
**Cel**: Generowanie fiszek przy użyciu AI na podstawie dostarczonego tekstu

**Body**:
```typescript
{
  text: string; // Tekst źródłowy (1000-10000 znaków)
}
```

**Odpowiedź**:
```typescript
{
  flashcards: FlashcardDTO[];
  sessionMetrics: {
    generation_duration: number;
    generated: number;
    accepted_original: number;
    accepted_edited: number;
    rejected: number;
  }
}
```

**Kody odpowiedzi**:
- 200: Generacja zakończona sukcesem
- 400: Błędne dane wejściowe (np. tekst poza zakresem 1000-10000 znaków)
- 401: Nieautoryzowany dostęp
- 500: Błąd wewnętrzny serwera

## Uwagi
1. Tekst wejściowy musi mieć długość między 1000 a 10000 znaków
2. Endpoint wymaga autoryzacji (token JWT)
3. Generacja jest procesem asynchronicznym
4. Metryki sesji są zapisywane w tabeli `ai_generation_sessions`
5. Błędy są logowane do tabeli `generation_error_log` 