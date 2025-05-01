Doskonale. Analiza dostarczonego kodu i struktury projektu pozwala mi na stworzenie kompleksowego planu testów dla aplikacji "Flashcards Generator". Jako doświadczony inżynier QA, skupię się na zapewnieniu jakości, funkcjonalności, niezawodności, wydajności i bezpieczeństwa aplikacji.

**Plan Testów: Aplikacja Flashcards Generator**

**1. Wprowadzenie**

*   **Cel dokumentu:** Opisanie strategii, zakresu, zasobów i harmonogramu testów dla projektu "Flashcards Generator". Celem jest zapewnienie, że aplikacja spełnia wymagania funkcjonalne i niefunkcjonalne, jest stabilna, użyteczna i bezpieczna dla użytkowników końcowych.
*   **Opis projektu:** Aplikacja webowa zbudowana w oparciu o Astro, React, TypeScript i Supabase, umożliwiająca użytkownikom tworzenie, zarządzanie i przeglądanie fiszek (flashcards). Kluczową funkcjonalnością jest możliwość generowania fiszek na podstawie dostarczonego tekstu przy użyciu AI (OpenAI). Aplikacja wykorzystuje Tailwind CSS do stylizacji i Shadcn/ui (lub podobne komponenty Radix UI) do budowy interfejsu. Autentykacja jest obsługiwana przez Supabase Auth.
*   **Odbiorcy:** Zespół deweloperski, Product Owner, Project Manager, Zespół QA.

**2. Zakres Testów**

*   **Funkcjonalności w zakresie:**
    *   Autentykacja Użytkownika (Logowanie, Wylogowanie, Ochrona routingu)
    *   Rejestracja Użytkownika (*Uwaga: Obecnie tylko frontend, backend TBD - testy ograniczone*)
    *   Reset Hasła (*Uwaga: Obecnie tylko frontend, backend TBD - testy ograniczone*)
    *   Ręczne Zarządzanie Fiszkami (CRUD): Tworzenie, Odczyt (lista z paginacją, pojedyncza fiszka), Aktualizacja, Usuwanie.
    *   Generowanie Fiszek przez AI: Wprowadzanie tekstu, Walidacja długości tekstu, Wywołanie API AI, Wyświetlanie wygenerowanych fiszek, Akceptacja/Odrzucenie/Edycja pojedynczych wygenerowanych fiszek, Akceptacja/Odrzucenie wszystkich wygenerowanych fiszek.
    *   Interfejs Użytkownika (UI): Layout, Nawigacja, Formularze, Komponenty UI (karty, dialogi, przyciski, itp.), Komunikaty (sukcesu, błędu), Paginacja.
    *   API Backendowe: Wszystkie endpointy w `src/pages/api/` (autentykacja, walidacja, logika biznesowa, obsługa błędów).
    *   Obsługa Błędów: Zarówno na frontendzie (komunikaty dla użytkownika) jak i na backendzie (logowanie, odpowiedzi API).
    *   Rate Limiting dla generowania AI.
    *   Caching dla generowania AI.
    *   Logowanie zdarzeń systemowych i błędów.
*   **Funkcjonalności poza zakresem:**
    *   Testowanie samego modelu OpenAI (zakładamy, że działa zgodnie z jego specyfikacją).
    *   Testowanie infrastruktury Supabase (zakładamy jej poprawność działania).
    *   Backendowa implementacja Rejestracji i Resetu Hasła (do czasu jej dostarczenia).
    *   Testy obciążeniowe na dużą skalę (chyba że zostaną specjalnie zlecone).
    *   Testy penetracyjne (chyba że zostaną specjalnie zlecone).

**3. Strategia Testowania**

*   **Poziomy Testów:**
    *   **Testy Jednostkowe (Unit Tests):** (Zakładane, że są tworzone przez deweloperów) Powinny pokrywać poszczególne funkcje, komponenty React (z mockowanymi zależnościami), walidatory Zod, logikę w serwisach (np. `flashcardsService`, `ai-generation.service` z mockowanym Supabase/API).
    *   **Testy Integracyjne (Integration Tests):** Testowanie interakcji między modułami:
        *   Frontend (Komponent -> Hook -> API Client)
        *   Backend (API Route -> Service -> Supabase Client)
        *   Serwis -> Serwis (np. `AIGenerationService` -> `RateLimiterService`, `CacheService`, `LoggingService`)
    *   **Testy API (API Tests):** Bezpośrednie testowanie endpointów API (`src/pages/api/**/*`) pod kątem kontraktu, logiki, obsługi błędów, autentykacji i autoryzacji.
    *   **Testy End-to-End (E2E Tests):** Symulowanie przepływów użytkownika w przeglądarce, od logowania po zarządzanie fiszkami i generowanie AI. Sprawdzanie kluczowych ścieżek użytkownika.
