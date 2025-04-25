# Plan implementacji widoku Generacja Fiszek AI

## 1. Przegląd
Widok umożliwia użytkownikom wklejenie tekstu (1000-10000 znaków), wygenerowanie fiszek za pomocą AI za pośrednictwem endpointu `/api/ai/generate`, a następnie przeglądanie, akceptowanie, edytowanie lub odrzucanie wygenerowanych fiszek przed ich ostatecznym zapisaniem. Widok obsługuje również walidację danych wejściowych i wyświetlanie błędów.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/ai/generation`

## 3. Struktura komponentów
```
src/pages/ai/generation.astro (Astro Page)
└── src/components/ai/AIGenerationForm.tsx (React Component, client:load)
    ├── src/components/ui/TextInputArea.tsx (React/Shadcn Textarea Wrapper)
    ├── src/components/ui/Button.tsx (React/Shadcn Button - Generate)
    ├── src/components/ai/GenerationResultsList.tsx (React Component)
    │   └── src/components/ai/FlashcardResultItem.tsx[] (React/Shadcn Card Wrapper)
    │       ├── (Wyświetlanie przodu/tyłu fiszki)
    │       └── (Przyciski akcji: Akceptuj, Edytuj, Odrzuć)
    └── src/components/flashcards/EditFlashcardDialog.tsx (React/Shadcn Dialog, renderowany warunkowo)
        ├── (Input: Przód fiszki)
        ├── (Input: Tył fiszki)
        └── (Przyciski: Zapisz, Anuluj)
```

## 4. Szczegóły komponentów

### `AIGenerationPageView` (`src/pages/ai/generation.astro`)
- **Opis**: Główny komponent strony Astro. Renderuje layout i osadza interaktywny komponent React `AIGenerationForm`. Zapewnia uwierzytelnienie (przekazuje dane użytkownika do komponentu React, jeśli to konieczne, lub polega na middleware).
- **Główne elementy**: Layout strony, komponent `<AIGenerationForm client:load />`.
- **Obsługiwane interakcje**: Brak bezpośrednich.
- **Obsługiwana walidacja**: Brak bezpośredniej.
- **Typy**: Brak specyficznych.
- **Propsy**: Brak (chyba że przekazuje dane sesji/użytkownika).

### `AIGenerationForm` (`src/components/ai/AIGenerationForm.tsx`)
- **Opis**: Główny komponent interaktywny React. Zarządza stanem całego procesu: wprowadzaniem tekstu, wywołaniem API generacji, wyświetlaniem wyników, obsługą akcji na fiszkach (akceptuj/odrzuć/edytuj) i obsługą błędów.
- **Główne elementy**: `TextInputArea`, `GenerateButton`, `GenerationResultsList`, `EditFlashcardDialog`. Wyświetla komunikaty o błędach API i stanie ładowania.
- **Obsługiwane interakcje**: Wprowadzanie tekstu, kliknięcie przycisku "Generuj", obsługa akcji (akceptuj, odrzuć, edytuj) przekazanych z `FlashcardResultItem`, zapis edytowanej fiszki z `EditFlashcardDialog`.
- **Obsługiwana walidacja**: Sprawdza długość wprowadzonego tekstu (1000-10000 znaków) przed aktywacją przycisku "Generuj".
- **Typy**: `GenerateFlashcardsCommand`, `AIGenerationResultDTO`, `FlashcardViewModel`, `AIGenerationSessionMetricsDTO`. Wewnętrzne typy stanu (np. `isLoading`, `apiError`, `editingFlashcard`).
- **Propsy**: Brak (chyba że przyjmuje dane użytkownika z strony Astro).

### `TextInputArea` (`src/components/ui/TextInputArea.tsx` lub użycie `shadcn/ui Textarea`)
- **Opis**: Komponent pola tekstowego (textarea) do wprowadzania tekstu przez użytkownika. Wyświetla licznik znaków i wskazówki dotyczące limitów. Pokazuje błędy walidacji długości.
- **Główne elementy**: `textarea` (z `shadcn/ui`), etykieta, licznik znaków, komunikat o błędzie.
- **Obsługiwane interakcje**: `onChange` do aktualizacji stanu tekstu w `AIGenerationForm`.
- **Obsługiwana walidacja**: Wizualne wskazanie, czy długość tekstu jest w zakresie 1000-10000 znaków. Wyświetlanie komunikatu błędu, jeśli jest poza zakresem.
- **Typy**: `string` (value), `function` (onChange), `object` (validationState).
- **Propsy**: `value: string`, `onChange: (value: string) => void`, `placeholder?: string`, `maxLength?: number`, `minLength?: number`, `error?: string`.

### `GenerateButton` (`src/components/ui/Button.tsx` - instancja `shadcn/ui Button`)
- **Opis**: Przycisk uruchamiający proces generowania fiszek. Jego stan (aktywny/nieaktywny/ładowanie) zależy od walidacji tekstu i stanu ładowania API.
- **Główne elementy**: `button` (z `shadcn/ui`), opcjonalny wskaźnik ładowania (spinner).
- **Obsługiwane interakcje**: `onClick` wywołujący funkcję generowania w `AIGenerationForm`.
- **Obsługiwana walidacja**: Przycisk jest nieaktywny (`disabled`), jeśli tekst nie spełnia wymagań długości (1k-10k) lub jeśli proces generowania jest w toku (`isLoading`).
- **Typy**: `boolean` (disabled), `boolean` (loading).
- **Propsy**: `onClick: () => void`, `disabled: boolean`, `loading: boolean`, `children: React.ReactNode`.

### `GenerationResultsList` (`src/components/ai/GenerationResultsList.tsx`)
- **Opis**: Komponent wyświetlający listę wygenerowanych fiszek (`FlashcardResultItem`).
- **Główne elementy**: Lista (`ul` lub `div`), mapowanie tablicy `FlashcardViewModel` na komponenty `FlashcardResultItem`.
- **Obsługiwane interakcje**: Brak bezpośrednich - przekazuje akcje z elementów listy do `AIGenerationForm`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardViewModel[]`.
- **Propsy**: `flashcards: FlashcardViewModel[]`, `onAccept: (tempId: string) => void`, `onReject: (tempId: string) => void`, `onEdit: (flashcard: FlashcardViewModel) => void`.

