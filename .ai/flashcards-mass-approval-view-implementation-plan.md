# Plan implementacji widoku Masowe Zarządzanie Fiszkami AI

## 1. Przegląd
Widok umożliwia użytkownikom przeglądanie listy fiszek wygenerowanych przez AI, które oczekują na decyzję (status 'pending'). Użytkownik może zaznaczyć wiele fiszek i wykonać masowe akcje: "Zatwierdź zaznaczone" lub "Odrzuć zaznaczone". Widok wymaga odpowiednich endpointów API do pobrania listy fiszek i wykonania masowych akcji.

## 2. Routing widoku
Widok powinien być dostępny pod ścieżką: `/flashcards/mass-approval`

## 3. Struktura komponentów
```
src/pages/flashcards/mass-approval.astro (Astro Page)
└── src/components/flashcards/MassApprovalManager.tsx (React Component, client:load)
    ├── src/components/flashcards/MassActionToolbar.tsx (React Component)
    │   ├── (Przycisk: Zatwierdź zaznaczone)
    │   └── (Przycisk: Odrzuć zaznaczone)
    │   └── (Wyświetlanie liczby zaznaczonych)
    └── src/components/flashcards/FlashcardSelectionList.tsx (React/Shadcn Table Wrapper)
        ├── (Nagłówek tabeli z Checkboxem "Zaznacz wszystko")
        └── src/components/flashcards/FlashcardSelectionItem.tsx[] (React/Shadcn TableRow Wrapper)
            ├── (Checkbox zaznaczenia)
            └── (Podgląd zawartości fiszki: przód/tył)
```

## 4. Szczegóły komponentów

### `MassApprovalPageView` (`src/pages/flashcards/mass-approval.astro`)
- **Opis**: Główny komponent strony Astro. Renderuje layout i osadza interaktywny komponent React `MassApprovalManager`. Może być odpowiedzialny za wstępne pobranie danych (listy fiszek) lub przekazanie tej odpowiedzialności do komponentu React.
- **Główne elementy**: Layout strony, komponent `<MassApprovalManager client:load />`.
- **Obsługiwane interakcje**: Brak bezpośrednich.
- **Obsługiwana walidacja**: Brak bezpośredniej.
- **Typy**: Potencjalnie `FlashcardDTO[]` (jeśli pobiera dane serwerowo).
- **Propsy**: Potencjalnie `initialFlashcards: FlashcardDTO[]`.

### `MassApprovalManager` (`src/components/flashcards/MassApprovalManager.tsx`)
- **Opis**: Główny komponent interaktywny React. Odpowiedzialny za pobranie listy oczekujących fiszek (jeśli strona Astro tego nie robi), zarządzanie stanem zaznaczenia, obsługę kliknięć przycisków masowych akcji i komunikację z API dla tych akcji.
- **Główne elementy**: `MassActionToolbar`, `FlashcardSelectionList`. Wyświetla stan ładowania i komunikaty o błędach (zarówno przy pobieraniu listy, jak i przy wykonywaniu akcji).
- **Obsługiwane interakcje**: Zaznaczanie/odznaczanie pojedynczych fiszek, zaznaczanie/odznaczanie wszystkich fiszek, kliknięcie "Zatwierdź zaznaczone", kliknięcie "Odrzuć zaznaczone".
- **Obsługiwana walidacja**: Przyciski masowych akcji są nieaktywne, jeśli żadna fiszka nie jest zaznaczona.
- **Typy**: `FlashcardDTO[]`, `Set<string>` (dla `selectedCardIds`). Wewnętrzne typy stanu (`isLoading`, `error`).
- **Propsy**: Potencjalnie `initialFlashcards: FlashcardDTO[]`.

### `MassActionToolbar` (`src/components/flashcards/MassActionToolbar.tsx`)
- **Opis**: Pasek narzędzi zawierający przyciski do masowych akcji ("Zatwierdź zaznaczone", "Odrzuć zaznaczone") oraz informację o liczbie aktualnie zaznaczonych elementów.
- **Główne elementy**: `Button` (Zatwierdź), `Button` (Odrzuć), tekst informacyjny (np. "Zaznaczono: X").
- **Obsługiwane interakcje**: Kliknięcie przycisków "Zatwierdź" i "Odrzuć", które wywołują odpowiednie funkcje w `MassApprovalManager`.
- **Obsługiwana walidacja**: Przyciski są nieaktywne (`disabled`), jeśli liczba zaznaczonych elementów (`selectedCount`) wynosi 0.
- **Typy**: `number` (selectedCount).
- **Propsy**: `selectedCount: number`, `onMassAccept: () => void`, `onMassReject: () => void`, `isActionLoading: boolean` (do blokowania przycisków podczas akcji).

