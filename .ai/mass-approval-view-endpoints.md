# Endpointy UI dla widoku Mass Approval

## GET /api/flashcards
**Cel**: Pobieranie listy fiszek do zatwierdzenia

**Parametry zapytania**:
- `source=ai` - filtrowanie po źródle (tylko fiszki AI)
- `status=pending` - filtrowanie po statusie (tylko oczekujące)
- `page` - numer strony (domyślnie: 1)
- `limit` - liczba elementów na stronę (domyślnie: 10)

**Odpowiedź**:
```typescript
{
  flashcards: FlashcardDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
}
```

## POST /api/flashcards/bulk-update
**Cel**: Masowa aktualizacja statusu fiszek (akceptacja/odrzucenie)

**Body**:
```typescript
{
  ids: string[];
  action: "accept" | "reject";
}
```

**Odpowiedź**:
- Status 200: Operacja zakończona sukcesem
- Status 400: Błędne dane wejściowe
- Status 401: Brak autoryzacji
- Status 500: Błąd serwera

## PUT /api/flashcards/:id
**Cel**: Aktualizacja pojedynczej fiszki (edycja treści)

**Parametry URL**:
- `id` - identyfikator fiszki

**Body**:
```typescript
{
  front: string;
  back: string;
}
```

**Odpowiedź**:
- Status 200: Operacja zakończona sukcesem
- Status 400: Błędne dane wejściowe
- Status 401: Brak autoryzacji
- Status 404: Fiszka nie znaleziona
- Status 500: Błąd serwera

## Wykorzystanie w komponentach

### MassApprovalManager
- Używa `GET /api/flashcards` do pobrania listy fiszek
- Używa `POST /api/flashcards/bulk-update` do masowej akceptacji/odrzucenia
- Obsługuje paginację i odświeżanie listy

### FlashcardDetailsDialog
- Używa `PUT /api/flashcards/:id` do aktualizacji treści fiszki
- Obsługuje walidację danych przed wysłaniem
- Wyświetla powiadomienia o sukcesie/błędzie

## Obsługa błędów
Wszystkie endpointy implementują:
- Obsługę błędów HTTP
- Wyświetlanie komunikatów użytkownikowi przez toast
- Aktualizację stanu UI po błędzie
- Możliwość ponowienia akcji

## Uwagi implementacyjne
1. Wszystkie endpointy wymagają autoryzacji (token JWT)
2. Implementacja zakłada istnienie odpowiednich uprawnień użytkownika
3. Endpointy obsługują optymistyczne aktualizacje UI
4. Zaimplementowano proper error handling i recovery
5. Dodano odpowiednie typy TypeScript dla request/response 