*   **Typy Testów:**
    *   **Testy Funkcjonalne:** Weryfikacja, czy wszystkie funkcje działają zgodnie z oczekiwaniami.
    *   **Testy Walidacji:** Sprawdzanie walidacji danych wejściowych (formularze, API).
    *   **Testy UI/UX:** Ocena wyglądu, responsywności, łatwości użycia, spójności interfejsu.
    *   **Testy Bezpieczeństwa:** Podstawowe testy autentykacji, autoryzacji, walidacji danych wejściowych (pod kątem np. XSS), sprawdzanie działania rate limitingu.
    *   **Testy Wydajności:** Podstawowe pomiary czasu odpowiedzi API (szczególnie AI), czasu ładowania stron.
    *   **Testy Kompatybilności:** Sprawdzenie działania na głównych przeglądarkach (Chrome, Firefox, Safari, Edge) i ewentualnie na różnych rozdzielczościach (desktop, tablet, mobile).
    *   **Testy Regresji:** Uruchamianie zestawu testów (głównie zautomatyzowanych) po każdej zmianie w kodzie, aby upewnić się, że nowe zmiany nie zepsuły istniejących funkcjonalności.
    *   **Testy Eksploracyjne:** Manualne, nieuskryptowane testowanie aplikacji w celu znalezienia nieoczekiwanych błędów.
*   **Automatyzacja:**
    *   Testy API zostaną zautomatyzowane (np. przy użyciu Postman/Newman lub biblioteki testowej jak `supertest`).
    *   Kluczowe scenariusze E2E zostaną zautomatyzowane (np. przy użyciu Playwright lub Cypress).
    *   Testy regresji będą w dużej mierze oparte na zautomatyzowanych testach API i E2E.
*   **Podejście:** Oparte na ryzyku - priorytetyzacja testów dla krytycznych funkcjonalności (autentykacja, CRUD fiszek, generowanie AI). Wykorzystanie technik projektowania testów (analiza wartości brzegowych, klasy równoważności, tablice decyzyjne).

**4. Środowiska Testowe**

*   **Lokalne (Development):** Używane przez deweloperów do uruchamiania testów jednostkowych i integracyjnych.
*   **Staging/Test:** Dedykowane środowisko QA, jak najbardziej zbliżone do produkcyjnego, z własną instancją Supabase (lub wydzielonymi danymi). Tutaj będą przeprowadzane testy API, E2E, manualne.
*   **Produkcyjne:** Ograniczone testy typu "smoke test" po wdrożeniu.

**5. Narzędzia**

*   **Testy API:** Postman / Insomnia (manualne i automatyzacja z Newman) lub dedykowana biblioteka testowa (np. w Node.js z `fetch` lub `axios` i frameworkiem testowym jak Jest/Vitest).
*   **Testy E2E:** Playwright lub Cypress.
*   **Przeglądarki:** Najnowsze wersje Chrome, Firefox, Safari, Edge.
*   **Narzędzia Deweloperskie Przeglądarki:** Do inspekcji elementów, sieci, konsoli.
*   **Zarządzanie Zadaniami/Błędami:** Jira, Trello, Asana (lub inne używane w projekcie).
*   **Kontrola Wersji:** Git (do zarządzania kodem testów automatycznych).
*   **CI/CD:** Jenkins, GitHub Actions, GitLab CI (do automatycznego uruchamiania testów).

**6. Główne Scenariusze Testowe (Przykłady)**