### `FlashcardSelectionList` (`src/components/flashcards/FlashcardSelectionList.tsx`)
- **Opis**: Komponent renderujący listę lub tabelę (`shadcn/ui Table`) fiszek do zatwierdzenia. Zawiera nagłówek z checkboxem "Zaznacz wszystko" oraz wiersze z poszczególnymi fiszkami.
- **Główne elementy**: `Table`, `TableHeader`, `TableRow` (nagłówek z `Checkbox` "Zaznacz wszystko"), `TableBody`, mapowanie `flashcards` na `FlashcardSelectionItem`.
- **Obsługiwane interakcje**: Kliknięcie checkboxa "Zaznacz wszystko". Przekazuje akcje zaznaczenia pojedynczych elementów z `FlashcardSelectionItem` do `MassApprovalManager`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardDTO[]`, `Set<string>` (selectedIds).
- **Propsy**: `flashcards: FlashcardDTO[]`, `selectedIds: Set<string>`, `onSelectionChange: (id: string, isSelected: boolean) => void`, `onSelectAllChange: (isSelected: boolean) => void`.

### `FlashcardSelectionItem` (`src/components/flashcards/FlashcardSelectionItem.tsx`)
- **Opis**: Reprezentuje pojedynczy wiersz w tabeli/liście (`shadcn/ui TableRow`). Wyświetla checkbox do zaznaczenia oraz podgląd zawartości fiszki (np. skrócony `front` i `back`).
- **Główne elementy**: `TableRow`, `TableCell` (z `Checkbox`), `TableCell` (z `front`), `TableCell` (z `back`).
- **Obsługiwane interakcje**: Kliknięcie checkboxa, które wywołuje `onSelectionChange` z `id` fiszki i nowym stanem zaznaczenia.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardDTO`, `boolean` (isSelected).
- **Propsy**: `flashcard: FlashcardDTO`, `isSelected: boolean`, `onSelectionChange: (id: string, isSelected: boolean) => void`.

## 5. Typy

- **`FlashcardDTO`**: Zdefiniowany w `src/types.ts`. Główny typ danych używany w tym widoku.
  ```typescript
  export type FlashcardDTO = Pick<
    FlashcardRow,
    "id" | "front" | "back" | "status" | "source" | "created_at" | "updated_at"
  >;
  ```
- **`BulkUpdateAction` (Nowy typ, np. w `src/types.ts`)**: Typ określający akcję do wykonania w masowej aktualizacji.
  ```typescript
  export type BulkUpdateAction = "accept" | "reject";
  ```
- **`BulkUpdateCommand` (Nowy typ, np. w `src/types.ts`)**: Ciało żądania dla endpointu masowej aktualizacji.
  ```typescript
  export interface BulkUpdateCommand {
    ids: string[];
    action: BulkUpdateAction;
  }
  ```
- **`BulkUpdateResponseDTO` (Nowy typ, np. w `src/types.ts`)**: Potencjalny typ odpowiedzi dla masowej aktualizacji (może być prosty status lub lista zaktualizowanych ID).
  ```typescript
  export interface BulkUpdateResponseDTO {
    success: boolean;
    message?: string;
    updatedCount?: number;
  }
  ```

## 6. Zarządzanie stanem
Stan będzie zarządzany lokalnie w komponencie `MassApprovalManager` przy użyciu hooków React `useState`.

- **Kluczowe zmienne stanu w `MassApprovalManager`**:
    - `flashcards: FlashcardDTO[]`: Lista fiszek pobranych z API.
    - `selectedIds: Set<string>`: Zbiór ID zaznaczonych fiszek.
    - `isLoading: boolean`: Czy trwa pobieranie listy fiszek.
    - `isActionLoading: boolean`: Czy trwa wykonywanie masowej akcji (accept/reject).
    - `error: string | null`: Komunikat błędu (pobierania lub akcji).

- **Potencjalny Custom Hook `usePendingFlashcards`**: Mógłby enkapsulować logikę pobierania listy fiszek (`GET /api/flashcards?source=ai&status=pending`), zarządzanie stanem `isLoading`, `error` oraz samą listą `flashcards`.
- **Potencjalny Custom Hook `useMassFlashcardActions`**: Mógłby enkapsulować logikę wywołań API dla masowych akcji (`POST /api/flashcards/bulk-update`), zarządzanie stanem `isActionLoading`, `error` oraz udostępniać funkcje `massAccept(ids: string[])` i `massReject(ids: string[])`.

- **Zarządzanie zaznaczeniem**: Funkcje `handleSelectionChange` i `handleSelectAllChange` będą aktualizować stan `selectedIds`.

