# API Endpoint Implementation Plan: POST /api/ai/generate

## 1. Przegląd punktu końcowego
Endpoint odpowiedzialny za generowanie fiszek przy użyciu AI. Przyjmuje długi tekst (1000-10000 znaków), waliduje dane wejściowe, dzieli tekst na segmenty, generuje fiszki oraz zapisuje metryki sesji. W przypadku wystąpienia błędów, loguje je do tabeli `generation_error_log`.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **URL**: /api/ai/generate
- **Parametry**:
  - **Wymagane**: Request Body w formacie JSON z kluczem `text` (string, długość 1000-10000 znaków)
  - **Opcjonalne**: Brak

**Przykład Request Body**:
```json
{
  "text": "Przykładowy długi tekst spełniający wymagania..."
}
```

## 3. Wykorzystywane typy
- **Command Model**: `GenerateFlashcardsCommand` (pole: `text: string`)
- **DTO**: `AIGenerationResultDTO` (zawiera `flashcards: FlashcardDTO[]` oraz `sessionMetrics: AIGenerationSessionMetricsDTO`)
- Pozostałe używane typy: `FlashcardDTO`, `AIGenerationSessionMetricsDTO`, `GenerationErrorLogDTO` (do logowania błędów)

## 4. Szczegóły odpowiedzi
- **Sukces**:
  - **Kod**: 200 OK
  - **Response Body**:
    - `flashcards`: Lista wygenerowanych fiszek
    - `sessionMetrics`: Obiekt metryk sesji zawierający m.in. `generation_duration`, `generated`, `accepted_original`, `accepted_edited`, `rejected`

- **Błędy**:
  - **400**: Błędne dane wejściowe (np. tekst poza zakresem 1000-10000 znaków)
  - **401**: Nieautoryzowany dostęp (brak lub nieważny token JWT)
  - **500**: Błąd wewnętrzny serwera (problemy podczas wywołania AI lub zapisu do bazy)

## 5. Przepływ danych
1. Odbiór żądania z tokenem JWT w nagłówku (`Authorization: Bearer <token>`).
2. Weryfikacja autoryzacji poprzez Supabase i middleware zgodnie z zasadami RLS.
3. Parsowanie i walidacja request body przy użyciu Zod (pole `text` musi mieć 1000-10000 znaków).
4. Przekazanie poprawnych danych do warstwy serwisowej (`aiGenerationService` w `src/lib/services`).
5. Procesowanie:
   - Segmentacja tekstu na tematyczne części.
   - Generacja fiszek przy użyciu AI.
   - Zapis metryk sesji do tabeli `ai_generation_sessions`.
6. W przypadku wystąpienia błędu:
   - Logowanie szczegółów błędu do tabeli `generation_error_log`.
   - Zwrot statusu 500 wraz z komunikatem błędu.
7. W przypadku sukcesu, zwrócenie wygenerowanych danych z odpowiednim kodem 200.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie**: Wymagany poprawny token JWT przesyłany w nagłówku.
- **Autoryzacja**: Operacje są ograniczone do zasobów użytkownika dzięki implementacji RLS w Supabase.
- **Walidacja danych wejściowych**: Użycie Zod dla `GenerateFlashcardsCommand` zapewnia poprawność danych.
- **Komunikacja**: Wymagane HTTPS i bezpieczne przechowywanie tokena.
- **Ochrona przed nadużyciami**: Rozważenie implementacji mechanizmu rate limiting dla ochrony przed nadmiernym obciążeniem.

## 7. Obsługa błędów
- **400**: Błąd walidacji - szczegółowy komunikat o błędnych danych wejściowych.
- **401**: Błąd autoryzacji - brak lub nieważny token JWT.
- **500**: Błąd wewnętrzny - problemy z generacją AI lub zapisem do bazy; należy logować błędy do tabeli `generation_error_log` dla celów diagnostycznych.

## 8. Rozważania dotyczące wydajności
- Optymalizacja procesu segmentacji dużych tekstów.
- Monitorowanie zużycia zasobów przez wywołania AI, w tym testy obciążeniowe.
- Stosowanie indeksów w bazie danych dla przyspieszenia operacji zapisu i odczytu metryk sesji.

## 9. Etapy wdrożenia
1. Definicja schematu walidacji dla `GenerateFlashcardsCommand` z wykorzystaniem Zod.
2. Implementacja serwisu `aiGenerationService` w `src/lib/services`, który:
   - Dzieli tekst na segmenty tematyczne.
   - Wywołuje moduł AI do generacji fiszek.
   - Zapisuje metryki sesji do tabeli `ai_generation_sessions`.
3. Implementacja endpointu w `src/pages/api/ai/generate.ts`:
   - Weryfikuje token JWT i autoryzację.
   - Parsuje i waliduje request body.
   - Wywołuje `aiGenerationService` i obsługuje jego odpowiedź.
   - W przypadku błędów, loguje je do `generation_error_log` i zwraca odpowiedni kod statusu.
4. Dokumentacja endpointu oraz przekazanie szczegółowych wytycznych zespołowi programistów. 