*   **6.1. Autentykacja:**
    *   **Logowanie:**
        *   Pomyślne logowanie poprawnymi danymi.
        *   Nieudane logowanie (błędny email, błędne hasło, puste pola).
        *   Walidacja formatu email i minimalnej długości hasła (frontend - Zod).
        *   Wyświetlanie komunikatów o błędach (ogólnych i specyficznych dla pola).
        *   Przekierowanie do `/generate` po pomyślnym logowaniu.
        *   Próba dostępu do strony chronionej bez logowania (przekierowanie do `/login`).
        *   Próba dostępu do `/login` będąc zalogowanym (przekierowanie do `/generate`).
    *   **Wylogowanie:**
        *   Pomyślne wylogowanie przyciskiem w `UserMenu`.
        *   Przekierowanie do `/login` po wylogowaniu.
        *   Brak dostępu do stron chronionych po wylogowaniu.
    *   **Rejestracja (Ograniczone):**
        *   Walidacja formularza (poprawny email, złożoność hasła, zgodność haseł, wymagane pola).
        *   Wyświetlanie komunikatów o błędach walidacji.
        *   *Backend: (Gdy dostępny) Weryfikacja tworzenia użytkownika w Supabase.*
    *   **Reset Hasła (Ograniczone):**
        *   Walidacja formularza (poprawny email, wymagane pole).
        *   Wyświetlanie komunikatu o wysłaniu linku po poprawnym zgłoszeniu.
        *   *Backend: (Gdy dostępny) Weryfikacja wysyłania emaila, działanie linku resetującego.*

*   **6.2. Ręczne Zarządzanie Fiszkami (CRUD):**
    *   **Tworzenie (`AddCardForm`, POST `/api/flashcards`):**
        *   Pomyślne dodanie fiszki z poprawnymi danymi.
        *   Walidacja frontendowa (puste pola, przekroczenie limitu znaków dla 'front' - 220, 'back' - 500).
        *   Wyświetlanie komunikatów o błędach walidacji i błędach API.
        *   Wyświetlanie komunikatu sukcesu i czyszczenie formularza.
        *   Sprawdzenie, czy nowa fiszka pojawia się na liście (`FlashcardList`).
        *   Sprawdzenie statusu nowo utworzonej fiszki (powinien być `accepted-original`, zgodnie z kodem formularza).
        *   Sprawdzenie, czy `generation_id` jest `null` dla ręcznie tworzonych fiszek.
        *   Próba dodania fiszki bez autentykacji (API powinno zwrócić 401).
    *   **Odczyt (Lista - `FlashcardList`, GET `/api/flashcards`):**
        *   Wyświetlanie listy fiszek użytkownika.
        *   Poprawne działanie paginacji (przechodzenie między stronami, wyświetlanie odpowiedniej liczby elementów - domyślnie 9).
        *   Wyświetlanie informacji o paginacji (np. "Showing 1-9 of 20").
        *   Obsługa pustej listy (wyświetlanie odpowiedniego komunikatu i linku do dodania).
        *   Obsługa błędów podczas ładowania listy (wyświetlanie komunikatu błędu i przycisku "Try Again").
        *   Wyświetlanie stanu ładowania (np. szkielety kart).
        *   Testowanie parametrów API: `page`, `limit`, `sortBy`, `order`.
        *   Testowanie filtrowania po statusie (jeśli zaimplementowane w API/frontendzie - obecnie API `GET /api/flashcards` wspiera parametr `status`).
        *   Sprawdzenie, czy użytkownik widzi tylko swoje fiszki.
    *   **Odczyt (Szczegóły - GET `/api/flashcards/:id`):**
        *   Pobranie danych konkretnej fiszki po ID (testowane głównie przez API).
        *   Próba pobrania nieistniejącej fiszki (API zwraca 404).
        *   Próba pobrania fiszki innego użytkownika (API zwraca 404 lub 401/403).
    *   **Aktualizacja (`EditFlashcardDialog`, PUT `/api/flashcards/:id`):**
        *   Otwarcie dialogu edycji po kliknięciu przycisku "Edit" na karcie.
        *   Poprawne wypełnienie formularza edycji danymi fiszki.
        *   Pomyślna edycja fiszki z poprawnymi danymi.
        *   Walidacja frontendowa (puste pola, przekroczenie limitu znaków).
        *   Przycisk "Save Changes" jest nieaktywny, jeśli nie wprowadzono zmian.
        *   Wyświetlanie komunikatów o błędach walidacji i błędach API w dialogu.
        *   Zamknięcie dialogu po pomyślnym zapisie.
        *   Zamknięcie dialogu po kliknięciu "Cancel" lub poza dialogiem.
        *   Sprawdzenie, czy zmiany są widoczne na liście fiszek.
        *   Sprawdzenie, czy status fiszki jest aktualizowany na `accepted-edited` po edycji (zgodnie z logiką w `FlashcardList.handleSaveEdit`).
        *   Próba edycji nieistniejącej fiszki (API zwraca 404).
        *   Próba edycji fiszki innego użytkownika (API zwraca 404 lub 401/403).
    *   **Usuwanie (`DeleteConfirmationDialog`, DELETE `/api/flashcards/:id`):**
        *   Otwarcie dialogu potwierdzenia po kliknięciu przycisku "Delete" na karcie.
        *   Pomyślne usunięcie fiszki po potwierdzeniu.
        *   Anulowanie usuwania (kliknięcie "Cancel", zamknięcie dialogu).
        *   Sprawdzenie, czy fiszka zniknęła z listy.
        *   Wyświetlanie komunikatu błędu w dialogu, jeśli usunięcie się nie powiedzie.
        *   Próba usunięcia nieistniejącej fiszki (API zwraca 404).
        *   Próba usunięcia fiszki innego użytkownika (API zwraca 404 lub 401/403).

