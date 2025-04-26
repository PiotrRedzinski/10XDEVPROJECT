# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd
Widok "Generowanie Fiszek" umożliwia użytkownikom wprowadzenie dłuższego tekstu (od 1000 do 10000 znaków) w dedykowanym polu tekstowym. Po zatwierdzeniu formularza, tekst jest wysyłany do API (`/api/ai/generate`) w celu automatycznego wygenerowania fiszek edukacyjnych przy użyciu AI. Po pomyślnym zakończeniu procesu generowania, użytkownik jest przekierowywany do widoku listy fiszek (`/flashcards`). Widok ten implementuje historyjkę użytkownika US-002.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką `/generate`.

## 3. Struktura komponentów
```
src/pages/generate.astro
└── src/layouts/MainLayout.astro (Layout)
    └── src/components/GenerateFlashcardsForm.tsx (React, client:load)
        ├── Textarea (shadcn/ui)
        └── Button (shadcn/ui)
```
- `generate.astro`: Główny plik strony Astro, który renderuje layout i osadza komponent React.
- `MainLayout.astro`: Główny layout aplikacji, zawierający m.in. TopBar.
- `GenerateFlashcardsForm.tsx`: Komponent React odpowiedzialny za formularz, walidację, interakcję z API i zarządzanie stanem widoku.

## 4. Szczegóły komponentów
### `src/pages/generate.astro`
- **Opis komponentu**: Strona Astro definiująca ścieżkę `/generate`. Renderuje `MainLayout` i osadza interaktywny komponent `GenerateFlashcardsForm` z dyrektywą `client:load`, aby umożliwić interaktywność po stronie klienta.
- **Główne elementy**: Osadzenie komponentu `<GenerateFlashcardsForm client:load />` wewnątrz `<MainLayout>`.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji, deleguje je do `GenerateFlashcardsForm`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `src/components/GenerateFlashcardsForm.tsx`
- **Opis komponentu**: Interaktywny komponent React, który zawiera formularz do wprowadzania tekstu. Zarządza stanem formularza (wprowadzany tekst, stan ładowania, błędy), obsługuje walidację długości tekstu, wysyła żądanie do API po kliknięciu przycisku i obsługuje odpowiedź (przekierowanie lub wyświetlenie błędu).
- **Główne elementy**:
    - Formularz HTML (`<form>`).
    - Komponent `<Textarea>` z `shadcn/ui` do wprowadzania tekstu.
    - Komponent `<Button>` z `shadcn/ui` do wysłania formularza.
    - Element do wyświetlania komunikatów o błędach walidacji lub błędach API.
    - Wskaźnik ładowania (np. spinner w przycisku) podczas przetwarzania żądania API.
- **Obsługiwane interakcje**:
    - Wprowadzanie tekstu w polu `Textarea`.
    - Kliknięcie przycisku "Generuj Fiszki".
- **Obsługiwana walidacja**:
    - Sprawdzenie, czy pole tekstowe nie jest puste.
    - Sprawdzenie, czy długość wprowadzonego tekstu mieści się w zakresie 1000-10000 znaków. Przycisk "Generuj Fiszki" jest nieaktywny, jeśli walidacja nie przechodzi. Komunikat o błędzie walidacji jest wyświetlany inline.
- **Typy**:
    - DTO: `AIGenerateRequestDTO`, `AIGenerateResponseDTO` (importowane z `src/types.ts`).
    - ViewModel: `GenerateFormState` (zdefiniowany lokalnie lub w `src/types.ts`).
- **Propsy**: Brak.

## 5. Typy
W widoku wykorzystane zostaną następujące typy:

- **`AIGenerateRequestDTO`**: (z `src/types.ts`) Używany do strukturyzacji danych wysyłanych do API.
  ```typescript
  export interface AIGenerateRequestDTO {
    text: string; // Tekst do przetworzenia (1000-10000 znaków)
  }
  ```
