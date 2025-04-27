# Plan implementacji widoku flashcards

## 1. Przegląd
Widok `/flashcards` prezentuje użytkownikowi listę jego fiszek (utworzonych ręcznie lub wygenerowanych przez AI) w formie siatki. Umożliwia interakcję z każdą fiszką poprzez przyciski "Edytuj" i "Kasuj", które otwierają odpowiednie okna dialogowe do modyfikacji lub potwierdzenia usunięcia fiszki.

## 2. Routing widoku
- Ścieżka: `/flashcards`

## 3. Struktura komponentów
```
FlashcardsPage (src/pages/flashcards.astro)
└── FlashcardList (src/components/FlashcardList.tsx) [client:load]
    ├── FlashcardCard (src/components/FlashcardCard.tsx) [*] // Renderowany dla każdej fiszki
    │   ├── Button (shadcn/ui) - "Edytuj"
    │   └── Button (shadcn/ui) - "Kasuj"
    ├── EditFlashcardDialog (src/components/EditFlashcardDialog.tsx) // Renderowany warunkowo
    │   └── Dialog (shadcn/ui)
    │       └── EditFlashcardForm // Wewnętrzny formularz
    ├── DeleteConfirmationDialog (src/components/DeleteConfirmationDialog.tsx) // Renderowany warunkowo
    │   └── AlertDialog (shadcn/ui)
    └── PaginationControls (Optional, src/components/PaginationControls.tsx) // Jeśli paginacja jest implementowana
```

## 4. Szczegóły komponentów
### FlashcardsPage
- **Opis komponentu:** Strona Astro (`.astro`) hostująca listę fiszek. Odpowiada za ustawienie layoutu strony i renderowanie komponentu `FlashcardList`.
- **Główne elementy:** `<Layout>`, `<FlashcardList client:load />`
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów.
- **Propsy:** Brak.

### FlashcardList
- **Opis komponentu:** Komponent React (`.tsx`) odpowiedzialny za pobieranie i wyświetlanie listy fiszek w siatce. Zarządza stanem ładowania, błędami oraz logiką otwierania okien dialogowych do edycji i usuwania.
- **Główne elementy:** Kontener siatki (np. `div` z klasami Tailwind `grid grid-cols-3 gap-4`), mapowanie listy fiszek do komponentów `FlashcardCard`, wskaźnik ładowania, komunikat o błędzie, komponenty `EditFlashcardDialog` i `DeleteConfirmationDialog` (renderowane warunkowo), opcjonalnie `PaginationControls`.
- **Obsługiwane interakcje:**
    - Wyświetlanie stanu ładowania podczas pobierania danych.
    - Wyświetlanie komunikatu o błędzie, jeśli pobieranie się nie powiedzie.
    - Otwieranie `EditFlashcardDialog` po kliknięciu "Edytuj" na karcie.
    - Otwieranie `DeleteConfirmationDialog` po kliknięciu "Kasuj" na karcie.
    - Aktualizacja listy po pomyślnej edycji lub usunięciu fiszki.
    - (Opcjonalnie) Obsługa zmiany strony w paginacji.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji; delegowana do dialogów.
- **Typy:**
    - `FlashcardDTO`
    - `PaginationDTO`
    - `FlashcardListViewModel` (ViewModel):
        ```typescript
        interface FlashcardListViewModel {
          flashcards: FlashcardDTO[];
          pagination: PaginationDTO | null;
          isLoading: boolean;
          error: string | null;
          editingFlashcardId: string | null;
          deletingFlashcardId: string | null;
        }
        ```
- **Propsy:** Brak.

### FlashcardCard
- **Opis komponentu:** Komponent React (`.tsx`) wyświetlający pojedynczą fiszkę. Pokazuje treść przodu i tyłu oraz przyciski akcji.
- **Główne elementy:** Komponent `Card` (shadcn/ui), elementy `p` lub `div` do wyświetlania `front` i `back`, `Button` ("Edytuj"), `Button` ("Kasuj", wariant `destructive`).
- **Obsługiwane interakcje:**
    - Kliknięcie przycisku "Edytuj".
    - Kliknięcie przycisku "Kasuj".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardDTO`.
- **Propsy:**
    ```typescript
    interface FlashcardCardProps {
      flashcard: FlashcardDTO;
      onEditClick: (id: string) => void;
      onDeleteClick: (id: string) => void;
    }
    ```

### EditFlashcardDialog
- **Opis komponentu:** Komponent React (`.tsx`) implementujący okno dialogowe (modal) do edycji fiszki. Zawiera formularz z polami "przód" i "tył".
- **Główne elementy:** Komponent `Dialog` (shadcn/ui), `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, formularz (`form`) z `Input` (przód), `Textarea` (tył), `Button` ("Zapisz"), `Button` ("Anuluj"). Wyświetlanie błędów formularza i API.
- **Obsługiwane interakcje:**
    - Wprowadzanie tekstu w polach "przód" i "tył".
    - Kliknięcie "Zapisz" (wysyłanie formularza).
    - Kliknięcie "Anuluj" lub zamknięcie dialogu.