*   **6.3. Generowanie Fiszek przez AI (`GenerateFlashcardsForm`, API):**
    *   **Wprowadzanie Tekstu:**
        *   Walidacja minimalnej (1000) i maksymalnej (10000) długości tekstu w czasie rzeczywistym.
        *   Wyświetlanie liczby znaków i odpowiedniej kolorystyki (np. czerwony poza zakresem).
        *   Wyświetlanie paska postępu wizualizującego długość tekstu.
        *   Wyświetlanie komunikatu błędu walidacji.
        *   Przycisk "Generate Flashcards" jest nieaktywny, jeśli tekst jest niepoprawny lub trwa ładowanie.
    *   **Wywołanie API (POST `/api/ai/generate`):**
        *   Pomyślne wywołanie API z poprawnym tekstem.
        *   Wyświetlanie stanu ładowania podczas generowania.
        *   Obsługa błędów API (np. błąd OpenAI, błąd serwera, błąd walidacji po stronie serwera).
        *   Sprawdzenie nagłówków odpowiedzi (np. `X-RateLimit-Remaining`).
        *   Próba wywołania API bez autentykacji (401).
        *   Próba wywołania API z tekstem poza zakresem (400).
    *   **Rate Limiting:**
        *   Wykonanie wielu żądań w krótkim czasie, aby przekroczyć limit (`AI_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_HOUR`).
        *   Sprawdzenie, czy API zwraca błąd 429 po przekroczeniu limitu.
        *   Sprawdzenie, czy komunikat błędu informuje o limicie.
        *   Sprawdzenie, czy po odczekaniu odpowiedniego czasu (`AI_CONFIG.RATE_LIMIT.WINDOW_MS`) można ponownie wykonać żądanie.
    *   **Caching (`CacheService`):**
        *   Wygenerowanie fiszek dla danego tekstu.
        *   Ponowne wygenerowanie fiszek dla *tego samego* tekstu w krótkim odstępie czasu.
        *   Weryfikacja (np. przez logi serwera lub czas odpowiedzi), czy drugie żądanie użyło cache'a.
        *   Sprawdzenie, czy cache wygasa po `CACHE_DURATION_MS`.
        *   Sprawdzenie, czy inny użytkownik generujący dla tego samego tekstu nie używa cache'a pierwszego użytkownika (cache per user).
    *   **Wyświetlanie i Zarządzanie Wygenerowanymi Fiszkami:**
        *   Poprawne wyświetlenie wygenerowanych fiszek po odpowiedzi API.
        *   Dostępność przycisków "Accept All", "Reject All".
        *   Dostępność przycisków Akceptuj/Edytuj/Odrzuć dla każdej karty.
        *   **Akcja "Accept" (pojedyncza):**
            *   Kliknięcie "Accept" na karcie.
            *   Weryfikacja wywołania API POST `/api/flashcards/update` ze statusem `accepted-original`.
            *   Weryfikacja wywołania API POST `/api/generation-sessions/bulk-increment` (lub podobnego) dla licznika `accepted_original`.
            *   Usunięcie karty z widoku wygenerowanych.
        *   **Akcja "Edit" (pojedyncza):**
            *   Kliknięcie "Edit" otwiera `EditFlashcardDialog` z danymi karty.
            *   Edycja i zapisanie zmian.
            *   Weryfikacja wywołania API POST `/api/flashcards/update` ze statusem `accepted-edited`.
            *   Weryfikacja wywołania API POST `/api/generation-sessions/bulk-increment` (lub podobnego) dla licznika `accepted_edited`.
            *   Usunięcie karty z widoku wygenerowanych.
        *   **Akcja "Reject" (pojedyncza):**
            *   Kliknięcie "Reject" na karcie.
            *   Weryfikacja wywołania API POST `/api/flashcards/delete`.
            *   Weryfikacja wywołania API POST `/api/generation-sessions/bulk-increment` (lub podobnego) dla licznika `rejected`.
            *   Usunięcie karty z widoku wygenerowanych.
        *   **Akcja "Accept All":**
            *   Kliknięcie "Accept All".
            *   Weryfikacja wywołania API POST `/api/flashcards/bulk-update` ze statusem `accepted-original` dla wszystkich kart.
            *   Weryfikacja wywołania API POST `/api/generation-sessions/bulk-increment` z sumaryczną liczbą dla `accepted_original`.
            *   Przekierowanie do `/flashcards`.
        *   **Akcja "Reject All":**
            *   Kliknięcie "Reject All".
            *   Weryfikacja wywołania API POST `/api/flashcards/bulk-delete` z ID wszystkich kart.
            *   Weryfikacja wywołania API POST `/api/generation-sessions/bulk-increment` z sumaryczną liczbą dla `rejected`.
            *   Usunięcie wszystkich kart z widoku.
        *   Sprawdzenie, czy fiszki zaakceptowane/zaakceptowane po edycji pojawiają się na liście "My Flashcards".
        *   Sprawdzenie, czy fiszki odrzucone nie pojawiają się na liście "My Flashcards".