- **`AIGenerateResponseDTO`**: (z `src/types.ts`) Używany do odbioru danych z API po pomyślnym wygenerowaniu fiszek. Zawiera listę wygenerowanych fiszek i metryki sesji. Jego zawartość nie jest bezpośrednio wykorzystywana w tym widoku, ale jest potrzebna do określenia typu odpowiedzi.
  ```typescript
    export interface AIGenerateResponseDTO {
      flashcards: FlashcardDTO[];
      sessionMetrics: AIGenerationSessionMetricsDTO;
    }
  ```
- **`GenerateFormState`** (ViewModel, do zdefiniowania): Reprezentuje stan wewnętrzny komponentu `GenerateFlashcardsForm`.
  ```typescript
  interface GenerateFormState {
    text: string;          // Aktualna zawartość pola tekstowego
    isLoading: boolean;    // Czy trwa wysyłanie żądania do API
    error: string | null;  // Komunikat błędu (walidacji lub API)
  }
  ```

## 6. Zarządzanie stanem
Stan widoku (wprowadzony tekst, stan ładowania, komunikaty o błędach) będzie zarządzany lokalnie w komponencie `GenerateFlashcardsForm.tsx` za pomocą hooka `React.useState`. Nie ma potrzeby stosowania globalnego zarządzania stanem ani customowych hooków dla tego widoku w jego obecnej formie.

## 7. Integracja API
Komponent `GenerateFlashcardsForm` będzie komunikował się z endpointem `POST /api/ai/generate`.
- **Żądanie**: Po zatwierdzeniu formularza (i pomyślnej walidacji), zostanie wysłane żądanie POST z ciałem w formacie JSON, zgodnym z typem `AIGenerateRequestDTO`:
  ```json
  {
    "text": "..." // Wprowadzony przez użytkownika tekst
  }
  ```
- **Odpowiedź**:
    - **Sukces (200 OK)**: Odpowiedź będzie zawierać dane zgodne z typem `AIGenerateResponseDTO`. Po otrzymaniu sukcesu, komponent zainicjuje przekierowanie użytkownika na stronę `/flashcards` (np. używając `window.location.href = '/flashcards';` lub mechanizmu routera Astro, jeśli dostępny po stronie klienta).
    - **Błąd (400, 401, 500)**: W przypadku błędu, komponent ustawi odpowiedni komunikat w stanie `error` i wyświetli go użytkownikowi. Szczegóły błędu zostaną zalogowane do konsoli przeglądarki.

## 8. Interakcje użytkownika
- **Wprowadzanie tekstu**: Użytkownik wkleja lub wpisuje tekst w komponencie `Textarea`. Stan `text` w `GenerateFormState` jest aktualizowany na bieżąco. Walidacja długości tekstu jest wykonywana przy każdej zmianie, wpływając na dostępność przycisku "Generuj Fiszki" i ewentualne komunikaty o błędach walidacji.
- **Kliknięcie "Generuj Fiszki"**:
    1. Sprawdzenie walidacji (choć przycisk powinien być nieaktywny, jeśli jest niepoprawna).
    2. Ustawienie `isLoading` na `true`.
    3. Wyczyszczenie poprzednich błędów (`error` na `null`).
    4. Wywołanie żądania `POST /api/ai/generate` z aktualnym tekstem.
    5. **Po sukcesie**: Przekierowanie na `/flashcards`.
    6. **Po błędzie**: Ustawienie komunikatu w `error`.
    7. Ustawienie `isLoading` na `false`.

## 9. Warunki i walidacja
- **Komponent `GenerateFlashcardsForm`**:
    - **Warunek**: Długość tekstu w polu `Textarea`.
    - **Walidacja**: Musi zawierać od 1000 do 10000 znaków (`text.length >= 1000 && text.length <= 10000`).
    - **Wpływ na interfejs**:
        - Przycisk "Generuj Fiszki" jest nieaktywny (`disabled`), jeśli warunek nie jest spełniony.
        - Jeśli użytkownik wprowadził tekst i warunek nie jest spełniony, wyświetlany jest komunikat błędu inline, np. "Tekst musi zawierać od 1000 do 10000 znaków.".