- **Obsługiwana walidacja:**
    - **Przód:** Wymagane, max 220 znaków.
    - **Tył:** Wymagane, max 500 znaków.
- **Typy:** `FlashcardDTO` (dane początkowe), `UpdateFlashcardCommand`, `EditFlashcardFormViewModel` (wewnętrzny stan formularza, podobny do `AddCardFormViewModel`).
- **Propsy:**
    ```typescript
    interface EditFlashcardDialogProps {
      flashcard: FlashcardDTO | null; // Fiszka do edycji lub null, jeśli niewidoczny
      isOpen: boolean;
      onClose: () => void;
      onSave: (id: string, data: UpdateFlashcardCommand) => Promise<boolean>; // Zwraca true dla sukcesu, false dla błędu API
    }
    ```

### DeleteConfirmationDialog
- **Opis komponentu:** Komponent React (`.tsx`) implementujący okno dialogowe (modal) do potwierdzenia usunięcia fiszki.
- **Główne elementy:** Komponent `AlertDialog` (shadcn/ui), `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction` ("Usuń"), `AlertDialogCancel` ("Anuluj").
- **Obsługiwane interakcje:**
    - Kliknięcie "Usuń".
    - Kliknięcie "Anuluj" lub zamknięcie dialogu.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów.
- **Propsy:**
    ```typescript
    interface DeleteConfirmationDialogProps {
      flashcardId: string | null; // ID fiszki do usunięcia lub null
      isOpen: boolean;
      onClose: () => void;
      onConfirm: (id: string) => Promise<boolean>; // Zwraca true dla sukcesu, false dla błędu API
    }
    ```

## 5. Typy
- **`FlashcardDTO`** (z `src/types.ts`): Reprezentuje pojedynczą fiszkę.
- **`PaginationDTO`** (z `src/types.ts`): Informacje o paginacji z API.
- **`UpdateFlashcardCommand`** (z `src/types.ts`): Używany jako ciało żądania dla `PUT /api/flashcards/:id`.
    ```typescript
    export interface UpdateFlashcardCommand {
      front: string; // max 220
      back: string; // max 500
    }
    ```
- **`FlashcardListViewModel`** (Nowy typ): Reprezentuje stan komponentu `FlashcardList`.
    ```typescript
    interface FlashcardListViewModel {
      flashcards: FlashcardDTO[];
      pagination: PaginationDTO | null;
      isLoading: boolean;
      error: string | null;
      editingFlashcardId: string | null; // ID fiszki aktualnie edytowanej (kontroluje dialog edycji)
      deletingFlashcardId: string | null; // ID fiszki do potwierdzenia usunięcia (kontroluje dialog usuwania)
    }
    ```
- **`EditFlashcardFormViewModel`** (Nowy typ, wewnętrzny dla `EditFlashcardDialog`):
    ```typescript
    interface EditFlashcardFormViewModel {
      id: string;
      front: string;
      back: string;
      isSubmitting: boolean;
      errors: { front?: string; back?: string; api?: string; };
    }
    ```

## 6. Zarządzanie stanem
- Główny stan widoku (`flashcards`, `pagination`, `isLoading`, `error`, `editingFlashcardId`, `deletingFlashcardId`) będzie zarządzany w komponencie `FlashcardList` za pomocą hooka `useState`.
- Stan formularza edycji będzie zarządzany lokalnie w `EditFlashcardDialog` (`useState`).
- **Rekomendacja:** Rozważenie stworzenia custom hooka `useFlashcards` w celu enkapsulacji logiki pobierania danych, zarządzania stanem listy oraz funkcji mutacji (aktualizacja, usuwanie) z automatyczną aktualizacją stanu lokalnego. To uprości komponent `FlashcardList`.
    ```typescript
    // Przykładowy interfejs hooka
    function useFlashcards(): {
      state: FlashcardListViewModel;
      fetchFlashcards: (params?: { page?: number; limit?: number; /* ... */ }) => Promise<void>;
      startEdit: (id: string) => void;
      cancelEdit: () => void;
      saveEdit: (id: string, data: UpdateFlashcardCommand) => Promise<boolean>;
      startDelete: (id: string) => void;
      cancelDelete: () => void;
      confirmDelete: (id: string) => Promise<boolean>;
    }
    ```