*   **6.4. Testy API:**
    *   Pokrycie wszystkich endpointów (`/api/ai/generate`, `/api/flashcards/*`, `/api/generation-sessions/*`).
    *   Testowanie metod HTTP (GET, POST, PUT, DELETE, PATCH).
    *   Testowanie różnych scenariuszy (sukces, błędy walidacji, błędy autoryzacji, błędy serwera, nieznalezione zasoby).
    *   Sprawdzanie poprawności struktury odpowiedzi JSON i kodów statusu HTTP.
    *   Weryfikacja działania parametrów query (paginacja, sortowanie, filtrowanie).
    *   Weryfikacja poprawności działania logiki biznesowej (np. aktualizacja liczników sesji).
    *   Sprawdzanie nagłówków odpowiedzi (Content-Type, rate limit).

*   **6.5. Testy UI/UX:**
    *   Spójność wizualna (kolory Airbnb, fonty, layout).
    *   Responsywność na różnych rozmiarach ekranu.
    *   Czytelność tekstów i komunikatów.
    *   Intuicyjność nawigacji i przepływów.
    *   Poprawność działania komponentów UI (dialogi, przyciski, formularze, karty).
    *   Feedback dla użytkownika (stany ładowania, komunikaty sukcesu/błędu).
    *   Dostępność (podstawowe sprawdzenie kontrastu, nawigacji klawiaturą - jeśli wymagane).

*   **6.6. Testy Bezpieczeństwa (Podstawowe):**
    *   Próba dostępu do API/stron bez logowania.
    *   Próba wykonania operacji CRUD na fiszkach innego użytkownika (poprzez manipulację ID w API/URL).
    *   Wprowadzanie potencjalnie szkodliwych danych w polach tekstowych (np. tagi `<script>`) i weryfikacja, czy są poprawnie obsługiwane/sanityzowane (frontend i backend).
    *   Weryfikacja działania Rate Limitingu dla API AI.
    *   Sprawdzenie, czy wrażliwe klucze (OpenAI API Key) nie są eksponowane na frontendzie.
    *   Sprawdzenie ustawień cookies (HttpOnly, Secure, SameSite - zgodnie z `supabase.client.ts` i `supabase.server.ts`).