### `FlashcardResultItem` (`src/components/ai/FlashcardResultItem.tsx`)
- **Opis**: Wyświetla pojedynczą wygenerowaną fiszkę (jako `shadcn/ui Card` lub podobny). Pokazuje przód, tył i przyciski akcji (Akceptuj, Edytuj, Odrzuć). Wskazuje stan fiszki (np. odrzucona, zaakceptowana). Wyświetla ewentualne błędy walidacji długości pól.
- **Główne elementy**: `Card` (lub `div`), wyświetlanie `front` i `back`, `Button` (Akceptuj), `Button` (Edytuj), `Button` (Odrzuć). Komunikaty walidacyjne dla `front`/`back` jeśli przekraczają limit.
- **Obsługiwane interakcje**: Kliknięcie przycisków "Akceptuj", "Edytuj", "Odrzuć" wywołujące odpowiednie handlery przekazane w propsach.
- **Obsługiwana walidacja**: Wyświetla ostrzeżenie/błąd, jeśli `front.length > 220` lub `back.length > 500`. Przyciski akcji mogą być nieaktywne w zależności od stanu fiszki (`status` w `FlashcardViewModel`).
- **Typy**: `FlashcardViewModel`.
- **Propsy**: `flashcard: FlashcardViewModel`, `onAccept: (tempId: string) => void`, `onReject: (tempId: string) => void`, `onEdit: (flashcard: FlashcardViewModel) => void`.

