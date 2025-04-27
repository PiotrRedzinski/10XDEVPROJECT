# Plan implementacji widoku addCard

## 1. Przegląd
Widok `/addCard` umożliwia użytkownikowi ręczne dodawanie nowych fiszek edukacyjnych do systemu. Składa się z formularza do wprowadzania treści fiszki (przód i tył) oraz przycisku do zapisania nowej fiszki. Widok zapewnia walidację długości wprowadzanych tekstów i resetuje formularz po pomyślnym dodaniu fiszki.

## 2. Routing widoku
- Ścieżka: `/addCard`

## 3. Struktura komponentów
```
AddCardPage (src/pages/addCard.astro)
└── AddCardForm (src/components/AddCardForm.tsx)
    ├── Input (src/components/ui/input.tsx) - dla pola "przód"
    ├── Textarea (src/components/ui/textarea.tsx) - dla pola "tył"
    ├── Button (src/components/ui/button.tsx) - przycisk "Dodaj fiszkę"
    └── FormMessage (internal to AddCardForm) - komunikaty o błędach
```

## 4. Szczegóły komponentów
### AddCardPage
- **Opis komponentu:** Strona Astro (`.astro`) hostująca komponent formularza React. Odpowiada za ustawienie layoutu strony i renderowanie komponentu `AddCardForm`.
- **Główne elementy:** `<Layout>`, `<AddCardForm client:load />`
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych typów dla tej strony.
- **Propsy:** Brak.

### AddCardForm
- **Opis komponentu:** Komponent React (`.tsx`) zawierający logikę formularza do dodawania fiszki. Odpowiada za zarządzanie stanem pól formularza, obsługę wprowadzania danych, walidację i komunikację z API w celu zapisania nowej fiszki.
- **Główne elementy:** `form`, `Input` (dla przodu), `Textarea` (dla tyłu), `Button` (do wysłania), elementy do wyświetlania komunikatów o błędach walidacji (np. `p` lub dedykowany `FormMessage`).
- **Obsługiwane interakcje:**
    - Wprowadzanie tekstu w polach "przód" i "tył".
    - Kliknięcie przycisku "Dodaj fiszkę" (submit formularza).
- **Obsługiwana walidacja:**
    - **Przód:**
        - Wymagane: Tak
        - Maksymalna długość: 220 znaków (zgodnie z API `POST /api/flashcards` i `createFlashcardSchema`)
    - **Tył:**
        - Wymagane: Tak
        - Maksymalna długość: 500 znaków (zgodnie z API `POST /api/flashcards` i `createFlashcardSchema`)
- **Typy:**
    - `CreateFlashcardCommand` (z `src/types.ts`) - do przygotowania danych dla API.
    - `AddCardFormViewModel` (ViewModel):
        ```typescript
        interface AddCardFormViewModel {
          front: string;
          back: string;
          isSubmitting: boolean;
          errors: {
            front?: string;
            back?: string;
            api?: string; // Dla błędów z API
          };
        }
        ```
- **Propsy:** Brak.

## 5. Typy
- **`FlashcardDTO`** (z `src/types.ts`): Używany jako typ odpowiedzi z API po pomyślnym utworzeniu fiszki.
- **`CreateFlashcardCommand`** (z `src/types.ts`): Używany do strukturyzowania danych wysyłanych do API `POST /api/flashcards`.
    ```typescript
    export interface CreateFlashcardCommand {
      front: string; // max 220
      back: string; // max 500
      generation_id?: string | null; // Dla ręcznego tworzenia = null
    }
    ```
- **`AddCardFormViewModel`** (Nowy typ): Reprezentuje stan formularza w komponencie `AddCardForm`.
    ```typescript
    interface AddCardFormViewModel {
      front: string;         // Aktualna wartość pola "przód"
      back: string;          // Aktualna wartość pola "tył"
      isSubmitting: boolean; // Flaga wskazująca, czy formularz jest w trakcie wysyłania
      errors: {              // Obiekt przechowujący błędy walidacji i błędy API
        front?: string;     // Błąd walidacji dla pola "przód"
        back?: string;      // Błąd walidacji dla pola "tył"
        api?: string;       // Ogólny błąd zwrócony przez API
      };
    }
    ```

## 6. Zarządzanie stanem
- Stan formularza (`front`, `back`, `isSubmitting`, `errors`) będzie zarządzany lokalnie w komponencie `AddCardForm` za pomocą hooka `useState` z React.
- Można rozważyć użycie biblioteki do zarządzania formularzami, takiej jak `react-hook-form`, dla uproszczenia walidacji i obsługi stanu, ale dla tak prostego formularza `useState` jest wystarczający.
- Nie ma potrzeby tworzenia dedykowanego custom hooka dla tego widoku.

## 7. Integracja API
- **Endpoint:** `POST /api/flashcards`
- **Cel:** Utworzenie nowej fiszki.
- **Metoda HTTP:** `POST`
- **Typ żądania (Request Body):** `CreateFlashcardCommand`
    ```typescript
    {
      "front": "string (max 220)",
      "back": "string (max 500)",
      "generation_id": null // Ręczne tworzenie
    }
    ```
- **Typ odpowiedzi (Response Body - Success 201):** `FlashcardDTO`
- **Obsługa:** W funkcji obsługującej wysłanie formularza (`onSubmit`), po pomyślnej walidacji po stronie klienta, zostanie wykonane wywołanie `fetch` lub podobnej biblioteki (np. `axios`) do endpointu `POST /api/flashcards`. Stan `isSubmitting` zostanie ustawiony na `true` przed wysłaniem i na `false` po otrzymaniu odpowiedzi (lub błędzie).