*   **6.7. Konfiguracja i Środowisko:**
    *   Weryfikacja działania walidacji zmiennych środowiskowych (`env.validation.ts`).
    *   Sprawdzenie działania aplikacji z brakującymi/niepoprawnymi zmiennymi środowiskowymi (oczekiwany błąd przy starcie lub odpowiedź 503 z API).
    *   Weryfikacja połączenia z Supabase.

**7. Kryteria Wejścia i Wyjścia**

*   **Kryteria Wejścia (Rozpoczęcie Testów):**
    *   Kod funkcjonalności jest wdrożony na środowisku testowym.
    *   Testy jednostkowe (jeśli są) przechodzą pomyślnie.
    *   Środowisko testowe jest stabilne i skonfigurowane.
    *   Dostępna jest dokumentacja (jeśli istnieje) lub opis funkcjonalności.
*   **Kryteria Wyjścia (Zakończenie Testów):**
    *   Wszystkie zaplanowane testy zostały wykonane.
    *   Wszystkie krytyczne i wysokie priorytety błędów zostały naprawione i zweryfikowane.
    *   Liczba znanych błędów o niższym priorytecie jest akceptowalna przez interesariuszy.
    *   Osiągnięto zakładany poziom pokrycia testami (jeśli jest zdefiniowany).
    *   Raport z testów został przygotowany i zaakceptowany.

**8. Role i Odpowiedzialności**

*   **Inżynier QA:** Projektowanie, wykonywanie testów (manualnych i automatycznych), raportowanie błędów, tworzenie raportów testowych.
*   **Deweloperzy:** Naprawa zgłoszonych błędów, dostarczanie informacji o implementacji, pisanie testów jednostkowych/integracyjnych.
*   **Product Owner/Project Manager:** Definiowanie priorytetów, akceptacja wyników testów.

**9. Ryzyka i Plany Awaryjne**

*   **Ryzyko:** Opóźnienia w dostarczaniu funkcjonalności na środowisko testowe. **Plan:** Komunikacja z zespołem, re-priorytetyzacja testów.
*   **Ryzyko:** Niestabilne środowisko testowe. **Plan:** Współpraca z DevOps/deweloperami w celu stabilizacji.
*   **Ryzyko:** Problemy z zewnętrznymi usługami (Supabase, OpenAI). **Plan:** Mockowanie usług do testów, zgłaszanie problemów dostawcom, testowanie obsługi błędów w aplikacji.
*   **Ryzyko:** Znalezienie dużej liczby krytycznych błędów pod koniec cyklu. **Plan:** Wczesne zaangażowanie QA, przeprowadzanie testów na bieżąco.
*   **Ryzyko:** Niejasne lub zmieniające się wymagania. **Plan:** Regularna komunikacja z PO, proaktywne zadawanie pytań.

**10. Harmonogram (Przykładowy - do dostosowania)**

*   Faza Planowania Testów: [Data rozpoczęcia] - [Data zakończenia]
*   Faza Projektowania Testów: [Data rozpoczęcia] - [Data zakończenia]
*   Faza Przygotowania Środowiska i Danych: [Data rozpoczęcia] - [Data zakończenia]
*   Faza Wykonywania Testów: [Data rozpoczęcia] - [Data zakończenia] (Iteracyjnie, zgodnie z postępem prac)
*   Faza Raportowania i Zamykania: [Data rozpoczęcia] - [Data zakończenia]

**11. Wyniki/Dostarczane Artefakty**

*   Plan Testów (ten dokument).
*   Przypadki Testowe (w narzędziu do zarządzania testami lub w formie dokumentu/arkusza).
*   Skrypty Testów Automatycznych (w repozytorium kodu).
*   Raporty Błędów (w systemie śledzenia błędów).
*   Raporty z Wykonania Testów.
*   Raport Końcowy z Testów.

**12. Załączniki (Opcjonalnie)**

*   Specyfikacja wymagań.
*   Dokumentacja architektury.

Ten plan testów stanowi solidną podstawę do zapewnienia jakości aplikacji "Flashcards Generator". Należy go traktować jako dokument żywy, który może być aktualizowany w miarę rozwoju projektu i pojawiania się nowych informacji.