## 7. Integracja API
- **Pobieranie listy:**
    - **Endpoint:** `GET /api/flashcards`
    - **Cel:** Pobranie paginowanej listy fiszek.
    - **Parametry zapytania:** `page`, `limit`, opcjonalnie `status`, `sortBy`, `order`.
    - **Typ odpowiedzi (Success 200):** `{ flashcards: FlashcardDTO[]; pagination: PaginationDTO; }`
    - **Obsługa:** Wywoływane przy montowaniu `FlashcardList` i przy zmianie strony paginacji. Aktualizuje stan `flashcards` i `pagination`.
- **Aktualizacja fiszki:**
    - **Endpoint:** `PUT /api/flashcards/:id`
    - **Cel:** Zapisanie zmian w edytowanej fiszce.
    - **Typ żądania (Request Body):** `UpdateFlashcardCommand`
    - **Typ odpowiedzi (Success 200):** `FlashcardDTO` (zaktualizowana fiszka)
    - **Obsługa:** Wywoływane z `EditFlashcardDialog` po pomyślnej walidacji. Po sukcesie, aktualizuje odpowiednią fiszkę w stanie `flashcards` w `FlashcardList` i zamyka dialog.
- **Usuwanie fiszki:**
    - **Endpoint:** `DELETE /api/flashcards/:id`
    - **Cel:** Usunięcie fiszki.
    - **Typ odpowiedzi (Success 200):** `{ message: string }`
    - **Obsługa:** Wywoływane z `DeleteConfirmationDialog` po potwierdzeniu. Po sukcesie, usuwa fiszkę ze stanu `flashcards` w `FlashcardList` i zamyka dialog.

## 8. Interakcje użytkownika
1.  **Ładowanie widoku:** `FlashcardList` pobiera pierwszą stronę fiszek (`GET /api/flashcards`), wyświetla stan ładowania, a następnie siatkę fiszek.
2.  **Kliknięcie "Edytuj" na karcie:** `FlashcardList` ustawia `editingFlashcardId` na ID klikniętej fiszki, co powoduje otwarcie `EditFlashcardDialog` z danymi tej fiszki.
3.  **Zapisanie zmian w dialogu edycji:** `EditFlashcardDialog` wywołuje `PUT /api/flashcards/:id`. Po sukcesie, `FlashcardList` aktualizuje stan `flashcards` i resetuje `editingFlashcardId` (zamyka dialog).
4.  **Anulowanie edycji:** `FlashcardList` resetuje `editingFlashcardId` (zamyka dialog).
5.  **Kliknięcie "Kasuj" na karcie:** `FlashcardList` ustawia `deletingFlashcardId`, co otwiera `DeleteConfirmationDialog`.
6.  **Potwierdzenie usunięcia:** `DeleteConfirmationDialog` wywołuje `DELETE /api/flashcards/:id`. Po sukcesie, `FlashcardList` usuwa fiszkę ze stanu `flashcards` i resetuje `deletingFlashcardId` (zamyka dialog).
7.  **Anulowanie usuwania:** `FlashcardList` resetuje `deletingFlashcardId` (zamyka dialog).
8.  **(Opcjonalnie) Kliknięcie kontrolki paginacji:** `FlashcardList` pobiera dane dla nowej strony (`GET /api/flashcards` z parametrem `page`) i aktualizuje widok.

## 9. Warunki i walidacja
- **Dialog Edycji (`EditFlashcardDialog`):**
    - **Pole "przód":** Wymagane, max 220 znaków. Walidacja po stronie klienta przed wysłaniem `PUT`. Wpływ: komunikat błędu w dialogu, blokada wysłania.
    - **Pole "tył":** Wymagane, max 500 znaków. Walidacja po stronie klienta. Wpływ: komunikat błędu, blokada wysłania.
