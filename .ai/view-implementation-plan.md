# API Endpoint Implementation Plan: POST /api/ai/generate

## 1. Przegląd punktu końcowego
Endpoint przeznaczony do generowania fiszek przy użyciu AI na podstawie dużego bloku tekstu. Endpoint waliduje długość tekstu, wywołuje zewnętrzną usługę AI w celu wygenerowania fiszek oraz zapisuje wyniki w bazie danych (tabele flashcards oraz ai_generation_sessions). W przypadku wystąpienia błędów generacji, szczegóły są logowane do tabeli generation_error_log.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** /api/ai/generate
- **Parametry:**
  - **Wymagane:** Brak parametrów zapytania (wszystkie dane przekazywane w treści żądania).
  - **Opcjonalne:** Brak parametrów opcjonalnych.
- **Request Body:**
  - Struktura JSON:
  ```json
  {
    "text": "string (1000-10000 znaków)"
  }
  ```
- **Walidacja:**
  - Sprawdzenie, czy długość tekstu mieści się w przedziale 1000 - 10000 znaków.

## 3. Wykorzystywane typy
- `AIGenerateRequestDTO`: reprezentuje dane wejściowe i zawiera pole `text`.
- `AIGenerateResponseDTO`: struktura odpowiedzi, zawierająca:
  - `flashcards`: tablica obiektów typu `FlashcardDTO`
  - `sessionMetrics`: obiekt typu `AIGenerationSessionMetricsDTO`
- Dodatkowe typy:
  - `FlashcardDTO`
  - `AIGenerationSessionMetricsDTO`
  - `AISessionDTO` (dla sesji generacji)

## 4. Szczegóły odpowiedzi
- **Odpowiedź powodzenia (HTTP 200 OK):**
  - Struktura:
  ```json
  {
    "flashcards": [ { ...FlashcardDTO... } ],
    "sessionMetrics": {
       "generation_duration": number,
       "generated": number,
       "accepted_original": number,
       "accepted_edited": number,
       "rejected": number
    }
  }
  ```
- **Kody statusu:**
  - 200 OK: Prawidłowa odpowiedź.
  - 400 Bad Request: Błędne dane wejściowe (np. tekst nie spełnia wymagań długości).
  - 401 Unauthorized: Brak lub niepoprawny token JWT.
  - 500 Internal Server Error: Błąd podczas przetwarzania (np. nieudana integracja usługi AI).

## 5. Przepływ danych
1. Klient wysyła żądanie POST z JSON zawierającym pole `text`.
2. Serwer:
   - Autoryzuje żądanie (weryfikuje token JWT wykorzystując `supabase` z `context.locals`).
   - Waliduje dane wejściowe przy użyciu schematu Zod.
3. Po pomyślnej walidacji:
   - Wywołuje zewnętrzną usługę AI (np. OpenRouter.ai) do wygenerowania fiszek.
   - Mierzy czas generacji oraz zbiera metryki generacji.
4. Zapis do bazy danych:
   - Tworzy nową sesję w tabeli `ai_generation_sessions` z odpowiednimi metrykami.
   - Wykonuje operację bulk insert wygenerowanych fiszek w tabeli `flashcards` z przypisaniem identyfikatora sesji (`generation_id`).
5. W przypadku błędu w generacji:
   - Loguje szczegóły błędu do tabeli `generation_error_log`.
6. Serwer zwraca odpowiedź zawierającą wygenerowane fiszki i metryki sesji.

## 6. Względy bezpieczeństwa
- **Autoryzacja:**
  - Endpoint wymaga poprawnego tokena JWT przekazywanego w nagłówku `Authorization`.
  - Weryfikacja użytkownika poprzez `supabase` z `context.locals` i przestrzeganie polityk Row Level Security (RLS).
- **Walidacja danych:**
  - Użycie Zod do walidacji struktury oraz długości pola `text`.
- **Ograniczenia:**
  - Implementacja rate limiting aby zapobiec nadużyciom, szczególnie dla operacji wymagających wysokich zasobów.
- **Logowanie błędów:**
  - Błędy są logowane do tabeli `generation_error_log` przy jednoczesnym zachowaniu bezpieczeństwa danych.

## 7. Obsługa błędów
- **400 Bad Request:**
  - Tekst nie spełnia wymagań długościowych lub niepoprawna struktura żądania.
- **401 Unauthorized:**
  - Brak tokena lub token jest niepoprawny.
- **500 Internal Server Error:**
  - Błąd integracji z usługą AI.
  - Błąd zapisu do bazy danych lub inne wewnętrzne wyjątki.
- **Mechanizmy:**
  - Użycie bloków try-catch, szczegółowe logowanie błędów i odpowiednie zwracanie kodów statusu.

## 8. Rozważania dotyczące wydajności
- Usługa AI może być zasobożerna – rozważyć asynchroniczne przetwarzanie lub kolejkowanie żądań.
- Optymalizacja operacji na bazie danych, w tym bulk insert dla fiszek.
- Monitorowanie metryk wydajności, w tym czasu generacji i obciążenia serwera.
- Rozważenie cache'owania wyników dla podobnych zapytań, jeśli to możliwe.

## 9. Etapy wdrożenia
1. Utworzenie schematu walidacji danych wejściowych z użyciem Zod (dla `AIGenerateRequestDTO`).
2. Implementacja API endpoint w pliku `/src/pages/api/ai/generate.ts`:
   - Ustawienie `export const prerender = false`.
   - Autoryzacja żądania przy użyciu JWT oraz weryfikacja użytkownika z `context.locals`.
3. Walidacja danych wejściowych i odrzucenie żądania przy niepoprawnej strukturze lub długości tekstu (odpowiedź 400).
4. Integracja z zewnętrzną usługą AI:
   - Wywołanie API usługi AI (np. OpenRouter.ai) do generacji fiszek.
   - Pomiar czasu generacji i zbieranie metryk.
5. Zapis wyników do bazy danych:
   - Utworzenie nowej sesji w tabeli `ai_generation_sessions`.
   - Wykonanie bulk insert wygenerowanych fiszek do tabeli `flashcards` z przypisaniem `generation_id`.
6. Obsługa błędów i logowanie:
   - Implementacja mechanizmu try-catch, logowanie błędów do tabeli `generation_error_log`.
   - Zwracanie odpowiednich kodów statusu w przypadku błędów (400, 401, 500).
7. Testy jednostkowe i integracyjne:
   - Testy walidacji (np. za krótki lub za długi tekst).
   - Testy autoryzacji (sprawdzenie tokena JWT i RLS).
   - Testy poprawnej integracji z usługą AI.
8. Przeprowadzenie code review, wdrożenie na środowisku staging i monitorowanie wydajności. 