## 8. Interakcje użytkownika
1.  **Użytkownik wprowadza tekst w polu "przód":** Stan `front` w `AddCardFormViewModel` jest aktualizowany. Walidacja długości jest wykonywana na bieżąco lub przy utracie focusu/wysyłaniu.
2.  **Użytkownik wprowadza tekst w polu "tył":** Stan `back` w `AddCardFormViewModel` jest aktualizowany. Walidacja długości jest wykonywana.
3.  **Użytkownik klika "Dodaj fiszkę":**
    - Uruchamiana jest funkcja `onSubmit`.
    - Wykonywana jest walidacja pól `front` i `back`.
    - Jeśli walidacja nie przejdzie, wyświetlane są komunikaty o błędach w `errors` i proces jest przerywany.
    - Jeśli walidacja przejdzie:
        - Stan `isSubmitting` jest ustawiany na `true`.
        - Przycisk "Dodaj fiszkę" jest dezaktywowany.
        - Wykonywane jest wywołanie API `POST /api/flashcards`.
        - **Po pomyślnej odpowiedzi (201):**
            - Formularz jest resetowany (pola `front` i `back` są czyszczone, `errors` są czyszczone).
            - Stan `isSubmitting` jest ustawiany na `false`.
            - Opcjonalnie: wyświetlenie komunikatu o sukcesie (np. Toast).
        - **Po błędnej odpowiedzi (400, 401, 500):**
            - Błąd API jest zapisywany w `errors.api`.
            - Stan `isSubmitting` jest ustawiany na `false`.
            - Przycisk "Dodaj fiszkę" jest ponownie aktywowany.
            - Wyświetlany jest komunikat o błędzie API.

## 9. Warunki i walidacja
- **Pole "przód":**
    - **Warunek:** Nie może być puste. Maksymalnie 220 znaków.
    - **Komponent:** `AddCardForm` (walidacja klienta), API (walidacja serwera).
    - **Wpływ na UI:** Wyświetlenie komunikatu błędu pod polem `Input` jeśli warunek niespełniony. Dezaktywacja przycisku "Dodaj fiszkę", jeśli walidacja klienta nie przejdzie.
- **Pole "tył":**
    - **Warunek:** Nie może być puste. Maksymalnie 500 znaków.
    - **Komponent:** `AddCardForm` (walidacja klienta), API (walidacja serwera).
    - **Wpływ na UI:** Wyświetlenie komunikatu błędu pod polem `Textarea`. Dezaktywacja przycisku "Dodaj fiszkę".

## 10. Obsługa błędów
- **Błędy walidacji (klient):** Wyświetlane jako komunikaty inline pod odpowiednimi polami formularza. Błędy są przechowywane w stanie `errors.front` i `errors.back`.
- **Błędy API (np. 400, 500):** Wyświetlane jako ogólny komunikat błędu nad lub pod formularzem. Błąd jest przechowywany w stanie `errors.api`. Należy obsłużyć specyficzne kody błędów (np. 401 - nieautoryzowany, przekierowanie do logowania).
- **Błąd sieci:** Obsługa błędów fetch/axios, wyświetlenie ogólnego komunikatu o problemie z połączeniem.
- **Stan ładowania:** Przycisk "Dodaj fiszkę" powinien być dezaktywowany i/lub wyświetlać wskaźnik ładowania, gdy `isSubmitting` jest `true`.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro:** Stwórz plik `src/pages/addCard.astro`. Zaimportuj i użyj globalnego layoutu. Dodaj komponent `AddCardForm` z dyrektywą `client:load`.
2.  **Utworzenie komponentu React:** Stwórz plik `src/components/AddCardForm.tsx`. Zaimplementuj podstawową strukturę formularza używając komponentów `Input`, `Textarea`, `Button` z `shadcn/ui`.
3.  **Zarządzanie stanem:** W `AddCardForm.tsx` użyj hooka `useState` do zarządzania stanami `front`, `back`, `isSubmitting` i `errors` (zgodnie z `AddCardFormViewModel`).
4.  **Implementacja walidacji:** Dodaj logikę walidacji po stronie klienta dla pól `front` i `back` w funkcji `onSubmit` lub przy zmianie wartości/utracie focusu. Aktualizuj stan `errors`.
5.  **Integracja API:** W funkcji `onSubmit`, po pomyślnej walidacji, dodaj wywołanie `fetch` do `POST /api/flashcards`. Przekaż dane zgodnie z `CreateFlashcardCommand` (`generation_id: null`).
6.  **Obsługa odpowiedzi API:** Obsłuż pomyślną odpowiedź (reset formularza, opcjonalny toast) i błędy (aktualizacja `errors.api`, wyświetlenie komunikatu).
7.  **Obsługa stanu ładowania:** Dezaktywuj przycisk i/lub pokaż wskaźnik ładowania, gdy `isSubmitting` jest `true`.
8.  **Wyświetlanie błędów:** Dodaj elementy UI do wyświetlania błędów walidacji (`errors.front`, `errors.back`) oraz błędów API (`errors.api`).
9.  **Stylowanie i dostępność:** Dopracuj wygląd formularza zgodnie z resztą aplikacji, używając Tailwind/Shadcn. Upewnij się, że formularz jest dostępny (etykiety, atrybuty ARIA).
10. **Testowanie:** Przetestuj różne scenariusze: pomyślne dodanie, błędy walidacji, błędy API, działanie stanu ładowania. 