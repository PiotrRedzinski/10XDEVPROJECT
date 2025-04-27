# API Endpoint Implementation Plan: Flashcards Management

## 1. Przegląd punktu końcowego
Endpointy dotyczące zarządzania flashcards umożliwiają użytkownikom wykonywanie operacji CRUD (tworzenie, odczyt, aktualizacja, usuwanie) na fiszkach. Dodatkowo, dedykowany endpoint pozwala na aktualizację statusu fiszki (np. akceptacja lub odrzucenie) – co jest kluczowe przy obsłudze zarówno ręcznie tworzonych, jak i generowanych przez AI fiszek. Całość operacji jest zabezpieczona poprzez autoryzację oraz polityki RLS w bazie danych.

## 2. Szczegóły żądania
- **GET /api/flashcards**
  - **Opis**: Pobranie listy fiszek użytkownika z paginacją, filtrowaniem po statusie oraz sortowaniem.
  - **Parametry zapytania (opcjonalne)**:
    - `page` (number, domyślnie 1)
    - `limit` (number, domyślnie 10)
    - `status` (string, np. `pending`, `accepted-original`, `accepted-edited`, `rejected`)
    - `sortBy` (nazwa pola, np. `created_at`)
    - `order` (`asc` lub `desc`)
- **GET /api/flashcards/:id**
  - **Opis**: Pobranie szczegółów pojedynczej fiszki.
  - **Parametry**: Identyfikator fiszki w URL.
- **POST /api/flashcards**
  - **Opis**: Manualne utworzenie nowej fiszki.
  - **Body** (JSON):
    ```json
    {
      "front": "string (max 220 znaków)",
      "back": "string (max 500 znaków)",
      "generation_id": "uuid lub null"
    }
    ```
- **PUT /api/flashcards/:id**
  - **Opis**: Aktualizacja istniejącej fiszki (edycja ręczna).
  - **Body** (JSON):
    ```json
    {
      "front": "string (max 220 znaków)",
      "back": "string (max 500 znaków)"
    }
    ```
- **DELETE /api/flashcards/:id**
  - **Opis**: Usunięcie fiszki.
- **PATCH /api/flashcards/:id/status**
  - **Opis**: Aktualizacja statusu fiszki (np. akceptacja lub odrzucenie).
  - **Body** (JSON):
    ```json
    {
      "action": "accept" | "reject"
    }
    ```

## 3. Wykorzystywane typy
- **FlashcardDTO** – reprezentuje rekord z tabeli `flashcards`:
  - Pola: `id`, `generation_id`, `front`, `back`, `status`, `source`, `created_at`, `updated_at`
- **CreateFlashcardCommand** – używane przy tworzeniu fiszki (POST).
- **UpdateFlashcardCommand** – używane przy aktualizacji treści fiszki (PUT).
- **UpdateFlashcardStatusCommand** – używane przy aktualizacji statusu (PATCH).
- **PaginationDTO** – definiuje strukturę paginacji dla listy wyników.

## 4. Szczegóły odpowiedzi
- **GET /api/flashcards**
  - Odpowiedź:
    ```json
    {
      "flashcards": [ { FlashcardDTO, ... } ],
      "pagination": { "page": 1, "limit": 10, "total": 100 }
    }
    ```
  - Kody: 200 OK, 401 Unauthorized, 500 Internal Server Error
- **GET /api/flashcards/:id**
  - Odpowiedź: pojedynczy obiekt `FlashcardDTO`
  - Kody: 200 OK, 401 Unauthorized, 404 Not Found
- **POST /api/flashcards**
  - Odpowiedź: utworzony obiekt `FlashcardDTO`
  - Kody: 201 Created, 400 Bad Request (np. przekroczenie limitu znaków), 401 Unauthorized
- **PUT /api/flashcards/:id**
  - Odpowiedź: zaktualizowany obiekt `FlashcardDTO`
  - Kody: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found
- **DELETE /api/flashcards/:id**
  - Odpowiedź:
    ```json
    { "message": "Flashcard deleted successfully." }
    ```
  - Kody: 200 OK, 401 Unauthorized, 404 Not Found
- **PATCH /api/flashcards/:id/status**
  - Odpowiedź: obiekt `FlashcardDTO` z zaktualizowanym statusem
  - Kody: 200 OK, 400 Bad Request (np. nieprawidłowa akcja), 401 Unauthorized, 404 Not Found