### `EditFlashcardDialog` (`src/components/flashcards/EditFlashcardDialog.tsx`)
- **Opis**: Modal (`shadcn/ui Dialog`) do edycji pól `front` i `back` wybranej fiszki. Zawiera pola input i przyciski "Zapisz" / "Anuluj".
- **Główne elementy**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `Input` (dla `front`), `Textarea` (dla `back`), `DialogFooter`, `Button` (Zapisz), `Button` (Anuluj). Komunikaty walidacyjne dla pól.
- **Obsługiwane interakcje**: Wprowadzanie zmian w polach `front` i `back`, kliknięcie "Zapisz" (wywołuje walidację i `onSave`), kliknięcie "Anuluj" (wywołuje `onCancel`).
- **Obsługiwana walidacja**: Sprawdza długość `front` (<= 220) i `back` (<= 500) przed aktywacją przycisku "Zapisz". Wyświetla błędy walidacji przy polach.
- **Typy**: `FlashcardViewModel` (dane początkowe), `UpdateFlashcardCommand` (dane do zapisu).
- **Propsy**: `isOpen: boolean`, `onOpenChange: (isOpen: boolean) => void`, `flashcard: FlashcardViewModel | null`, `onSave: (updatedData: UpdateFlashcardCommand) => Promise<void>`, `onCancel: () => void`.

## 5. Typy

- **`FlashcardDTO`**: Zdefiniowany w `src/types.ts`. Używany jako typ danych otrzymywanych z API i (potencjalnie) zapisywanych.
  ```typescript
  export type FlashcardDTO = Pick<
    FlashcardRow,
    "id" | "front" | "back" | "status" | "source" | "created_at" | "updated_at"
  >;
  ```
- **`GenerateFlashcardsCommand`**: Zdefiniowany w `src/types.ts`. Używany jako ciało żądania do `POST /api/ai/generate`.
  ```typescript
  export interface GenerateFlashcardsCommand {
    text: string; // Must be between 1000 and 10000 characters
  }
  ```
- **`AIGenerationResultDTO`**: Zdefiniowany w `src/types.ts`. Typ odpowiedzi z `POST /api/ai/generate`.
  ```typescript
  export interface AIGenerationResultDTO {
    flashcards: FlashcardDTO[]; // Uwaga: mogą nie mieć 'id' jeśli backend nie zapisuje ich od razu
    sessionMetrics: AIGenerationSessionMetricsDTO;
  }
  ```
- **`AIGenerationSessionMetricsDTO`**: Zdefiniowany w `src/types.ts`.
- **`UpdateFlashcardCommand`**: Zdefiniowany w `src/types.ts`. Używany do zapisu edytowanej fiszki.
  ```typescript
  export interface UpdateFlashcardCommand {
    front: string; // max 220 characters
    back: string; // max 500 characters
  }
  ```
- **`FlashcardViewModel` (Nowy typ, potencjalnie w `src/components/ai/types.ts` lub w komponencie)**: Reprezentuje stan fiszki na froncie *po* wygenerowaniu, a *przed* finalnym zapisem.
  ```typescript
  interface FlashcardViewModel {
    tempId: string; // Unikalne ID klienta (np. crypto.randomUUID())
    front: string; // max 220
    back: string; // max 500
    // Status śledzony na kliencie do momentu zapisu/odrzucenia
    status: 'pending' | 'accepted' | 'rejected' | 'edited';
    source: 'ai'; // Zawsze 'ai' w tym kontekście
    // Błędy walidacji wykryte na froncie lub zwrócone przez AI (jeśli przekracza limity)
    validationErrors?: { front?: string; back?: string };
    // ID z bazy danych po pomyślnym zapisie (opcjonalne)
    dbId?: string;
  }
  ```
  *   `tempId`: Klucz do listy React i zarządzania stanem przed zapisem.
  *   `status`: Śledzi decyzję użytkownika na UI.
  *   `validationErrors`: Przechowuje błędy np. przekroczenia długości.
  *   `dbId`: Przechowuje ID z bazy danych po zapisaniu zaakceptowanej/edytowanej fiszki.

## 6. Zarządzanie stanem
Stan będzie zarządzany lokalnie w komponencie `AIGenerationForm` przy użyciu hooków React `useState` i `useReducer` (jeśli logika stanie się złożona).