## 7. Integracja API

*Kluczowe: Wymaga zdefiniowania i implementacji następujących endpointów backendowych.* 

1.  **Pobieranie listy oczekujących fiszek AI**:
    - **Endpoint**: *Wymaga zdefiniowania*. Np. `GET /api/flashcards?source=ai&status=pending` (z obsługą paginacji, jeśli lista może być długa).
    - **Żądanie**:
        - Metoda: `GET`
        - Headers: `Authorization: Bearer <JWT_TOKEN>`
        - Parametry Query: `source=ai`, `status=pending`, `page=1`, `limit=50` (opcjonalnie)
    - **Odpowiedź sukcesu (200 OK)**: `{ flashcards: FlashcardDTO[], pagination?: PaginationDTO }`.
    - **Odpowiedź błędu**: 401 (Unauthorized), 500.
    - **Obsługa frontend**: Wywoływane przy ładowaniu `MassApprovalManager`. Aktualizuje stan `isLoading`, `flashcards`, `error`.

2.  **Masowa Aktualizacja Statusu Fiszek (Accept/Reject)**:
    - **Endpoint**: *Wymaga zdefiniowania*. Np. `POST /api/flashcards/bulk-update`.
    - **Żądanie**:
        - Metoda: `POST`
        - Headers: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`
        - Ciało: `BulkUpdateCommand` (`{ ids: string[], action: "accept" | "reject" }`)
    - **Odpowiedź sukcesu (200 OK lub 204 No Content)**: `BulkUpdateResponseDTO` lub pusty.
    - **Odpowiedź błędu**: 400 (np. błędne ID, nieprawidłowa akcja), 401, 500.
    - **Obsługa frontend**: Wywoływane z `MassApprovalManager` po kliknięciu przycisków w `MassActionToolbar`. Aktualizuje stan `isActionLoading`, `error`. Po sukcesie usuwa przetworzone fiszki ze stanu `flashcards` (lub odświeża listę wywołując ponownie API GET) i czyści `selectedIds`.

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Komponent pobiera listę fiszek. Wyświetlany jest stan ładowania. Po załadowaniu, `FlashcardSelectionList` wypełnia się danymi.
- **Zaznaczanie pojedynczej fiszki**: Kliknięcie checkboxa w `FlashcardSelectionItem` dodaje/usuwa ID fiszki ze stanu `selectedIds`. Aktualizuje się licznik zaznaczonych w `MassActionToolbar`. Przyciski akcji stają się aktywne/nieaktywne.
- **Zaznaczanie wszystkich fiszek**: Kliknięcie checkboxa "Zaznacz wszystko" w nagłówku `FlashcardSelectionList` dodaje/usuwa ID *wszystkich aktualnie wyświetlanych* fiszek do/z `selectedIds`. Aktualizuje licznik i stan przycisków.
- **Kliknięcie "Zatwierdź zaznaczone"**: Jeśli są zaznaczone fiszki, wywoływane jest API masowej akceptacji. Przyciski akcji pokazują stan ładowania (`isActionLoading`). Po sukcesie, zatwierdzone fiszki znikają z listy, zaznaczenie jest resetowane, pojawia się komunikat o sukcesie. W razie błędu, pojawia się komunikat o błędzie.
- **Kliknięcie "Odrzuć zaznaczone"**: Analogicznie do akceptacji, ale wywoływane jest API masowego odrzucenia.

## 9. Warunki i walidacja

- **Warunek wykonania masowej akcji**: Co najmniej jedna fiszka musi być zaznaczona (`selectedIds.size > 0`). Wpływ: Przyciski "Zatwierdź zaznaczone" i "Odrzuć zaznaczone" w `MassActionToolbar` są aktywne (`disabled = false`) tylko wtedy, gdy ten warunek jest spełniony.

## 10. Obsługa błędów

- **Błędy API (`GET /api/flashcards?source=ai&status=pending`)**:
    - 401 (Unauthorized): Wyświetlić komunikat o braku autoryzacji lub przekierować na logowanie.
    - 500 (Server Error): Wyświetlić ogólny komunikat błędu w miejscu listy fiszek (np. "Nie udało się pobrać listy fiszek.").
    - Błędy sieciowe: Wyświetlić komunikat o problemie z połączeniem.
    - **Obsługa**: W `MassApprovalManager` (lub hooku `usePendingFlashcards`) zaimplementuj logikę obsługi błędów. Aktualizować stan `error`. Wyświetlać błąd za pomocą `shadcn/ui Alert`.
- **Błędy API (`POST /api/flashcards/bulk-update`)**:
    - 400 (Bad Request): Wyświetlić komunikat błędu zwrócony przez API (jeśli jest) jako `Alert`.
    - 401 (Unauthorized): Obsłużyć jak wyżej.
    - 500 (Server Error): Wyświetlić ogólny komunikat (np. "Wystąpił błąd podczas przetwarzania akcji.") jako `Alert`.
    - **Obsługa**: W `MassApprovalManager` (lub hooku `useMassFlashcardActions`) zaimplementuj logikę obsługi błędów. Aktualizować stan `error`. Wyświetlać błąd jako `Alert`. Resetować stan `isActionLoading`.

## 11. Kroki implementacji

1.  **Definicja API**: **Kluczowe**: Zdefiniuj i zaimplementuj endpointy backendowe: `GET /api/flashcards` (z filtrowaniem `source=ai`, `status=pending` i paginacją) oraz `POST /api/flashcards/bulk-update`.
2.  **Utworzenie plików**: Stwórz pliki strony Astro (`src/pages/flashcards/mass-approval.astro`) i komponentów React (`src/components/flashcards/MassApprovalManager.tsx`, `MassActionToolbar.tsx`, `FlashcardSelectionList.tsx`, `FlashcardSelectionItem.tsx`). Zdefiniuj nowe typy (`BulkUpdateAction`, `BulkUpdateCommand`, `BulkUpdateResponseDTO`) w `src/types.ts`.
3.  **Struktura strony Astro**: Zaimplementuj `MassApprovalPageView`, osadzając `<MassApprovalManager client:load />`. Skonfiguruj routing.
4.  **Implementacja `MassApprovalManager`**:
    - Dodaj podstawowe elementy UI (`MassActionToolbar`, `FlashcardSelectionList`).
    - Zaimplementuj zarządzanie stanem (`flashcards`, `selectedIds`, `isLoading`, `isActionLoading`, `error`).
5.  **Integracja API Pobierania Listy**:
    - W `MassApprovalManager` (lub hooku `usePendingFlashcards`) zaimplementuj logikę wywołania `GET /api/flashcards?source=ai&status=pending` przy montowaniu komponentu.
    - Obsłuż stany ładowania (`isLoading`) i błędu (`error`).
    - Zapisz pobrane fiszki w stanie `flashcards`.
6.  **Implementacja `FlashcardSelectionList` i `FlashcardSelectionItem`**:
    - Użyj `shadcn/ui Table` do zbudowania listy.
    - `FlashcardSelectionList`: Dodaj nagłówek z checkboxem "Zaznacz wszystko". Renderuj listę `flashcards` używając `FlashcardSelectionItem`.
    - `FlashcardSelectionItem`: Wyświetl checkbox i podgląd fiszki. Połącz checkbox ze stanem `selectedIds` za pomocą handlerów przekazanych z `MassApprovalManager`.
    - Zaimplementuj logikę "Zaznacz wszystko" w `FlashcardSelectionList` i `MassApprovalManager`.
7.  **Implementacja `MassActionToolbar`**:
    - Dodaj przyciski "Zatwierdź zaznaczone" i "Odrzuć zaznaczone".
    - Wyświetl liczbę zaznaczonych (`selectedIds.size`).
    - Powiąż stan `disabled` przycisków z `selectedIds.size === 0` i `isActionLoading`.
    - Połącz przyciski z handlerami `handleMassAccept` i `handleMassReject` w `MassApprovalManager`.
8.  **Integracja API Masowych Akcji**:
    - W `MassApprovalManager` (lub hooku `useMassFlashcardActions`) zaimplementuj funkcje `handleMassAccept` i `handleMassReject`.
    - Funkcje te powinny pobrać aktualne `selectedIds`, wywołać `POST /api/flashcards/bulk-update` z odpowiednim `action`.
    - Obsłuż stan `isActionLoading` podczas wywołania API.
    - Obsłuż odpowiedzi sukcesu (usuń przetworzone fiszki z listy `flashcards` lub odśwież listę, wyczyść `selectedIds`, pokaż komunikat) i błędu (ustaw `error`, pokaż komunikat).
9.  **Styling i Dostępność**: Użyj Tailwind i `shadcn/ui` do stylizacji. Zadbaj o dostępność tabeli i kontrolek formularza.
10. **Testowanie**: Przetestuj pobieranie listy, mechanizm zaznaczania (pojedyncze, wszystkie), masowe akcje (akceptacja, odrzucenie) oraz obsługę błędów API.
11. **Refaktoryzacja**: Rozważ użycie custom hooków (`usePendingFlashcards`, `useMassFlashcardActions`) dla lepszej organizacji kodu.

*Ważne: Implementacja jest silnie zależna od dostępności i poprawnego działania zdefiniowanych endpointów backendowych (Krok 1).* 