## 5. Przepływ danych
1. Klient wysyła żądanie HTTP z odpowiednimi parametrami lub body oraz tokenem autoryzacyjnym.
2. Middleware odpowiada za weryfikację tokena i osadzenie `user_id` w kontekście żądania.
3. Kontroler odbiera żądanie i deleguje logikę do dedykowanego serwisu (np. `flashcardsService`) znajdującego się w `./src/lib/services`.
4. Serwis:
   - Waliduje dane wejściowe (np. przy użyciu Zod z uwzględnieniem maksymalnej długości tekstu i formatu UUID).
   - Wykonuje operację na bazie danych (zapytania typu SELECT, INSERT, UPDATE, DELETE) przy uwzględnieniu polityk RLS, by operacje były ograniczone do zasobów danego użytkownika.
   - Zwraca odpowiednie dane lub informację o błędzie.
5. Kontroler zwraca sformatowaną odpowiedź JSON do klienta.

## 6. Względy bezpieczeństwa
- **Autentykacja i Autoryzacja**: Każde żądanie musi zawierać ważny token JWT; polityki RLS (Row Level Security) w bazie danych wymagają, aby operacje na rekordach były wykonywane tylko przez właściciela.
- **Walidacja danych**: Użycie narzędzi takich jak Zod w celu wymuszenia poprawnego formatu danych wejściowych (np. długość pól tekstowych, format UUID).
- **Ochrona przed atakami**: Zapobieganie SQL Injection przez stosowanie parametrów w zapytaniach oraz korzystanie z bezpiecznych metod ORM.
- **Logowanie błędów**: Krytyczne błędy (np. błędy przy operacjach na bazie) będą logowane, a niektóre przypadki mogą być rejestrowane w tabeli `generation_error_log` (jeśli mają związek z operacjami AI).

## 7. Obsługa błędów
- **400 Bad Request**: Występuje przy błędnej walidacji danych wejściowych (np. przekroczenie limitu znaków, nieprawidłowy format UUID).
- **401 Unauthorized**: Brak lub nieważny token autoryzacyjny.
- **404 Not Found**: Fizycznie brak rekordu w bazie (np. nie znaleziono fiszki o podanym identyfikatorze).
- **500 Internal Server Error**: Błąd po stronie serwera, taki jak problemy z połączeniem do bazy danych lub nieprzewidziane błędy logiki.
- Każdy błąd powinien być logowany wraz z kluczowymi informacjami umożliwiającymi diagnozę problemu.

## 8. Rozważania dotyczące wydajności
- **Paginated Queries**: Użycie limitów i offsetów lub kursorów pozwoli na optymalne pobieranie danych przy dużych zbiorach.
- **Indeksowanie**: Upewnienie się, że kolumny używane do sortowania (np. `created_at`) oraz filtrowania (np. `status`) są odpowiednio indeksowane.
- **Optymalizacja zapytań**: Analiza zapytań SQL przez plan wykonania, szczególnie w operacjach filtrowania i sortowania.
- **Caching**: Rozważenie zastosowania mechanizmów cache’owania dla endpointu GET przy bardzo dużym obciążeniu.

## 9. Etapy wdrożenia
1. **Struktura projektu**:
   - Utworzenie plików endpointów w katalogu `./src/pages/api/flashcards`.
2. **Middleware autoryzacji**:
   - Implementacja weryfikacji tokena oraz integracja z lokalnym kontekstem (np. `context.locals.user_id`).
3. **Serwis logiki biznesowej**:
   - Utworzenie/rozszerzenie serwisu `flashcardsService` w `./src/lib/services` w celu obsługi operacji CRUD.
   - Wyodrębnienie logiki walidacji (przy użyciu Zod).
4. **Implementacja endpointów**:
   - GET /api/flashcards: Pobieranie listy z paginacją, filtrowaniem i sortowaniem.
   - GET /api/flashcards/:id: Pobranie szczegółów pojedynczej fiszki.
   - POST /api/flashcards: Walidacja danych wejściowych i utworzenie rekordu.
   - PUT /api/flashcards/:id: Aktualizacja pól `front` i `back` z zachowaniem `generation_id`.
   - DELETE /api/flashcards/:id: Usunięcie rekordu.
   - PATCH /api/flashcards/:id/status: Aktualizacja statusu fiszki zgodnie z przekazaną akcją.
5. **Testowanie**:
   - Jednostkowe i integracyjne testy endpointów.
   - Testy walidacji danych oraz scenariuszy błędów.
6. **Wdrożenie i monitoring**:
   - Wdrożenie na środowisko testowe i monitorowanie logów.
   - Przeprowadzenie testów wydajnościowych.
7. **Dokumentacja**:
   - Uaktualnienie dokumentacji API oraz przekazanie wskazówek dla zespołu deweloperskiego.