- **Kluczowe zmienne stanu w `AIGenerationForm`**:
    - `textInput: string`: Aktualna wartość pola tekstowego.
    - `isLoading: boolean`: Czy trwa wywołanie API `/api/ai/generate`.
    - `generatedFlashcards: FlashcardViewModel[]`: Lista wygenerowanych fiszek (mapowanych z DTO na ViewModel).
    - `apiError: string | null`: Komunikat błędu z ostatniego wywołania API.
    - `editingFlashcard: FlashcardViewModel | null`: Fiszka aktualnie edytowana w modalu.
    - `sessionMetrics: AIGenerationSessionMetricsDTO | null`: Metryki zwrócone przez API.

- **Potencjalny Custom Hook `useAIGeneration`**: Można rozważyć stworzenie hooka, który enkapsuluje logikę wywołania API `POST /api/ai/generate`, zarządzanie stanem `isLoading`, `apiError`, `generatedFlashcards`, `sessionMetrics` oraz mapowanie DTO -> ViewModel. Hook udostępniałby funkcję `generate(text: string)` oraz stany.

- **Aktualizacje stanu fiszek**: Akcje "Akceptuj", "Odrzuć", "Zapisz edycję" będą aktualizować stan `generatedFlashcards` (zmieniając `status` i ewentualnie `dbId` w odpowiednim `FlashcardViewModel` za pomocą `tempId`).

## 7. Integracja API