- **Lista Fisz (`FlashcardList`):**
    - **Warunek:** Posiadanie uprawnień (uwierzytelnienie). Weryfikowane przez API (401). Wpływ: Błąd ładowania lub przekierowanie na logowanie.

## 10. Obsługa błędów
- **Błąd pobierania listy (`GET /api/flashcards`):** Wyświetlenie komunikatu o błędzie zamiast siatki fiszek w `FlashcardList`.
- **Błąd edycji (`PUT /api/flashcards/:id`):** Wyświetlenie komunikatu błędu wewnątrz `EditFlashcardDialog`. Obsługa błędów walidacji (400), braku uprawnień (401), braku fiszki (404), błędu serwera (500).
- **Błąd usuwania (`DELETE /api/flashcards/:id`):** Wyświetlenie komunikatu o błędzie (np. jako Toast lub w `DeleteConfirmationDialog`). Obsługa 401, 404, 500.
- **Błąd sieci:** Ogólny komunikat o problemie z połączeniem przy każdej operacji API.
- **Stan ładowania:** Wyświetlanie wskaźników ładowania w `FlashcardList` podczas pobierania listy oraz dezaktywacja przycisków "Zapisz"/"Usuń" w dialogach podczas operacji API.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro:** Stwórz plik `src/pages/flashcards.astro`. Dodaj layout i komponent `FlashcardList client:load`.
2.  **Utworzenie komponentu `FlashcardList`:** Stwórz `src/components/FlashcardList.tsx`. Zaimplementuj logikę pobierania danych (`GET /api/flashcards`) przy użyciu `useEffect` i `fetch`. Zarządzaj stanem (`useState` dla `FlashcardListViewModel`). Wyświetl stan ładowania i błędu.
3.  **Utworzenie komponentu `FlashcardCard`:** Stwórz `src/components/FlashcardCard.tsx`. Przyjmij `flashcard`, `onEditClick`, `onDeleteClick` jako propsy. Wyświetl dane fiszki i przyciski. Wywołaj odpowiednie callbacki po kliknięciu przycisków.
4.  **Renderowanie listy:** W `FlashcardList`, zmapuj pobrane `flashcards` do komponentów `FlashcardCard`. Zaimplementuj układ siatki (3 kolumny).
5.  **Utworzenie `EditFlashcardDialog`:** Stwórz `src/components/EditFlashcardDialog.tsx` używając `Dialog` z shadcn/ui. Zaimplementuj formularz edycji (pola, walidacja, stan `EditFlashcardFormViewModel`). Przyjmij propsy `flashcard`, `isOpen`, `onClose`, `onSave`.
6.  **Integracja edycji:** W `FlashcardList`, dodaj stan `editingFlashcardId`. W `onEditClick` w `FlashcardCard`, ustaw ten stan. Renderuj `EditFlashcardDialog` warunkowo, przekazując odpowiednie propsy (`flashcard` znaleziony po ID, `isOpen`, `onClose` resetujący stan, `onSave` wywołujący `PUT /api/flashcards/:id` i aktualizujący stan `flashcards`).
7.  **Utworzenie `DeleteConfirmationDialog`:** Stwórz `src/components/DeleteConfirmationDialog.tsx` używając `AlertDialog` z shadcn/ui. Przyjmij propsy `flashcardId`, `isOpen`, `onClose`, `onConfirm`.
8.  **Integracja usuwania:** W `FlashcardList`, dodaj stan `deletingFlashcardId`. W `onDeleteClick` w `FlashcardCard`, ustaw ten stan. Renderuj `DeleteConfirmationDialog` warunkowo, przekazując propsy (`isOpen`, `onClose` resetujący stan, `onConfirm` wywołujący `DELETE /api/flashcards/:id` i aktualizujący stan `flashcards`).
9.  **(Opcjonalnie) Implementacja paginacji:** Dodaj komponent `PaginationControls`. W `FlashcardList`, obsługuj zmiany strony, wywołując `fetchFlashcards` z nowym parametrem `page` i aktualizując stan `pagination`.
10. **Stylowanie i dostępność:** Dopracuj wygląd siatki, kart i dialogów. Zapewnij zgodność z WCAG.
11. **Testowanie:** Przetestuj ładowanie, wyświetlanie, edycję (sukces/błąd), usuwanie (sukces/błąd), paginację (jeśli zaimplementowana). 