## 10. Obsługa błędów
- **Błędy walidacji**: Obsługiwane po stronie klienta w komponencie `GenerateFlashcardsForm`. Wyświetlany jest jasny komunikat dla użytkownika, a przycisk wysyłania jest blokowany.
- **Błędy API (400, 401, 500)**:
    - W komponencie `GenerateFlashcardsForm`, w bloku `catch` żądania API.
    - Ustawiany jest generyczny komunikat błędu w stanie `error`, np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.".
    - Stan `isLoading` jest ustawiany na `false`.
    - Szczegółowe informacje o błędzie (status, odpowiedź serwera) są logowane do konsoli deweloperskiej w celu debugowania.
- **Stan ładowania**: Podczas wysyłania żądania API (`isLoading === true`), przycisk "Generuj Fiszki" powinien być nieaktywny i wyświetlać wskaźnik ładowania (np. spinner), aby poinformować użytkownika o trwającym procesie.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro**: Stworzyć plik `src/pages/generate.astro`.
2.  **Dodanie Layoutu**: W `generate.astro`, zaimportować i użyć `MainLayout` z `src/layouts/MainLayout.astro`.
3.  **Utworzenie komponentu React**: Stworzyć plik `src/components/GenerateFlashcardsForm.tsx`.
4.  **Implementacja formularza**: W `GenerateFlashcardsForm.tsx`, zbudować strukturę formularza używając komponentów `<Textarea>` i `<Button>` z `shadcn/ui` oraz standardowych elementów HTML. Dodać `placeholder` do `Textarea` zgodnie z opisem w `ui-plan.md`.
5.  **Zarządzanie stanem**: W `GenerateFlashcardsForm.tsx`, użyć hooka `useState` do zarządzania stanem `text`, `isLoading` i `error` (zgodnie z typem `GenerateFormState`).
6.  **Implementacja walidacji**: Dodać logikę sprawdzającą długość tekstu w stanie `text`. Wynik walidacji powinien kontrolować atrybut `disabled` przycisku oraz wyświetlanie komunikatu o błędzie walidacji.
7.  **Obsługa wysyłania**: Implementować funkcję `handleSubmit`, która będzie wywoływana przy wysyłaniu formularza. Funkcja powinna:
    - Zapobiec domyślnemu przeładowaniu strony (`event.preventDefault()`).
    - Ustawić `isLoading` na `true` i wyczyścić `error`.
    - Wykonać asynchroniczne żądanie `fetch` typu `POST` na `/api/ai/generate` z ciałem `{ text }`.
    - W bloku `then` (lub po `await` w `try`):
        - Sprawdzić status odpowiedzi. Jeśli `ok`, przekierować na `/flashcards`.
        - Jeśli nie `ok`, rzucić błąd lub przetworzyć odpowiedź błędu.
    - W bloku `catch`: Ustawić stan `error` na generyczny komunikat i zalogować szczegóły błędu.
    - W bloku `finally`: Ustawić `isLoading` na `false`.
8.  **Połączenie stanu z UI**: Powiązać stan komponentu z elementami UI:
    - Wartość `Textarea` z `state.text`.
    - Stan `disabled` przycisku z `state.isLoading` lub wynikiem walidacji.
    - Wyświetlanie komunikatu `state.error`, jeśli nie jest `null`.
    - Warunkowe renderowanie wskaźnika ładowania w przycisku, gdy `state.isLoading` jest `true`.
9.  **Integracja z Astro**: W `src/pages/generate.astro`, zaimportować `GenerateFlashcardsForm` i umieścić go wewnątrz `MainLayout` z dyrektywą `client:load`: `<GenerateFlashcardsForm client:load />`.
10. **Styling**: Użyć klas Tailwind CSS do stylizacji komponentu `GenerateFlashcardsForm` i jego elementów, zapewniając spójność z resztą aplikacji.
11. **Testowanie**: Przetestować działanie formularza, walidacji, stanu ładowania, obsługi błędów API i przekierowania po sukcesie. 