1.  **Generowanie Fiszek**:
    - **Endpoint**: `POST /api/ai/generate`
    - **Żądanie**:
        - Metoda: `POST`
        - Headers: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>` (Token musi być dostarczony przez mechanizm autoryzacji Astro/React)
        - Ciało: `GenerateFlashcardsCommand` (`{ text: string }`)
    - **Odpowiedź sukcesu (200 OK)**: `AIGenerationResultDTO` (`{ flashcards: FlashcardDTO[], sessionMetrics: AIGenerationSessionMetricsDTO }`)
    - **Odpowiedź błędu**: 400 (Invalid input), 401 (Unauthorized), 500 (Internal server error).
    - **Obsługa frontend**: Wywoływane z `AIGenerationForm` po kliknięciu "Generuj". Aktualizuje stan `isLoading`, `generatedFlashcards`, `sessionMetrics`, `apiError`.

2.  **Zapisywanie Zaakceptowanej/Edytowanej Fiszki**:
    - **Endpoint**: *Wymaga zdefiniowania*. Prawdopodobnie `POST /api/flashcards`.
    - **Żądanie**:
        - Metoda: `POST`
        - Headers: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
        - Ciało: `CreateFlashcardCommand` (`{ front: string, back: string }`) - dane z zaakceptowanego/edytowanego `FlashcardViewModel`.
    - **Odpowiedź sukcesu (201 Created)**: `FlashcardDTO` (z nowym `id` z bazy danych).
    - **Odpowiedź błędu**: 400 (Validation error), 401 (Unauthorized), 500.
    - **Obsługa frontend**: Wywoływane z `AIGenerationForm` po kliknięciu "Akceptuj" na fiszce lub "Zapisz" w dialogu edycji. Aktualizuje `dbId` i `status` w odpowiednim `FlashcardViewModel`. Obsługuje błędy API lokalnie dla danej fiszki/dialogu.

*Uwaga: Implementacja backendu `/api/ai/generate` musi zostać sprawdzona - czy zapisuje fiszki od razu (i zwraca ID), czy tylko generuje. Plan zakłada, że nie zapisuje od razu i frontend musi wywołać osobne API do zapisu.*

## 8. Interakcje użytkownika

- **Wprowadzanie tekstu**: Użytkownik wpisuje lub wkleja tekst do `TextInputArea`. Licznik znaków aktualizuje się. Przycisk "Generuj" staje się aktywny, gdy tekst ma 1000-10000 znaków.
- **Kliknięcie "Generuj"**: Przycisk pokazuje stan ładowania. Po zakończeniu API, lista `GenerationResultsList` wypełnia się fiszkami lub pojawia się komunikat o błędzie.
- **Kliknięcie "Akceptuj"**: Fiszka wizualnie zmienia stan (np. zielone tło, przyciski nieaktywne). Wywoływane jest API zapisu. Po sukcesie, stan jest potwierdzony. W razie błędu, użytkownik jest informowany.
- **Kliknięcie "Odrzuć"**: Fiszka wizualnie zmienia stan (np. szare tło, przekreślenie, przyciski nieaktywne). Status w `FlashcardViewModel` zmienia się na `rejected`. Nie jest wywoływane API zapisu.
- **Kliknięcie "Edytuj"**: Otwiera się `EditFlashcardDialog` wypełniony danymi fiszki.
- **Edycja w Dialogu**: Użytkownik modyfikuje pola `front`/`back`. Walidacja długości działa na bieżąco, blokując "Zapisz", jeśli limity są przekroczone.
- **Kliknięcie "Zapisz" (Dialog)**: Wywoływane jest API zapisu. Po sukcesie, dialog się zamyka, a fiszka na liście `GenerationResultsList` aktualizuje swoje dane i stan (np. na `edited` lub `accepted`). W razie błędu, komunikat pojawia się w dialogu.
- **Kliknięcie "Anuluj" (Dialog)**: Dialog zamyka się bez zapisywania zmian.

## 9. Warunki i walidacja

- **Długość tekstu wejściowego**: W `AIGenerationForm` i `TextInputArea`. Warunek: `1000 <= text.length <= 10000`. Wpływ: Aktywacja/deaktywacja przycisku "Generuj", wyświetlanie komunikatów w `TextInputArea`.
- **Długość pól fiszki (`front`, `back`)**: W `EditFlashcardDialog` i potencjalnie w `FlashcardResultItem` (jako ostrzeżenie, jeśli AI zwróci za długie). Warunki: `front.length <= 220`, `back.length <= 500`. Wpływ: Aktywacja/deaktywacja przycisku "Zapisz" w dialogu, wyświetlanie komunikatów walidacyjnych przy polach input/textarea oraz w `FlashcardResultItem`. Komunikat powinien zawierać tylko dozwoloną liczbę znaków (zgodnie z PRD).

## 10. Obsługa błędów

- **Błędy walidacji formularza (długość tekstu)**: Wyświetlane bezpośrednio przy `TextInputArea`. Blokują możliwość wysłania formularza.
- **Błędy walidacji fiszki (długość `front`/`back`)**: Wyświetlane w `EditFlashcardDialog` przy odpowiednich polach. Blokują możliwość zapisu. Wyświetlane jako ostrzeżenia w `FlashcardResultItem`, jeśli AI wygeneruje niepoprawne dane.
- **Błędy API (`POST /api/ai/generate`)**:
    - 400 (Invalid Input): Wyświetlić komunikat błędu zwrócony przez API (jeśli jest) w widocznym miejscu formularza (np. `shadcn/ui Alert`).
    - 401 (Unauthorized): Wyświetlić komunikat o braku autoryzacji lub przekierować na stronę logowania.
    - 500 (Server Error): Wyświetlić ogólny komunikat błędu (np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie później.") w widocznym miejscu.
    - Błędy sieciowe: Wyświetlić ogólny komunikat o problemie z połączeniem.
- **Błędy API zapisu fiszki (`POST /api/flashcards`)**:
    - Wyświetlić komunikat błędu w kontekście akcji, która go wywołała (np. przy konkretnej fiszce w `FlashcardResultItem` lub w `EditFlashcardDialog`).
    - Rozważyć mechanizm ponawiania próby dla błędów przejściowych.

## 11. Kroki implementacji

1.  **Utworzenie plików**: Stwórz pliki strony Astro (`src/pages/ai/generation.astro`) i komponentów React (`src/components/ai/AIGenerationForm.tsx`, `GenerationResultsList.tsx`, `FlashcardResultItem.tsx`, `src/components/flashcards/EditFlashcardDialog.tsx`). Zdefiniuj typ `FlashcardViewModel`.
2.  **Struktura strony Astro**: Zaimplementuj `AIGenerationPageView`, osadzając `<AIGenerationForm client:load />`. Skonfiguruj routing. Zapewnij przekazanie kontekstu autoryzacji (jeśli potrzebne).
3.  **Implementacja `AIGenerationForm`**:
    - Dodaj podstawowe elementy UI (`TextInputArea`, `GenerateButton`, pusty `GenerationResultsList`, `EditFlashcardDialog`).
    - Zaimplementuj zarządzanie stanem (`textInput`, `isLoading`, `generatedFlashcards`, `apiError`, `editingFlashcard`, `sessionMetrics`).
    - Zaimplementuj logikę walidacji długości tekstu wejściowego i powiąż ją ze stanem `GenerateButton`.
4.  **Implementacja `TextInputArea`**: Stwórz lub użyj komponentu `shadcn/ui Textarea`. Dodaj licznik znaków i wyświetlanie błędów walidacji.
5.  **Integracja API Generacji**:
    - W `AIGenerationForm` zaimplementuj funkcję wywołującą `POST /api/ai/generate` (używając `fetch` lub biblioteki typu TanStack Query).
    - Obsłuż stany ładowania (`isLoading`).
    - Obsłuż odpowiedzi sukcesu (mapowanie DTO na ViewModel, aktualizacja stanu `generatedFlashcards`, `sessionMetrics`) i błędu (aktualizacja `apiError`).
6.  **Implementacja `GenerationResultsList` i `FlashcardResultItem`**:
    - `GenerationResultsList`: Renderuj listę `FlashcardViewModel` używając `FlashcardResultItem`.
    - `FlashcardResultItem`: Wyświetl `front`, `back`. Dodaj przyciski "Akceptuj", "Edytuj", "Odrzuć". Wyświetl stan fiszki na podstawie `FlashcardViewModel.status`. Wyświetl błędy walidacji długości. Połącz przyciski z handlerami przekazanymi z `AIGenerationForm`.
7.  **Implementacja Logiki Akcji (Accept, Reject, Edit)**:
    - W `AIGenerationForm` stwórz funkcje `handleAccept`, `handleReject`, `handleEdit`.
    - `handleReject`: Aktualizuje `status` w `FlashcardViewModel` na `rejected`.
    - `handleEdit`: Ustawia `editingFlashcard` w stanie, co otwiera dialog.
    - `handleAccept`: Aktualizuje `status` na `accepted` (optymistycznie?) i wywołuje API zapisu (`POST /api/flashcards`).
8.  **Implementacja `EditFlashcardDialog`**:
    - Zbuduj formularz edycji z polami `front`, `back` i przyciskami.
    - Zaimplementuj lokalny stan dla pól edycji.
    - Zaimplementuj walidację długości pól i powiąż ją ze stanem przycisku "Zapisz".
    - Połącz przycisk "Zapisz" z funkcją `handleSaveEdit` w `AIGenerationForm` (przekazaną jako prop `onSave`).
    - Połącz przycisk "Anuluj" i zamknięcie dialogu z funkcją `handleCancelEdit` w `AIGenerationForm`.
9.  **Integracja API Zapisu**:
    - W `AIGenerationForm` zaimplementuj funkcję `handleSaveFlashcard` wywołującą `POST /api/flashcards`.
    - Wywołaj tę funkcję z `handleAccept` i `handleSaveEdit` (z dialogu).
    - Obsłuż odpowiedzi sukcesu (aktualizacja `dbId` w `FlashcardViewModel`) i błędu.
10. **Styling i Dostępność**: Użyj Tailwind i `shadcn/ui` do stylizacji. Zadbaj o podstawową dostępność (semantyczny HTML, atrybuty ARIA tam, gdzie to konieczne).
11. **Testowanie**: Przetestuj przepływ generacji, walidację, akcje akceptacji/odrzucenia/edycji oraz obsługę błędów.
12. **Refaktoryzacja**: Rozważ wydzielenie logiki API i zarządzania stanem do custom hooka (`useAIGeneration`) jeśli komponent `AIGenerationForm` stanie się zbyt duży.

*Ważne: Upewnij się, że backendowe endpointy (`POST /api/flashcards`) są dostępne i działają zgodnie z oczekiwaniami przed lub w trakcie implementacji kroków 7-9.* 